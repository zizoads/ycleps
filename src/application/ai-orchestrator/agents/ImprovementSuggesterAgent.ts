

import { Product } from '../../../domain/model/Product';
import { AiProviderPort } from '../providers/AiProviderPort';
import { ImprovementSuggesterResult } from '../types';

export class ImprovementSuggesterAgent {
    constructor(private readonly aiProvider: AiProviderPort) {}

    async run(product: Product): Promise<ImprovementSuggesterResult> {
        // FIX: Removed references to non-existent `price` and `stock` properties from the prompt.
        const prompt = `
        As a Marketing Strategy Agent, analyze the following product information and provide 3 actionable suggestions for improvement.
        Focus on areas like the title, description, and feature presentation.

        Product Name: "${product.name}"
        Description: "${product.description}"

        Return a JSON object with a 'suggestions' array.
        Each object in the array should have an 'area' ('Title', 'Description', or 'Features') and a 'suggestion' (string).

        Example response format:
        {
          "suggestions": [
            { "area": "Title", "suggestion": "Consider adding a power word, like '${product.name} - The Ultimate Solution' to grab more attention." },
            { "area": "Features", "suggestion": "Clearly list the top 3 features as bullet points for easy scanning." },
            { "area": "Description", "suggestion": "Start the description with a question that addresses a common customer pain point." }
          ]
        }
        `;

        const response = await this.aiProvider.call(prompt);
        if (!response.success || !response.content) {
            console.error("ImprovementSuggesterAgent failed:", response.error);
            return { suggestions: [] };
        }
        try {
            return JSON.parse(response.content) as ImprovementSuggesterResult;
        } catch (e) {
            console.error("ImprovementSuggesterAgent failed to parse JSON:", e);
            return { suggestions: [] };
        }
    }
}
