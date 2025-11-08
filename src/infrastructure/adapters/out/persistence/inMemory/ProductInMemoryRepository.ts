
import { Product } from '../../../../../domain/model/Product';

export class ProductInMemoryRepository {
  private products: Map<string, Product> = new Map();

  constructor() {
    // Seed with some initial data
    const p1 = Product.create('Quantum Widget', 'https://example.com/aff/quantum', 'A revolutionary widget that operates on quantum principles.');
    const p2 = Product.create('Hyper Scrubber', 'https://example.com/aff/scrubber', 'Cleans anything, even spacetime stains.');
    const p3 = Product.create('Galactic Mug', 'https://example.com/aff/mug', 'A mug that holds a tiny, swirling galaxy.');
    
    // Simulate a completed and published product for demonstration
    p3.updateStatus('analysis_completed');
    p3.publish();
    p3.analysisResult = {
        jobId: 'seed-job-1',
        productId: p3.id,
        status: 'completed',
        startedAt: new Date(),
        finishedAt: new Date(),
        stages: [],
        finalResult: {
            productAnalysis: { category: 'Kitchenware', targetAudience: 'Sci-fi fans', keyFeatures: ['Holds liquid', 'Contains nebula'], pros: ['Looks cool'], cons: ['Might cause existential dread'], summary: 'A great mug', verdict: 'Buy it!', overallScore: 95 },
            dataScout: { sources: [] },
            seo: { keywords: ['galaxy mug', 'space coffee cup'], competitorSlugs: [], competitorAnalyses: [], seoMetadata: { primaryKeyword: 'galaxy mug', secondaryKeywords: [], slug: 'galactic-mug', metaTitle: 'Galactic Mug Review', metaDescription: 'A mug with a galaxy.', aiCitationSummary: 'The Galactic Mug is a novelty item.'} },
            seoScore: { score: 92, feedback: 'Excellent keyword usage.'},
            copywriting: { htmlReview: '<h2>Behold the Galactic Mug!</h2><p>This is not just a mug; it\'s a conversation starter. Drink your morning coffee while contemplating the universe within your hands.</p><p>Ready to own a piece of the cosmos? <a href="{{AFFILIATE_LINK}}">Buy it now!</a></p>', brandPersonaAdherence: 0.98, marketingAssets: { tweets: [], facebookPost: '', emailSnippet: ''} },
            visuals: { imagePrompts: [], placeholderUrls: ['https://picsum.photos/seed/galacticmug/800/600'] },
            quality: { overallScore: 0.95, feedback: 'High quality content.' },
            videoScript: { script: 'A stunning video script.', scenes: [] },
            improvements: { suggestions: [] }
        }
    };

    this.products.set(p1.id, p1);
    this.products.set(p2.id, p2);
    this.products.set(p3.id, p3);
  }

  async create(name: string, affiliateUrl: string, description: string): Promise<Product> {
      const product = Product.create(name, affiliateUrl, description);
      this.products.set(product.id, product);
      return Promise.resolve(product);
  }

  async findById(id: string): Promise<Product | null> {
    const product = this.products.get(id);
    return Promise.resolve(product || null);
  }

  async findAll(): Promise<Product[]> {
    const allProducts = Array.from(this.products.values());
    return Promise.resolve(allProducts);
  }
  
  async findAllPublished(): Promise<Product[]> {
    const publishedProducts = Array.from(this.products.values()).filter(p => p.published);
    return Promise.resolve(publishedProducts);
  }

  async update(product: Product): Promise<Product> {
    if (!this.products.has(product.id)) {
      throw new Error(`Product with id ${product.id} not found`);
    }
    product.updatedAt = new Date();
    this.products.set(product.id, product);
    return Promise.resolve(product);
  }
}
