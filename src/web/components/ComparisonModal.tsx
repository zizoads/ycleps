import React, { useState, useEffect } from 'react';
import { Product } from '../../domain/model/Product';
import { apiService } from '../services/apiService';
import { marked } from 'marked';


export const ComparisonModal: React.FC<{ products: Product[], onClose: () => void }> = ({ products, onClose }) => {
    const [comparisonHtml, setComparisonHtml] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getComparison = async () => {
            if (products.length < 2) return;
            setIsLoading(true);
            try {
                const result = await apiService.getAiProductComparison(products);
                setComparisonHtml(result);
            } catch (error) {
                setComparisonHtml('<p>Sorry, the AI could not generate a comparison at this time.</p>');
            } finally {
                setIsLoading(false);
            }
        };
        getComparison();
    }, [products]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">Product Comparison</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-3xl leading-none">&times;</button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {isLoading ? (
                        <div className="text-center py-10">
                            <p>Our AI is analyzing the products...</p>
                        </div>
                    ) : (
                        <div
                            className="prose dark:prose-invert max-w-none prose-table:w-full prose-td:p-2 prose-th:p-2"
                            dangerouslySetInnerHTML={{ __html: marked.parse(comparisonHtml) as string}}
                        />
                    )}
                </div>

                 <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-right">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Close</button>
                </div>
            </div>
        </div>
    );
};
