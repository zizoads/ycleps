
import { Product } from '../../../domain/model/Product';
import { AiProviderPort } from '../providers/AiProviderPort';
import { MarketSentinelResult } from '../types';
import { GoogleGenAI } from '@google/genai';

export class MarketSentinelAgent {
    constructor(private readonly aiProvider: AiProviderPort) {}

    async run(product: Product): Promise<MarketSentinelResult> {
        const prompt = `
        As a Market Sentinel AI, your job is to check if the product "${product.name}" is still the current, relevant version available on the market.
        Has a newer model been released (e.g., a "Pro" version, a "2" or "3" model, a version for the current year)?
        
        Use search to find the latest information.
        
        Answer with a simple JSON object containing 'isOutdated' (boolean) and a brief 'reason' (string).
        If it's outdated, the reason should mention the newer product. If it's not, the reason should confirm it's still current.

        Example for an outdated product:
        {
            "isOutdated": true,
            "reason": "The 'Quantum Widget 2' has been released, making this version the previous generation."
        }

        Example for a current product:
        {
            "isOutdated": false,
            "reason": "This appears to be the most current version of the product available."
        }
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                }
            });
            return JSON.parse(response.text) as MarketSentinelResult;
        } catch (e) {
            console.error("MarketSentinelAgent failed:", e);
            return { isOutdated: false, reason: 'Could not perform the check due to an error.' };
        }
    }
}
