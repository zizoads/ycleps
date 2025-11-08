
import React, { useState } from 'react';
import { marked } from 'marked';
import { AnalysisResult } from '../../application/ai-orchestrator/types';

interface ResultsModalProps {
  result: AnalysisResult | null;
  onClose: () => void;
}

type Tab = 'summary' | 'copywriting' | 'seo' | 'visuals';


const CircularProgress: React.FC<{ score: number }> = ({ score }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = score > 80 ? 'text-green-500' : score > 50 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="relative flex items-center justify-center w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle
                    className="text-gray-200 dark:text-gray-700"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
                <circle
                    className={`${color} transition-all duration-1000 ease-out`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                />
            </svg>
            <span className="absolute text-2xl font-bold">{score}</span>
        </div>
    );
};


export const ResultsModal: React.FC<ResultsModalProps> = ({ result, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('summary');

  if (!result) return null;

  const finalResult = result.finalResult;

  const renderContent = () => {
    switch(activeTab) {
        case 'summary':
            return (
                <div className="prose dark:prose-invert max-w-none">
                    <h3 className="text-xl font-semibold mb-2">Analysis Summary</h3>
                    <p>Job completed with status: <strong className={result.status === 'completed' ? 'text-green-500' : 'text-red-500'}>{result.status}</strong></p>
                    <p>Total time: {result.finishedAt && result.startedAt ? ((new Date(result.finishedAt).getTime() - new Date(result.startedAt).getTime()) / 1000).toFixed(2) : 'N/A'} seconds</p>
                    <h4 className="font-semibold mt-4">Overall Quality Score</h4>
                    <div className="text-4xl font-bold text-indigo-500">{((finalResult?.quality.overallScore ?? 0) * 100).toFixed(0)}%</div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">{finalResult?.quality.feedback}</p>
                </div>
            );
        case 'copywriting':
            const htmlReview = finalResult?.copywriting.htmlReview ?? '<p>No content generated.</p>';
            return (
                <div>
                     <h3 className="text-xl font-semibold mb-4">AI-Generated Review</h3>
                    <div className="prose dark:prose-invert max-w-none p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800" dangerouslySetInnerHTML={{ __html: marked.parse(htmlReview) as string}}></div>
                </div>
            );
        case 'seo':
             return (
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2">Keywords</h4>
                            <div className="flex flex-wrap gap-2">
                                {finalResult?.seo.keywords.map(kw => <span key={kw} className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">{kw}</span>)}
                            </div>
                        </div>
                         <div>
                            <h4 className="font-semibold mb-2">Competitor Slugs</h4>
                            <ul className="list-disc list-inside">
                                {finalResult?.seo.competitorSlugs.map(slug => <li key={slug}><code className="text-sm">{slug}</code></li>)}
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <h4 className="font-semibold mb-2">SEO Score</h4>
                        <CircularProgress score={finalResult?.seoScore.score ?? 0} />
                        <p className="text-center text-sm mt-2 max-w-xs">{finalResult?.seoScore.feedback}</p>
                    </div>
                </div>
            );
        case 'visuals':
            return (
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold mb-2">Generated Image Prompts</h4>
                        <ul className="list-disc list-inside space-y-2">
                            {finalResult?.visuals.imagePrompts.map((prompt, i) => <li key={i}>{prompt}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2">Placeholder Images</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {finalResult?.visuals.placeholderUrls.map((url, i) => <img key={i} src={url} alt={`Placeholder ${i+1}`} className="rounded-lg shadow-md" />)}
                        </div>
                    </div>
                </div>
            )
        default: return null;
    }
  }

  const tabs: {id: Tab, label: string}[] = [
    {id: 'summary', label: 'Summary'},
    {id: 'copywriting', label: 'AI Review'},
    {id: 'seo', label: 'SEO'},
    {id: 'visuals', label: 'Assets'},
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold">Analysis Results</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-3xl leading-none">&times;</button>
        </div>
        
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {tabs.map(tab => (
                 <button 
                    key={tab.id} 
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === tab.id ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >{tab.label}</button>
            ))}
        </div>

        <div className="p-6 overflow-y-auto">
          {renderContent()}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-right">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Close</button>
        </div>
      </div>
    </div>
  );
};
