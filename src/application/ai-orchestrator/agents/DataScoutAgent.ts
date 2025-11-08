
import { Product } from '../../../domain/model/Product';
import { AiProviderPort } from '../providers/AiProviderPort';
import { DataScoutResult } from '../types';

export class DataScoutAgent {
    constructor(private readonly aiProvider: AiProviderPort) {}

    async run(product: Product): Promise<DataScoutResult> {
        const prompt = `
        As a Data Scout Agent, your task is to find relevant, high-quality online sources for the product: "${product.name}".
        Description: "${product.description}".
        
        Search for reviews, official product pages, and technical specifications.
        Return a JSON object with a 'sources' array. Each object in the array should have 'url', 'title', and a 'confidenceScore' (0.0 to 1.0).
        Provide at least 3 sources.
        
        Example response format:
        {
          "sources": [
            { "url": "https://example.com/review", "title": "In-depth review of ${product.name}", "confidenceScore": 0.95 },
            { "url": "https://manufacturer.com/product", "title": "Official Page for ${product.name}", "confidenceScore": 1.0 }
          ]
        }
        `;

        const response = await this.aiProvider.call(prompt);
        if (!response.success || !response.content) {
            console.error("DataScoutAgent failed:", response.error);
            return { sources: [] };
        }
        try {
            return JSON.parse(response.content) as DataScoutResult;
        } catch (e) {
            console.error("DataScoutAgent failed to parse JSON:", e);
            return { sources: [] };
        }
    }
}
