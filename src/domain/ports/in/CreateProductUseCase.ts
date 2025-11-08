

import { Product } from '../../model/Product';

export interface CreateProductUseCase {
  execute(
    name: string,
    affiliateUrl: string,
    description: string
  ): Promise<Product>;
}
