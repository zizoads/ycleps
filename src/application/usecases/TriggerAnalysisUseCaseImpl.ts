
import { TriggerAnalysisUseCase } from '../../domain/ports/in/TriggerAnalysisUseCase';
import { ProductRepositoryPort } from '../../domain/ports/out/ProductRepositoryPort';
import { ProductNotFoundError, InvalidOperationError } from '../../domain/exceptions/DomainErrors';
import { AiOrchestrator } from '../ai-orchestrator/AiOrchestrator';
import { AnalysisResult, JobStatus } from '../ai-orchestrator/types';

export class TriggerAnalysisUseCaseImpl implements TriggerAnalysisUseCase {
  constructor(
    private readonly productRepository: ProductRepositoryPort,
    private readonly aiOrchestrator: AiOrchestrator
  ) {}

  async execute(productId: string): Promise<{ jobId: string }> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new ProductNotFoundError(productId);
    }
    if (product.status === 'processing') {
      throw new InvalidOperationError(`Analysis is already in progress for product ${productId}.`);
    }
    return this.aiOrchestrator.startAnalysis(productId);
  }

  async getAnalysisStatus(productId: string, jobId: string): Promise<{ status: JobStatus; result: AnalysisResult | null }> {
    // In a real system, you'd validate that the job ID belongs to the product ID
    return this.aiOrchestrator.getAnalysisStatus(jobId);
  }
}
