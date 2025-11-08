
import React, { useState, useEffect, useCallback } from 'react';
import { Product } from '../../domain/model/Product';
import { apiService } from '../services/apiService';
import { ProductList } from '../components/ProductList';
import { ResultsModal } from '../components/ResultsModal';
import { CreateProductForm } from '../components/CreateProductForm';
import { AnalysisResult } from '../../application/ai-orchestrator/types';
import { useNotification } from '../contexts/NotificationContext';

const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotification();
  
  const [activeJob, setActiveJob] = useState<{ productId: string; jobId: string } | null>(null);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const fetchProducts = useCallback(async () => {
    try {
      const fetchedProducts = await apiService.getProducts();
      setProducts(fetchedProducts);
    } catch (e) {
      addNotification('Failed to fetch products.', 'error');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
      setIsLoading(true);
      fetchProducts();
  }, [fetchProducts]);

  const handleCreateProduct = async () => {
      await fetchProducts();
      addNotification('Product added and analysis started!', 'success');
  }

  const handleStartAnalysis = async (productId: string) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product || product.status === 'processing') return;

      const { jobId } = await apiService.triggerAnalysis(productId);
      setActiveJob({ productId, jobId });
      addNotification('Analysis started!', 'info');
      
      // Immediately update UI to show processing state
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: 'processing' } as Product : p));

    } catch (e) {
      const err = e instanceof Error ? e.message : "An unknown error occurred.";
      addNotification(`Failed to start analysis: ${err}`, 'error');
      setActiveJob(null);
    }
  };

  const handleViewResults = (product: Product) => {
      if (product.analysisResult) {
          setSelectedResult(product.analysisResult);
          setIsModalOpen(true);
      }
  };
  
  const handleTogglePublish = async (product: Product) => {
      try {
          const isPublished = product.published;
          const updatedProduct = await apiService.togglePublishProduct(product.id, !isPublished);
          setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
          addNotification(`Product ${updatedProduct.published ? 'published' : 'unpublished'}.`, 'success');
      } catch (err) {
          addNotification(`Failed to update publish status.`, 'error');
      }
  };
  
  // Polling effect for active job status
  useEffect(() => {
    if (!activeJob) return;

    const interval = setInterval(async () => {
      try {
        const { status, result } = await apiService.getAnalysisStatus(activeJob.jobId);
        
        if (status === 'completed' || status === 'failed') {
          clearInterval(interval);
          setActiveJob(null);
          addNotification(`Analysis ${status}!`, status === 'completed' ? 'success' : 'error');
          
          if(result) {
              setSelectedResult(result);
              setIsModalOpen(true);
          }
          await fetchProducts(); // Fetch all products to get final state
        }
      } catch (e) {
        addNotification('Failed to get analysis status.', 'error');
        clearInterval(interval);
        setActiveJob(null);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeJob, fetchProducts, addNotification]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Yclep AI Dashboard</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Your command center for AI-powered affiliate marketing.</p>
      </header>

      <div className="space-y-8">
        <CreateProductForm onProductCreated={handleCreateProduct} />
        
        {isLoading ? (
            <div className="text-center py-10"><p>Loading products...</p></div>
        ) : (
            <ProductList 
                products={products} 
                onStartAnalysis={handleStartAnalysis}
                onViewResults={handleViewResults}
                onTogglePublish={handleTogglePublish}
                activeJobId={activeJob?.jobId || null}
            />
        )}
      </div>

      {isModalOpen && (
        <ResultsModal 
          result={selectedResult} 
          onClose={() => {
              setIsModalOpen(false);
              setSelectedResult(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
