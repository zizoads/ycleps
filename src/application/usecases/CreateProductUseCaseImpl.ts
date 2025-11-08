import { CreateProductUseCase } from '../../domain/ports/in/CreateProductUseCase';
import { ProductRepositoryPort } from '../../domain/ports/out/ProductRepositoryPort';
import { Product } from '../../domain/model/Product';
import { ProductService } from '../../domain/service/ProductService';

export class CreateProductUseCaseImpl implements CreateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepositoryPort
  ) {}

  async execute(
    name: string,
    affiliateUrl: string,
    description: string
  ): Promise<Product> {
    const product = Product.create(name, affiliateUrl, description);
    
    // Domain services can be used for validation if needed, e.g., URL format validation.
    // const productService = new ProductService();
    // productService.validateAffiliateUrl(product.affiliateUrl);

    return this.productRepository.save(product);
  }
}