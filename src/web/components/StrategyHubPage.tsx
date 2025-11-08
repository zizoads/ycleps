import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { OpportunityResult, MarketSentinelResult } from '../../application/ai-orchestrator/types';
import { Product } from '../../domain/model/Product';

export const StrategyHubPage: React.FC<{products: Product[], onProductsUpdated: () => void}> = ({ products, onProductsUpdated }) => {
    const [niche, setNiche] = useState('');
    const [isHunting, setIsHunting] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [opportunityResult, setOpportunityResult] = useState<OpportunityResult | null>(null);
    const [sentinelResults, setSentinelResults] = useState<Record<string, MarketSentinelResult>>({});
    const [error, setError] = useState<string | null>(null);

    const handleHunt = async () => {
        if (!niche) return;
        setIsHunting(true);
        setError(null);
        setOpportunityResult(null);
        try {
            const result = await apiService.runOpportunityHunter(niche);
            setOpportunityResult(result);
        } catch (e) {
            setError('Failed to hunt for opportunities. The AI may be busy.');
        } finally {
            setIsHunting(false);
        }
    };
    
    const handleCheckAll = async () => {
        setIsChecking(true);
        setError(null);
        setSentinelResults({});
        
        const publishedProducts = products.filter(p => p.published);

        // Run checks sequentially to avoid rate-limiting
        for (const product of publishedProducts) {
             try {
                const result = await apiService.runMarketSentinel(product);
                setSentinelResults(prev => ({...prev, [product.id]: result}));
            } catch (e) {
                console.error(`Failed to check product ${product.id}`, e);
                setSentinelResults(prev => ({...prev, [product.id]: { isOutdated: false, reason: 'Check failed.'}}));
            }
        }
        setIsChecking(false);
        onProductsUpdated(); // Refresh the product list to show outdated icons
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            
            {/* Opportunity Hunter */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Opportunity Hunter</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Discover new product trends and affiliate opportunities in a specific niche.</p>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={niche}
                        onChange={(e) => setNiche(e.target.value)}
                        placeholder="e.g., 'smart home office gadgets'"
                        className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button onClick={handleHunt} disabled={isHunting || !niche} className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400">
                        {isHunting ? 'Hunting...' : 'Find Opportunities'}
                    </button>
                </div>
                {opportunityResult && (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold">Opportunities in {opportunityResult.niche}</h3>
                        <ul className="mt-2 space-y-2">
                            {opportunityResult.productIdeas.map((idea, i) => (
                                <li key={i} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <strong className="font-semibold text-gray-800 dark:text-gray-200">{idea.name}:</strong> <span className="text-gray-600 dark:text-gray-400">{idea.reason}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Market Sentinel */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Market Sentinel</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Check all your published products to see if they have become outdated (e.g., a new version has been released).</p>
                <button onClick={handleCheckAll} disabled={isChecking} className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400">
                    {isChecking ? 'Checking...' : `Check ${products.filter(p => p.published).length} Published Products`}
                </button>
                 {Object.keys(sentinelResults).length > 0 && (
                    <div className="mt-6">
                         <h3 className="text-lg font-semibold">Sentinel Report</h3>
                         <ul className="mt-2 space-y-2 text-sm">
                            {products.filter(p => sentinelResults[p.id]).map(p => (
                                <li key={p.id} className={`p-3 rounded-lg ${sentinelResults[p.id].isOutdated ? 'bg-yellow-100 dark:bg-yellow-900/50' : 'bg-green-100 dark:bg-green-900/50'}`}>
                                    <strong className="font-semibold">{p.name}:</strong> {sentinelResults[p.id].reason}
                                </li>
                            ))}
                         </ul>
                    </div>
                )}
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        </div>
    );
};
