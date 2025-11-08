
import React, { useState } from 'react';
import { apiService } from '../services/apiService';

interface CreateProductFormProps {
    onProductCreated: () => void;
}

export const CreateProductForm: React.FC<CreateProductFormProps> = ({ onProductCreated }) => {
  const [name, setName] = useState('');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !affiliateUrl) return;

    setIsCreating(true);
    setError(null);
    try {
      await apiService.createProduct({
        name,
        affiliateUrl,
        description,
      });
      setName('');
      setAffiliateUrl('');
      setDescription('');
      onProductCreated();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to create product: ${errorMsg}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Add New Affiliate Product</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Add a product to the pipeline. Our AI will automatically begin a full analysis upon creation.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Product Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              placeholder="e.g., Quantum Widget Pro"
            />
          </div>
          <div>
            <label htmlFor="affiliateUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Affiliate URL
            </label>
            <input
              type="url"
              id="affiliateUrl"
              value={affiliateUrl}
              onChange={(e) => setAffiliateUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              placeholder="https://example.com/product?tag=your-id"
            />
          </div>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Brief Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="A short note for the AI, e.g., 'Focus on its benefits for home users'"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="text-right">
          <button
            type="submit"
            disabled={isCreating}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Adding...' : 'Add & Analyze'}
          </button>
        </div>
      </form>
    </div>
  );
};
