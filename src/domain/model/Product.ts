
import { v4 as uuidv4 } from 'uuid';
import { AnalysisResult } from '../../application/ai-orchestrator/types';

export type ProductStatus = 'draft' | 'published' | 'archived' | 'processing' | 'analysis_completed' | 'analysis_failed';

export class Product {
  id: string;
  name: string;
  description: string;
  affiliateUrl: string;
  status: ProductStatus;
  published: boolean;
  analysisResult: AnalysisResult | null;
  activeTaskId: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    name: string,
    description: string,
    affiliateUrl: string,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.affiliateUrl = affiliateUrl;
    this.status = 'draft';
    this.published = false;
    this.analysisResult = null;
    this.activeTaskId = null;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static create(
    name: string,
    affiliateUrl: string,
    description: string = ''
  ): Product {
    const id = uuidv4();
    return new Product(id, name, description, affiliateUrl);
  }

  updateStatus(newStatus: ProductStatus): void {
      this.status = newStatus;
      this.updatedAt = new Date();
  }

  setAnalysisResult(result: AnalysisResult): void {
      this.analysisResult = result;
      this.updatedAt = new Date();
  }

  setActiveTask(taskId: string | null): void {
      this.activeTaskId = taskId;
      this.updatedAt = new Date();
  }
  
  publish(): void {
      if (this.status === 'analysis_completed') {
          this.published = true;
          this.status = 'published';
          this.updatedAt = new Date();
      } else {
          console.warn(`Cannot publish product in status: ${this.status}`);
          throw new Error('Product cannot be published until analysis is completed.');
      }
  }

  unpublish(): void {
      this.published = false;
      if (this.status === 'published') {
          this.status = 'analysis_completed';
      }
      this.updatedAt = new Date();
  }
}
