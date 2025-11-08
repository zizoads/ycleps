
import React from 'react';
import { Product } from '../../domain/model/Product';

interface ProductCardProps {
  product: Product;
  onView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onView }) => {
  const placeholderImage = product.analysisResult?.finalResult?.visuals.placeholderUrls[0] || 'https://picsum.photos/seed/default/400/300';
  
  const shortDescription = product.analysisResult?.finalResult?.copywriting.htmlReview
    ? product.analysisResult.finalResult.copywriting.htmlReview.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...'
    : 'No description available.';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col transition-transform hover:scale-105">
      <img src={placeholderImage} alt={product.name} className="w-full h-48 object-cover" />
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow">{shortDescription}</p>
        <div className="mt-auto">
            <button
                onClick={() => onView(product)}
                className="w-full text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-sm px-4 py-2 text-center transition-colors"
            >
                View AI Review
            </button>
        </div>
      </div>
    </div>
  );
};
