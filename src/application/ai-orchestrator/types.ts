// --- Core Status and Task Types ---
export type ContentStatus = 'pending' | 'analyzing' | 'completed' | 'published' | 'failed' | 'stale' | 'draft' | 'generating';
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Task {
  taskId: string;
  status: JobStatus;
  progress: number;
  agent: string;
  result?: any;
  error?: string;
  metrics?: {
    startTime: number;
    endTime?: number;
    durationMs?: number;
  };
}

// --- AI Provider and Orchestration Types ---
export interface AiProviderOptions {
  maxRetries?: number;
  timeoutMs?: number;
}

export interface AiResponse {
  content: string;
  providerUsed: string;
  latencyMs: number;
  tokensUsed?: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

// --- Content Models ---
export interface Article {
    id: string;
    title: string;
    topic: string;
    contentHtml: string;
    status: ContentStatus;
    createdAt: Date;
}

export interface Guide {
    id: string;
    title: string;
    contentHtml: string;
    relatedProductIds: string[];
    status: ContentStatus;
    createdAt: Date;
}


// --- Detailed Analysis Result Types ---

export interface DataScoutResult {
  sources: Array<{ url: string; title: string; confidenceScore: number }>;
}

export interface SeoMetadata {
    primaryKeyword: string;
    secondaryKeywords: string[];
    slug: string;
    metaTitle: string;
    metaDescription: string;
    aiCitationSummary: string; // Summary for other AIs to cite
}

export interface CompetitorAnalysis {
    competitorName: string;
    url: string;
    strengths: string[];
    weaknesses: string[];
}

export interface CompetitorSeoResult {
  keywords: string[];
  competitorSlugs: string[];
  competitorAnalyses: CompetitorAnalysis[];
  seoMetadata: SeoMetadata;
}

export interface SeoScoreResult {
    score: number; // A score from 0 to 100
    feedback: string;
}

export interface CopywriterResult {
  htmlReview: string; // Full HTML document with inline CSS
  brandPersonaAdherence: number;
  marketingAssets: {
      tweets: string[];
      facebookPost: string;
      emailSnippet: string;
  };
}

export interface VisualDesignerResult {
  imagePrompts: string[];
  placeholderUrls: string[];
}

export interface DataQualityResult {
  overallScore: number;
  feedback: string;
}

export interface VideoScriptResult {
    script: string;
    scenes: { scene: number; description: string; dialogue: string; }[];
}

export interface ImprovementSuggesterResult {
    suggestions: { area: 'Title' | 'Description' | 'Pricing' | 'Features' | 'SEO'; suggestion: string; }[];
}

export interface OpportunityResult {
  niche: string;
  productIdeas: { name: string; reason: string; }[];
}

export interface MarketSentinelResult {
    isOutdated: boolean;
    reason: string;
}

// --- Master Analysis Result Object ---
export interface ProductAnalysis {
    category: string;
    targetAudience: string;
    keyFeatures: string[];
    pros: string[];
    cons: string[];
    summary: string;
    verdict: string;
    overallScore: number; // 0-100
}

export interface AnalysisResult {
  jobId: string;
  productId: string;
  status: JobStatus;
  startedAt: Date;
  finishedAt?: Date;
  stages: Array<{ name: string; status: 'completed' | 'failed' | 'running'; durationMs: number; details?: any; error?: string }>;
  finalResult?: {
    productAnalysis: ProductAnalysis;
    dataScout: DataScoutResult;
    seo: CompetitorSeoResult;
    seoScore: SeoScoreResult;
    copywriting: CopywriterResult;
    visuals: VisualDesignerResult;
    quality: DataQualityResult;
    videoScript: VideoScriptResult;
    improvements: ImprovementSuggesterResult;
  };
}
