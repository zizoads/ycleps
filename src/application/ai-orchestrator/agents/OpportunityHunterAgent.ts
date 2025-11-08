
import { AiProviderPort } from '../providers/AiProviderPort';
import { OpportunityResult } from '../types';
import { GoogleGenAI } from '@google/genai';

export class OpportunityHunterAgent {
    constructor(private readonly aiProvider: AiProviderPort) {}

    async run(niche: string): Promise<OpportunityResult> {
        const prompt = `
        As a Market Opportunity Hunter AI, your task is to identify emerging trends and specific product opportunities within the "${niche}" niche. 
        Use your knowledge and search capabilities to find what's new and popular.
        
        Identify the overall niche you've explored.
        Then, list 3 concrete product ideas that an affiliate marketer could focus on. For each idea, provide a brief reason why it's a good opportunity right now (e.g., rising demand, new technology, lack of competition).

        Return a JSON object with 'niche' (string) and 'productIdeas' (an array of objects with 'name' and 'reason').
        
        Example for niche "home office gadgets":
        {
          "niche": "Smart Home Office Gadgets",
          "productIdeas": [
            { "name": "AI-powered note-taking devices", "reason": "Increasing demand for productivity tools that automatically transcribe meetings." },
            { "name": "Ergonomic vertical mice with silent clicks", "reason": "Growing awareness of RSI and demand for quiet peripherals in shared spaces." },
            { "name": "Portable 4K monitors for laptops", "reason": "The rise of hybrid work and digital nomads requires high-quality, portable second screens." }
          ]
        }
        `;
        
        // This agent is strategic and needs the latest info, so we use Gemini directly with search grounding
        try {
             const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
             const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                }
             });
             return JSON.parse(response.text) as OpportunityResult;
        } catch (e) {
            console.error("OpportunityHunterAgent failed:", e);
            return { niche, productIdeas: [{ name: 'Error fetching ideas', reason: 'Could not connect to the AI model or parse the response.' }] };
        }
    }
}
