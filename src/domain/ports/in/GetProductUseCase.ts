
import { Product } from '../../model/Product';

export interface GetProductUseCase {
  getById(id: string): Promise<Product | null>;
  getAll(): Promise<Product[]>;
}
