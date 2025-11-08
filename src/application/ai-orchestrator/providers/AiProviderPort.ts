
import { AiProviderOptions, AiResponse } from '../types';

export interface AiProviderPort {
  readonly providerName: string;
  call(prompt: string, options?: AiProviderOptions): Promise<AiResponse>;
}
