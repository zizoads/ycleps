
import { GetProductUseCase } from '../../domain/ports/in/GetProductUseCase';
import { ProductRepositoryPort } from '../../domain/ports/out/ProductRepositoryPort';
import { Product } from '../../domain/model/Product';
import { ProductNotFoundError } from '../../domain/exceptions/DomainErrors';

export class GetProductUseCaseImpl implements GetProductUseCase {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async getById(id: string): Promise<Product | null> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      // In a real API, you might throw an error. For the frontend, returning null is often fine.
      // throw new ProductNotFoundError(id);
      return null;
    }
    return product;
  }

  async getAll(): Promise<Product[]> {
    return this.productRepository.findAll();
  }
}
