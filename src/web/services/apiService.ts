
import { Product } from '../../domain/model/Product';
import { ProductInMemoryRepository } from '../../infrastructure/adapters/out/persistence/inMemory/ProductInMemoryRepository';
// FIX: Added imports for new types used in mock API methods.
import { AnalysisResult, JobStatus, Article, Guide, OpportunityResult, MarketSentinelResult } from '../../application/ai-orchestrator/types';
import { v4 as uuidv4 } from 'uuid';

// --- In-memory stores to simulate a backend ---
const productRepository = new ProductInMemoryRepository();
const jobStore: Map<string, AnalysisResult> = new Map();
// FIX: Added in-memory stores for articles and guides.
const articlesStore: Map<string, Article> = new Map();
const guidesStore: Map<string, Guide> = new Map();

// Seed some content data
const seedArticle: Article = { id: uuidv4(), title: 'Why Quantum Widgets are the Future', topic: 'Quantum Widgets', contentHtml: '<p>They are very cool and do quantum things.</p>', status: 'published', createdAt: new Date(Date.now() - 1000 * 60 * 5) };
articlesStore.set(seedArticle.id, seedArticle);
const seedGuide: Guide = { id: uuidv4(), title: 'The Ultimate Guide to Hyper Scrubbers', contentHtml: '<h1>Your Guide</h1><p>Start scrubbing the hyper way.</p>', relatedProductIds: [], status: 'published', createdAt: new Date() };
guidesStore.set(seedGuide.id, seedGuide);


// --- API Service (simulating backend endpoints) ---
export const apiService = {
  getProducts: async (): Promise<Product[]> => {
    return productRepository.findAll();
  },

  getPublishedProducts: async (): Promise<Product[]> => {
    return productRepository.findAllPublished();
  },

  createProduct: async (data: { name: string; affiliateUrl: string; description: string }): Promise<Product> => {
    const newProduct = await productRepository.create(data.name, data.affiliateUrl, data.description);
    // Automatically trigger analysis on creation
    apiService.triggerAnalysis(newProduct.id);
    return newProduct;
  },

  triggerAnalysis: async (productId: string): Promise<{ jobId:string }> => {
    const product = await productRepository.findById(productId);
    if (!product) throw new Error('Product not found');
    if (product.status === 'processing') throw new Error('Analysis already in progress');

    const jobId = uuidv4();
    const job: AnalysisResult = {
      jobId,
      productId,
      status: 'running',
      startedAt: new Date(),
      stages: [],
      finalResult: undefined
    };
    jobStore.set(jobId, job);

    // Update product status immediately
    product.updateStatus('processing');
    product.setActiveTask(jobId);
    await productRepository.update(product);

    // --- Simulate the long-running AI analysis ---
    setTimeout(async () => {
      try {
        // Mock analysis result generation
        const mockResult: AnalysisResult = {
            ...job,
            status: 'completed',
            finishedAt: new Date(),
            finalResult: {
                productAnalysis: { category: 'Electronics', targetAudience: 'Tech Enthusiasts', keyFeatures: ['Quantum Entanglement', 'Faster-than-light processing'], pros: ['Extremely fast'], cons: ['May cause paradoxes'], summary: 'A revolutionary device.', verdict: 'A must-buy for early adopters.', overallScore: 92 },
                dataScout: { sources: [{ url: 'https://example.com/review', title: `Review of ${product.name}`, confidenceScore: 0.95 }] },
                seo: { keywords: [`${product.name} review`, `best quantum device`], competitorSlugs: ['competitor-x'], competitorAnalyses: [], seoMetadata: { primaryKeyword: product.name, secondaryKeywords: [], slug: product.name.toLowerCase().replace(/\s/g, '-'), metaTitle: `The Ultimate ${product.name} Review`, metaDescription: `Is the ${product.name} worth it?`, aiCitationSummary: 'A summary for AI.' }},
                seoScore: { score: 88, feedback: 'Good keyword density.' },
                copywriting: { htmlReview: `<h2>Is the ${product.name} Worth It?</h2><p>In a world of incremental upgrades, the ${product.name} feels like a true leap forward. We tested its quantum features and were blown away.</p><h3>Key Features:</h3><ul><li>Feature A</li><li>Feature B</li></ul><p>Ready to upgrade? <a href="{{AFFILIATE_LINK}}" target="_blank" rel="noopener noreferrer">Check the latest price here!</a></p>`, brandPersonaAdherence: 0.9, marketingAssets: { tweets: [], facebookPost: '', emailSnippet: '' } },
                visuals: { imagePrompts: ['A sleek photo of the product'], placeholderUrls: [`https://picsum.photos/seed/${product.id}/800/600`] },
                quality: { overallScore: 0.95, feedback: 'High quality generation.' },
                videoScript: { script: 'A cool video script.', scenes: [] },
                improvements: { suggestions: [{area: 'Title', suggestion: 'Add a power word to the title.'}] }
            }
        };
        jobStore.set(jobId, mockResult);

        // Update the product in the repository with the final result
        const finalProduct = await productRepository.findById(productId);
        if (finalProduct) {
            finalProduct.updateStatus('analysis_completed');
            finalProduct.setAnalysisResult(mockResult);
            finalProduct.setActiveTask(null);
            await productRepository.update(finalProduct);
        }
      } catch (e) {
          job.status = 'failed';
          jobStore.set(jobId, job);
          const finalProduct = await productRepository.findById(productId);
          if (finalProduct) {
              finalProduct.updateStatus('analysis_failed');
              finalProduct.setActiveTask(null);
              await productRepository.update(finalProduct);
          }
      }
    }, 5000); // Simulate a 5-second analysis time

    return { jobId };
  },

  getAnalysisStatus: async (jobId: string): Promise<{ status: JobStatus, result: AnalysisResult | null }> => {
    const job = jobStore.get(jobId);
    if (!job) {
      return { status: 'failed', result: null };
    }
    return { status: job.status, result: job };
  },

  togglePublishProduct: async (productId: string, publish: boolean): Promise<Product> => {
      const product = await productRepository.findById(productId);
      if (!product) throw new Error('Product not found');
      
      if (publish) {
          product.publish();
      } else {
          product.unpublish();
      }
      return productRepository.update(product);
  },

  // FIX: Implemented missing methods.
  getArticles: async (): Promise<Article[]> => {
    return Array.from(articlesStore.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  getGuides: async (): Promise<Guide[]> => {
    return Array.from(guidesStore.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  createArticle: async (topic: string): Promise<Article> => {
    const article: Article = {
      id: uuidv4(),
      title: `Generating: ${topic}`,
      topic,
      contentHtml: '',
      status: 'generating',
      createdAt: new Date(),
    };
    articlesStore.set(article.id, article);

    setTimeout(() => {
      const finishedArticle: Article = {
        ...article,
        title: `A Deep Dive into ${topic}`,
        contentHtml: `<h2>The Rise of ${topic}</h2><p>Here is some compelling AI-generated content about ${topic}. It's truly revolutionary and is set to change the industry as we know it.</p>`,
        status: 'published',
      };
      articlesStore.set(article.id, finishedArticle);
    }, 4000);

    return article;
  },

  createGuide: async (title: string): Promise<Guide> => {
    const guide: Guide = {
      id: uuidv4(),
      title,
      contentHtml: `<h1>${title}</h1><p>This is a placeholder for the guide. You can edit it here.</p>`,
      relatedProductIds: [],
      status: 'draft',
      createdAt: new Date(),
    };
    guidesStore.set(guide.id, guide);
    return guide;
  },

  runOpportunityHunter: async (niche: string): Promise<OpportunityResult> => {
    await new Promise(res => setTimeout(res, 1500));
    return {
      niche: `AI-enhanced ${niche}`,
      productIdeas: [
        { name: 'Smart Toaster with AI', reason: 'Growing demand for connected kitchen appliances.' },
        { name: 'Self-organizing Bookshelf', reason: 'Novelty item with viral potential for book lovers.' },
        { name: 'Personalized Pet Food Dispenser', reason: 'High-value market with focus on pet health.' },
      ]
    };
  },

  runMarketSentinel: async (product: Product): Promise<MarketSentinelResult> => {
    await new Promise(res => setTimeout(res, 1000));
    const isOutdated = Math.random() > 0.8;
    return {
      isOutdated,
      reason: isOutdated ? `The new '${product.name} v2' has been released.` : 'This appears to be the most current version.'
    };
  },

  getAiProductComparison: async (products: Product[]): Promise<string> => {
    await new Promise(res => setTimeout(res, 2000));
    if (products.length < 2) return "## Not enough products to compare.";
    const productNames = products.map(p => p.name).join(' vs ');
    return `
# Comparison: ${productNames}

Here's a quick breakdown from our AI:

| Feature | ${products[0].name} | ${products[1].name} |
|---|---|---|
| **Best For** | Power Users | Beginners |
| **Key Advantage** | More Features | Ease of Use |
| **Price** | Higher | Lower |

## Verdict

For most users, the **${products[1].name}** offers the best value. However, if you need advanced features, the **${products[0].name}** is worth the extra cost.
    `;
  },

  getQuizRecommendation: async (answers: string[]): Promise<{ recommendation: Product; reason: string; }> => {
    await new Promise(res => setTimeout(res, 1500));
    const products = await productRepository.findAllPublished();
    if (products.length === 0) throw new Error("No published products available for recommendation.");
    const recommendation = products[Math.floor(Math.random() * products.length)];
    return {
      recommendation,
      reason: `Based on your answers, I believe the ${recommendation.name} is the perfect fit because it aligns with your need for great value and ease of use.`
    };
  },

  runCommand: async (command: string, context: { navigate: (tab: string) => void }): Promise<string> => {
    await new Promise(res => setTimeout(res, 500));
    const parts = command.toLowerCase().split(' ');
    if (parts.includes('go') && parts.includes('to')) {
      if (parts.includes('strategy')) {
        context.navigate('strategy');
        return "Navigating to Strategy Hub...";
      }
      if (parts.includes('content')) {
        context.navigate('content');
        return "Navigating to Content Hub...";
      }
      if (parts.includes('dashboard')) {
        context.navigate('dashboard');
        return "Navigating to Dashboard...";
      }
    }
    if (parts.includes('add') && parts.includes('product')) {
      return `Command recognized. In a full version, this would add a new product.`;
    }
    return `Unknown command: ${command}`;
  },

  runTerminalSimulation: async (event: 'success' | 'fail'): Promise<string> => {
    await new Promise(res => setTimeout(res, 1000));
    if (event === 'success') {
      return `
EVENT: AI_PROVIDER_HEALTH_CHECK
PROVIDER: Gemini
STATUS: OK
LATENCY: 120ms
... System nominal.
      `;
    } else {
      return `
EVENT: AI_PROVIDER_HEALTH_CHECK
PROVIDER: Gemini
STATUS: FAILED (Timeout)
... Attempting failover...
PROVIDER: FallbackMock
STATUS: OK
LATENCY: 80ms
... System operating on fallback provider.
      `;
    }
  }
};
