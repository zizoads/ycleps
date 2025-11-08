import React, { useState, useEffect, useCallback } from 'react';
import { Article, Guide } from '../../application/ai-orchestrator/types';
import { apiService } from '../services/apiService';
import { useNotification } from '../contexts/NotificationContext';

export const ContentHubPage: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [guides, setGuides] = useState<Guide[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [articleTopic, setArticleTopic] = useState('');
    const [guideTitle, setGuideTitle] = useState('');
    const { addNotification } = useNotification();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [fetchedArticles, fetchedGuides] = await Promise.all([
                apiService.getArticles(),
                apiService.getGuides(),
            ]);
            setArticles(fetchedArticles);
            setGuides(fetchedGuides);
        } catch (error) {
            addNotification("Failed to fetch content.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [addNotification]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll for updates on generating content
        return () => clearInterval(interval);
    }, [fetchData]);
    
    const handleCreateArticle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!articleTopic) return;
        try {
            await apiService.createArticle(articleTopic);
            setArticleTopic('');
            addNotification("Article generation started!", "success");
            fetchData();
        } catch (error) {
            addNotification("Failed to start article generation.", "error");
        }
    };
    
    const handleCreateGuide = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!guideTitle) return;
         try {
            await apiService.createGuide(guideTitle);
            setGuideTitle('');
            addNotification("Guide created successfully!", "success");
            fetchData();
        } catch (error) {
            addNotification("Failed to create guide.", "error");
        }
    };

    if (isLoading && articles.length === 0) {
        return <div>Loading content...</div>;
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Create Content Forms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                     <h2 className="text-2xl font-bold mb-4">Generate New Article</h2>
                     <form onSubmit={handleCreateArticle} className="flex gap-2">
                         <input type="text" value={articleTopic} onChange={e => setArticleTopic(e.target.value)} placeholder="Enter article topic..." className="flex-grow rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                         <button type="submit" className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400" disabled={!articleTopic}>Generate</button>
                     </form>
                 </div>
                 <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                     <h2 className="text-2xl font-bold mb-4">Create New Guide</h2>
                      <form onSubmit={handleCreateGuide} className="flex gap-2">
                         <input type="text" value={guideTitle} onChange={e => setGuideTitle(e.target.value)} placeholder="Enter guide title..." className="flex-grow rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                         <button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400" disabled={!guideTitle}>Create</button>
                     </form>
                 </div>
            </div>

            {/* Content Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">Generated Articles</h2>
                    <ul className="space-y-2">
                        {articles.map(article => (
                            <li key={article.id} className="p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 flex justify-between items-center">
                                <span>{article.title}</span>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${article.status === 'generating' ? 'bg-yellow-200 text-yellow-800 animate-pulse' : 'bg-gray-200 text-gray-800'}`}>{article.status}</span>
                            </li>
                        ))}
                    </ul>
                 </div>
                  <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">Buying Guides</h2>
                     <ul className="space-y-2">
                        {guides.map(guide => (
                            <li key={guide.id} className="p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 flex justify-between items-center">
                                <span>{guide.title}</span>
                                 <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-800">{guide.status}</span>
                            </li>
                        ))}
                    </ul>
                 </div>
            </div>
        </div>
    );
};
