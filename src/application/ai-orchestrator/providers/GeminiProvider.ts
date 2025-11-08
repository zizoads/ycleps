
import { GoogleGenAI } from '@google/genai';
import { AiProviderPort } from './AiProviderPort';
import { AiProviderOptions, AiResponse } from '../types';

export class GeminiProvider implements AiProviderPort {
  public readonly providerName = 'Gemini';
  private ai: GoogleGenAI | null = null;

  // FIX: Per coding guidelines, provider should not accept an API key directly.
  constructor() {
  }

  private getAiInstance(): GoogleGenAI {
    if (this.ai) {
      return this.ai;
    }
    // FIX: API key must be obtained exclusively from process.env.API_KEY.
    if (!process.env.API_KEY) {
      throw new Error("Gemini API key is missing. Please ensure it is configured in your environment.");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return this.ai;
  }

  async call(prompt: string, options?: AiProviderOptions): Promise<AiResponse> {
    const startTime = Date.now();
    try {
      const ai = this.getAiInstance();
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });

      const latencyMs = Date.now() - startTime;
      
      return {
        content: response.text,
        providerUsed: this.providerName,
        latencyMs,
        success: true,
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      console.error('Error calling Gemini API:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown Gemini API error';
      return {
        content: '',
        providerUsed: this.providerName,
        latencyMs,
        success: false,
        error: errorMessage,
      };
    }
  }
}
