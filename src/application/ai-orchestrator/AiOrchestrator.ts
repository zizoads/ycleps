import { v4 as uuidv4 } from 'uuid';
import { Product } from '../../domain/model/Product';
import { ProductRepositoryPort } from '../../domain/ports/out/ProductRepositoryPort';
import { AiProviderPort } from './providers/AiProviderPort';
import { AnalysisResult, AiProviderOptions, JobStatus, ProductAnalysis } from './types';
import { DataScoutAgent } from './agents/DataScoutAgent';
import { CompetitorSeoAgent } from './agents/CompetitorSeoAgent';
import { CopywriterAgent } from './agents/CopywriterAgent';
import { VisualDesignerAgent } from './agents/VisualDesignerAgent';
import { DataQualityAgent } from './agents/DataQualityAgent';
import { SentryStub } from '../../infrastructure/providers/logging/SentryStub';
import { VideoScriptAgent } from './agents/VideoScriptAgent';
import { ImprovementSuggesterAgent } from './agents/ImprovementSuggesterAgent';
import { SeoScoreAgent } from './agents/SeoScoreAgent';

// Simple in-memory job store for demonstration
const jobStore: Map<string, AnalysisResult> = new Map();

// A new local agent to handle ProductAnalysis generation.
class ProductAnalysisAgent {
    constructor(private readonly aiProvider: AiProviderPort) {}
    async run(product: Product, copywritingResult: any): Promise<ProductAnalysis> {
        const prompt = `
        As a Product Analyst AI, provide a comprehensive analysis for the product: "${product.name}".
        Description: "${product.description}".
        Based on the following review snippet: "${copywritingResult.htmlReview.replace(/<[^>]*>?/gm, '').substring(0, 300)}..."

        Return a JSON object with the following structure:
        - category: string (e.g., "Kitchenware", "Electronics")
        - targetAudience: string (e.g., "Tech enthusiasts", "Home cooks")
        - keyFeatures: string[] (list of 3-5 key features)
        - pros: string[] (list of 2-3 main advantages)
        - cons: string[] (list of 2-3 main disadvantages)
        - summary: string (a brief one-paragraph summary)
        - verdict: string (a final recommendation, e.g., "A must-buy for...", "Good value, but consider...")
        - overallScore: number (a score from 0 to 100)
        `;
        const response = await this.aiProvider.call(prompt);
        if (!response.success || !response.content) {
            throw new Error("ProductAnalysisAgent failed: " + response.error);
        }
        try {
            return JSON.parse(response.content) as ProductAnalysis;
        } catch (e) {
            console.error("ProductAnalysisAgent failed to parse JSON:", e);
            throw new Error("Failed to parse ProductAnalysisAgent response.");
        }
    }
}


export interface AiOrchestratorConfig {
    providers: AiProviderPort[];
    brandPersona: string;
}

export class AiOrchestrator {
  private providers: AiProviderPort[];
  private brandPersona: string;
  private logger: SentryStub;

  constructor(
    config: AiOrchestratorConfig,
    private readonly productRepository: ProductRepositoryPort
  ) {
    if (config.providers.length === 0) {
      throw new Error('At least one AI provider must be configured.');
    }
    this.providers = config.providers;
    this.brandPersona = config.brandPersona;
    this.logger = new SentryStub(process.env.SENTRY_DSN);
  }
  
  public updateConfig(newConfig: Partial<AiOrchestratorConfig>) {
      if (newConfig.providers) {
          this.providers = newConfig.providers;
      }
      if (newConfig.brandPersona) {
          this.brandPersona = newConfig.brandPersona;
      }
  }

  private async executeWithFailover(
    prompt: string,
    options: AiProviderOptions = { maxRetries: 2, timeoutMs: 15000 }
  ): Promise<AiProviderPort> {
    for (const provider of this.providers) {
      try {
        const response = await provider.call(prompt, options);
        if (response.success) {
          return provider;
        } else {
           this.logger.captureException(new Error(response.error), { provider: provider.providerName, prompt });
        }
      } catch (error) {
        this.logger.captureException(error, { provider: provider.providerName, prompt });
      }
    }
    throw new Error('All AI providers failed to respond.');
  }

  public async startAnalysis(productId: string): Promise<{ jobId: string }> {
    const jobId = uuidv4();
    const job: AnalysisResult = {
      jobId,
      productId,
      status: 'pending',
      startedAt: new Date(),
      stages: [],
      finalResult: undefined
    };
    jobStore.set(jobId, job);

    this.runAnalysis(jobId, productId);
    return { jobId };
  }
  
  private async runAnalysis(jobId: string, productId: string): Promise<void> {
    const job = jobStore.get(jobId);
    if (!job) return;
    let product: Product | null = null;

    try {
        job.status = 'running';
        product = await this.productRepository.findById(productId);
        if (!product) throw new Error(`Product ${productId} not found`);

        product.updateStatus('processing');
        await this.productRepository.update(product);

        const runStage = async <T,>(name: string, agentRunner: () => Promise<T>): Promise<T> => {
            const startTime = Date.now();
            job.stages.push({ name, status: 'running', durationMs: 0 });
            try {
                const result = await agentRunner();
                const currentStage = job.stages.find(s => s.name === name && s.status === 'running')!;
                currentStage.status = 'completed';
                currentStage.durationMs = Date.now() - startTime;
                currentStage.details = result;
                jobStore.set(jobId, job); // Update job store after each stage
                return result;
            } catch(e) {
                const error = e instanceof Error ? e : new Error(String(e));
                const currentStage = job.stages.find(s => s.name === name && s.status === 'running')!;
                currentStage.status = 'failed';
                currentStage.durationMs = Date.now() - startTime;
                currentStage.error = error.message;
                this.logger.captureException(error, { jobId, productId, stage: name });
                jobStore.set(jobId, job);
                throw e;
            }
        };

        const primaryProvider = await this.executeWithFailover("Initial connectivity check");

        const dataScoutAgent = new DataScoutAgent(primaryProvider);
        const scoutResult = await runStage('Data Scouting', () => dataScoutAgent.run(product!));

        const seoAgent = new CompetitorSeoAgent(primaryProvider);
        const seoResult = await runStage('Competitor SEO Analysis', () => seoAgent.run(product!));
        
        const copywriterAgent = new CopywriterAgent(primaryProvider);
        const copywritingResult = await runStage('Copywriting', () => copywriterAgent.run(product!, scoutResult, this.brandPersona));
        
        const productAnalysisAgent = new ProductAnalysisAgent(primaryProvider);
        const productAnalysisResult = await runStage('Product Analysis', () => productAnalysisAgent.run(product!, copywritingResult));

        const seoScoreAgent = new SeoScoreAgent(primaryProvider);
        const seoScoreResult = await runStage('SEO Scoring', () => seoScoreAgent.run(seoResult, copywritingResult));

        const visualDesignerAgent = new VisualDesignerAgent(primaryProvider);
        const visualResult = await runStage('Visual Design Concepts', () => visualDesignerAgent.run(product!));
        
        const videoScriptAgent = new VideoScriptAgent(primaryProvider);
        const videoResult = await runStage('Video Script Generation', () => videoScriptAgent.run(product!, copywritingResult));
        
        const improvementAgent = new ImprovementSuggesterAgent(primaryProvider);
        const improvementResult = await runStage('Improvement Suggestions', () => improvementAgent.run(product!));
        
        const dataQualityAgent = new DataQualityAgent(primaryProvider);
        const qualityResult = await runStage('Final Quality Check', () => dataQualityAgent.run({ seo: seoResult, copywriting: copywritingResult, visuals: visualResult }));

        job.finalResult = {
            productAnalysis: productAnalysisResult,
            dataScout: scoutResult,
            seo: seoResult,
            seoScore: seoScoreResult,
            copywriting: copywritingResult,
            visuals: visualResult,
            quality: qualityResult,
            videoScript: videoResult,
            improvements: improvementResult,
        };
        job.status = 'completed';
        product.updateStatus('analysis_completed');
        product.setAnalysisResult(job); // Persist the result to the product
        await this.productRepository.update(product);

    } catch(error) {
        job.status = 'failed';
        if(product) {
            product.updateStatus('analysis_failed');
            await this.productRepository.update(product);
        }
    } finally {
        job.finishedAt = new Date();
        jobStore.set(jobId, job);
    }
  }

  public async getAnalysisStatus(jobId: string): Promise<{ status: JobStatus; result: AnalysisResult | null }> {
    const job = jobStore.get(jobId);
    if (!job) {
      return { status: 'failed', result: null };
    }
    return { status: job.status, result: job };
  }
}