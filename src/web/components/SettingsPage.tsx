
import React, { useState } from 'react';
import { useAppContext } from '../../App';
import { AiProviderPort } from '../../application/ai-orchestrator/providers/AiProviderPort';

export const SettingsPage: React.FC = () => {
  const { brandPersona, setBrandPersona, aiProviders, setAiProviders, saveSettings } = useAppContext();
  const [saved, setSaved] = useState(false);
  
  const handleSave = () => {
    saveSettings();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  
  const moveProvider = (index: number, direction: 'up' | 'down') => {
    const newProviders = [...aiProviders];
    if (direction === 'up' && index > 0) {
      [newProviders[index], newProviders[index - 1]] = [newProviders[index - 1], newProviders[index]];
    } else if (direction === 'down' && index < newProviders.length - 1) {
      [newProviders[index], newProviders[index + 1]] = [newProviders[index + 1], newProviders[index]];
    }
    setAiProviders(newProviders);
  };


  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">AI Configuration</h2>
        
        <div>
          <label htmlFor="brand-persona" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Brand Persona
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Define the tone and style for the AI copywriter.</p>
          <textarea
            id="brand-persona"
            value={brandPersona}
            onChange={(e) => setBrandPersona(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">AI Provider Failover Priority</h2>
         <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Set the order of AI providers. If the top provider fails, the system will try the next one in the list.</p>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {aiProviders.map((provider, index) => (
            <li key={provider.providerName} className="py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-gray-500 dark:text-gray-400 font-bold">{index + 1}</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{provider.providerName}</span>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => moveProvider(index, 'up')}
                  disabled={index === 0}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                </button>
                <button
                  onClick={() => moveProvider(index, 'down')}
                  disabled={index === aiProviders.length - 1}
                   className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                 <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

       <div className="text-right">
          <button
            onClick={handleSave}
            className={`inline-flex justify-center rounded-md border border-transparent py-2 px-6 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${saved ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'}`}
          >
            {saved ? 'Settings Saved!' : 'Save Settings'}
          </button>
        </div>
    </div>
  );
};
