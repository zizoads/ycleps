import { AiProviderPort } from '../providers/AiProviderPort';
import { SeoScoreResult, CompetitorSeoResult, CopywriterResult } from '../types';

export class SeoScoreAgent {
    constructor(private readonly aiProvider: AiProviderPort) {}

    async run(seoData: CompetitorSeoResult, copywritingData: CopywriterResult): Promise<SeoScoreResult> {
        const prompt = `
        As an SEO Expert Agent, your job is to evaluate the SEO quality of a generated product review based on target keywords.

        Target Keywords: ${seoData.keywords.join(', ')}
        
        Generated HTML Content (first 300 chars): 
        ${copywritingData.htmlReview.replace(/<[^>]*>?/gm, '').substring(0, 300)}...

        Analyze how well the content incorporates the keywords.
        Provide an SEO score from 0 to 100, where 100 is perfectly optimized.
        Also, provide a short, single sentence of constructive feedback.
        
        Return a JSON object with 'score' (a number) and 'feedback' (a string).
        
        Example response format:
        {
          "score": 85,
          "feedback": "The primary keyword is well-placed in the title, but long-tail keywords could be integrated more naturally in the body."
        }
        `;

        const response = await this.aiProvider.call(prompt);
         if (!response.success || !response.content) {
            console.error("SeoScoreAgent failed:", response.error);
            return { score: 0, feedback: "Failed to perform SEO score check." };
        }
        try {
            return JSON.parse(response.content) as SeoScoreResult;
        } catch (e) {
            console.error("SeoScoreAgent failed to parse JSON:", e);
            return { score: 0, feedback: "Failed to parse SEO score response." };
        }
    }
}
