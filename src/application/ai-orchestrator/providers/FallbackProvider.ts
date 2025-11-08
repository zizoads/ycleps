
import { AiProviderPort } from './AiProviderPort';
import { AiProviderOptions, AiResponse } from '../types';

export class FallbackProvider implements AiProviderPort {
  public readonly providerName = 'FallbackMock';

  async call(prompt: string, options?: AiProviderOptions): Promise<AiResponse> {
    const startTime = Date.now();
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 200));
    
    const latencyMs = Date.now() - startTime;
    
    // Return a mock response based on prompt content
    let mockContent = "This is a fallback response.";
    if (prompt.includes("scout data")) {
        mockContent = JSON.stringify({ sources: [{ url: "https://mock.example.com", title: "Mock Source", confidenceScore: 0.85 }] });
    } else if (prompt.includes("competitor SEO")) {
        mockContent = JSON.stringify({ keywords: ["mock keyword 1", "mock keyword 2"], competitorSlugs: ["competitor-a", "competitor-b"] });
    } else if (prompt.includes("copywriting")) {
        mockContent = JSON.stringify({ htmlReview: "<h1>Mock Review</h1><p>This product is truly revolutionary.</p>", brandPersonaAdherence: 0.92 });
    } else if (prompt.includes("visual designer")) {
        mockContent = JSON.stringify({ imagePrompts: ["A mock image of a futuristic gadget on a clean background"], placeholderUrls: ["https://picsum.photos/400/300"] });
    } else if (prompt.includes("quality agent")) {
        mockContent = JSON.stringify({ overallScore: 0.88, feedback: "The generated content is of good quality and aligns with the objectives." });
    }

    return {
      content: mockContent,
      providerUsed: this.providerName,
      latencyMs,
      success: true,
    };
  }
}
