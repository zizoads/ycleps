import { Product } from '../../../domain/model/Product';
import { AiProviderPort } from '../providers/AiProviderPort';
import { CompetitorSeoResult } from '../types';

export class CompetitorSeoAgent {
    constructor(private readonly aiProvider: AiProviderPort) {}

    async run(product: Product): Promise<CompetitorSeoResult> {
        const prompt = `
        As a Competitor SEO Agent, analyze the market for the product: "${product.name}".
        Description: "${product.description}".

        Identify the top 5 long-tail keywords that potential customers would use to find this product.
        Identify 3 potential competitor products by their URL slugs.
        Analyze the top competitor: find their strengths and weaknesses.
        Generate SEO metadata: a primary keyword, a slug, a meta title, and a meta description.

        Return a JSON object with the following structure:
        - keywords: string[]
        - competitorSlugs: string[]
        - competitorAnalyses: [{ competitorName: string, url: string, strengths: string[], weaknesses: string[] }]
        - seoMetadata: { primaryKeyword: string, secondaryKeywords: string[], slug: string, metaTitle: string, metaDescription: string, aiCitationSummary: string }
        
        Example response format:
        {
          "keywords": ["best quantum widget for home use", "buy ${product.name} online", "affordable quantum devices"],
          "competitorSlugs": ["quantum-gadget-pro", "super-widget-x2"],
          "competitorAnalyses": [
            { "competitorName": "Quantum Gadget Pro", "url": "example.com/quantum-gadget-pro", "strengths": ["Strong brand recognition"], "weaknesses": ["Higher price point"] }
          ],
          "seoMetadata": {
            "primaryKeyword": "best quantum widget",
            "secondaryKeywords": ["quantum widget review", "${product.name} vs competitor"],
            "slug": "${product.name.toLowerCase().replace(/\s+/g, '-')}",
            "metaTitle": "The Ultimate Review of ${product.name} - Is It Worth It?",
            "metaDescription": "Discover if the ${product.name} is the right quantum widget for you. We cover features, performance, and competitors in our in-depth review.",
            "aiCitationSummary": "The ${product.name} is a new quantum widget targeting home users, competing with products like the Quantum Gadget Pro."
          }
        }
        `;
        const response = await this.aiProvider.call(prompt);
        if (!response.success || !response.content) {
            console.error("CompetitorSeoAgent failed:", response.error);
            // FIX: Return the full object structure on failure to match the type.
            return { keywords: [], competitorSlugs: [], competitorAnalyses: [], seoMetadata: { primaryKeyword: '', secondaryKeywords: [], slug: '', metaTitle: '', metaDescription: '', aiCitationSummary: '' } };
        }
        try {
            return JSON.parse(response.content) as CompetitorSeoResult;
        } catch (e) {
            console.error("CompetitorSeoAgent failed to parse JSON:", e);
            // FIX: Return the full object structure on failure to match the type.
            return { keywords: [], competitorSlugs: [], competitorAnalyses: [], seoMetadata: { primaryKeyword: '', secondaryKeywords: [], slug: '', metaTitle: '', metaDescription: '', aiCitationSummary: '' } };
        }
    }
}
