
import React from 'react';
import { Product } from '../../domain/model/Product';
import { marked } from 'marked';

interface SlideInViewerProps {
    product: Product | null;
    onClose: () => void;
}

export const SlideInViewer: React.FC<SlideInViewerProps> = ({ product, onClose }) => {
    const isOpen = !!product;

    const reviewHtml = product?.analysisResult?.finalResult?.copywriting.htmlReview || '';
    const finalHtml = reviewHtml.replace(/\{\{AFFILIATE_LINK\}\}/g, product?.affiliateUrl || '#');

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>
            {/* Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-full md:w-1/2 lg:w-2/5 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {product && (
                    <>
                        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <h2 className="text-2xl font-bold">{product.name}</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-3xl leading-none">&times;</button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-grow">
                            <div className="prose dark:prose-invert max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: marked.parse(finalHtml) as string }} />
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center flex-shrink-0">
                            <a 
                                href={product.affiliateUrl}
                                target="_blank" 
                                rel="noopener noreferrer nofollow"
                                className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold text-lg px-8 py-3 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                            >
                                Check Price & Buy
                            </a>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};
