

import { Product } from '../../../domain/model/Product';
import { AiProviderPort } from '../providers/AiProviderPort';
import { VisualDesignerResult } from '../types';

export class VisualDesignerAgent {
    constructor(private readonly aiProvider: AiProviderPort) {}

    async run(product: Product): Promise<VisualDesignerResult> {
        const prompt = `
        As a Visual Designer Agent, create image concepts for the product: "${product.name}".
        Description: "${product.description}".
        
        Generate 2 distinct, highly descriptive image prompts suitable for a text-to-image model like Imagen 4.
        The style should be "cinematic, product photography, high-detail".
        
        Also provide 2 placeholder image URLs from picsum.photos.
        
        Return a JSON object with 'imagePrompts' (an array of strings) and 'placeholderUrls' (an array of strings).
        
        Example response format:
        {
          "imagePrompts": [
            "A cinematic shot of the ${product.name} on a marble countertop, with soft morning light filtering through a window.",
            "A dynamic close-up of the ${product.name} in action, showing its core feature with motion blur."
          ],
          "placeholderUrls": ["https://picsum.photos/800/600", "https://picsum.photos/800/600"]
        }
        `;

        const response = await this.aiProvider.call(prompt);
        if (!response.success || !response.content) {
            console.error("VisualDesignerAgent failed:", response.error);
            return { imagePrompts: [], placeholderUrls: [] };
        }
        try {
            const result = JSON.parse(response.content) as VisualDesignerResult;
            // Ensure placeholders are valid
            // FIX: Replaced non-existent `product.slug` with a generated slug from `product.name`.
            result.placeholderUrls = result.placeholderUrls.map((_, i) => `https://picsum.photos/seed/${product.name.replace(/\s+/g, '').toLowerCase()}${i}/800/600`);
            return result;
        } catch (e) {
            console.error("VisualDesignerAgent failed to parse JSON:", e);
            return { imagePrompts: [], placeholderUrls: [] };
        }
    }
}
