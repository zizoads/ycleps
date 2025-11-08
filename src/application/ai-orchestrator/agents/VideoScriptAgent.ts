
import { Product } from '../../../domain/model/Product';
import { AiProviderPort } from '../providers/AiProviderPort';
import { VideoScriptResult, CopywriterResult } from '../types';

export class VideoScriptAgent {
    constructor(private readonly aiProvider: AiProviderPort) {}

    async run(product: Product, copywriting: CopywriterResult): Promise<VideoScriptResult> {
        const prompt = `
        As a Video Script Agent, create a script for a 15-second vertical video (like TikTok or Reels) about the product "${product.name}".
        The script should be fast-paced and engaging.
        Base the script on the key points from this product review:
        "${copywriting.htmlReview.replace(/<[^>]*>?/gm, '').substring(0, 300)}..."

        The script should have 3-4 short scenes.
        Return a JSON object with 'script' (the full script as a single formatted string) and a 'scenes' array.
        Each scene object should have 'scene' number, 'description', and 'dialogue'.

        Example response format:
        {
          "script": "SCENE 1\\n(Upbeat music starts)\\nVISUAL: Quick shot of the product on a clean background.\\nVOICEOVER: Tired of boring widgets?\\n\\nSCENE 2...",
          "scenes": [
            { "scene": 1, "description": "Quick shot of the ${product.name} on a clean background.", "dialogue": "Tired of boring widgets?" },
            { "scene": 2, "description": "User happily using the product, showing its main feature.", "dialogue": "Meet the ${product.name}! It will change everything." }
          ]
        }
        `;

        const response = await this.aiProvider.call(prompt);
        if (!response.success || !response.content) {
            console.error("VideoScriptAgent failed:", response.error);
            const emptyResult = { script: "Failed to generate script.", scenes: [] };
            return emptyResult;
        }
        try {
            return JSON.parse(response.content) as VideoScriptResult;
        } catch (e) {
            console.error("VideoScriptAgent failed to parse JSON:", e);
            const emptyResult = { script: "Failed to parse script.", scenes: [] };
            return emptyResult;
        }
    }
}
