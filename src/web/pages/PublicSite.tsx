
import React, { useState, useEffect } from 'react';
import { Product } from '../../domain/model/Product';
import { apiService } from '../services/apiService';
import { ProductCard } from '../components/ProductCard';
import { SlideInViewer } from '../components/SlideInViewer';

const PublicSite: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchPublishedProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedProducts = await apiService.getPublishedProducts();
        setProducts(fetchedProducts);
      } catch (e) {
        setError('Could not load products at this time.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPublishedProducts();
  }, []);
  
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
  };
  
  const handleCloseViewer = () => {
    setSelectedProduct(null);
  };

  if (isLoading) {
    return <div className="text-center p-10">Loading awesome products...</div>;
  }
  
  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
        <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">AI-Powered Product Reviews</h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Hand-picked products, reviewed by our smart AI to help you choose.</p>
        </div>
      
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(product => (
            <ProductCard 
                key={product.id} 
                product={product} 
                onView={handleViewProduct}
                />
            ))}
        </div>
      ) : (
          <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg">
              <h3 className="text-xl font-semibold">Coming Soon!</h3>
              <p className="text-gray-500 mt-2">Our AI is busy analyzing new products. Check back later for our reviews.</p>
          </div>
      )}

      <SlideInViewer product={selectedProduct} onClose={handleCloseViewer} />
    </div>
  );
};

export default PublicSite;
