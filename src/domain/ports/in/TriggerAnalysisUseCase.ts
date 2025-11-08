
import { AnalysisResult, JobStatus } from '../../../application/ai-orchestrator/types';

export interface TriggerAnalysisUseCase {
    execute(productId: string): Promise<{ jobId: string }>;
    getAnalysisStatus(productId: string, jobId: string): Promise<{ status: JobStatus; result: AnalysisResult | null }>;
}
