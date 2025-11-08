import { Product } from '../../../domain/model/Product';
import { AiProviderPort } from '../providers/AiProviderPort';
import { CopywriterResult } from '../types';
import { DataScoutResult } from '../types';

export class CopywriterAgent {
    constructor(private readonly aiProvider: AiProviderPort) {}

    async run(product: Product, groundingData: DataScoutResult, brandPersona: string): Promise<CopywriterResult> {
        const prompt = `
        As a professional Copywriter Agent specializing in affiliate marketing, write a compelling HTML product review for: "${product.name}".
        Our brand persona is: "${brandPersona}"
        
        Product Description provided by user: "${product.description}".
        
        Use the following grounding data to make the review credible and informative:
        ${groundingData.sources.map(s => `- ${s.title}: ${s.url}`).join('\n')}

        The review should be structured to maximize conversions. It must include:
        1. An engaging <h2> title.
        2. At least two <p> paragraphs explaining the product's benefits and solving a user's problem.
        3. A <ul> with 3-5 key features or benefits.
        4. A strong call-to-action (CTA) paragraph encouraging the user to click the affiliate link.
        5. IMPORTANT: Use the exact placeholder "{{AFFILIATE_LINK}}" for the href in any links.

        Also, generate marketing assets: an array of 2 short tweets, a Facebook post, and an email snippet.

        Return a JSON object with 'htmlReview' (a string of HTML), 'brandPersonaAdherence' (a score from 0.0 to 1.0), and 'marketingAssets' (an object with 'tweets', 'facebookPost', and 'emailSnippet').
        
        Example response format:
        {
          "htmlReview": "<h2>The ${product.name} is Here to Change Everything!</h2><p>We've seen a lot of gadgets, but this one is special...</p><ul><li>Feature 1</li></ul><p>Ready to get yours? <a href='{{AFFILIATE_LINK}}'>Click here to check the latest price!</a></p>",
          "brandPersonaAdherence": 0.95,
          "marketingAssets": {
              "tweets": ["Just checked out the ${product.name} and wow! 🤯 #gadget #review", "If you're looking for a new widget, the ${product.name} is a game changer. Read our review!"],
              "facebookPost": "We got our hands on the new ${product.name} and it did not disappoint. Our full review is up on the blog - find out why this might be the best gadget of the year. Link in bio!",
              "emailSnippet": "Hey [Name], you're not going to want to miss our latest review on the ${product.name}. It's packed with features that..."
          }
        }
        `;
        const response = await this.aiProvider.call(prompt);
        if (!response.success || !response.content) {
            console.error("CopywriterAgent failed:", response.error);
            // FIX: Return the full object structure on failure to match the type.
            return { htmlReview: '<p>Error generating review.</p>', brandPersonaAdherence: 0, marketingAssets: { tweets: [], facebookPost: '', emailSnippet: ''} };
        }
        try {
            return JSON.parse(response.content) as CopywriterResult;
        } catch (e) {
            console.error("CopywriterAgent failed to parse JSON:", e);
            // FIX: Return the full object structure on failure to match the type.
             return { htmlReview: '<p>Error parsing review.</p>', brandPersonaAdherence: 0, marketingAssets: { tweets: [], facebookPost: '', emailSnippet: ''} };
        }
    }
}
