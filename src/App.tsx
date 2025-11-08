
import React, { useState, createContext, useContext } from 'react';
import Dashboard from './web/pages/dashboard';
import PublicSite from './web/pages/PublicSite';
import { NotificationProvider } from './web/contexts/NotificationContext';
import { AiProviderPort } from './application/ai-orchestrator/providers/AiProviderPort';
import { GeminiProvider } from './application/ai-orchestrator/providers/GeminiProvider';
import { FallbackProvider } from './application/ai-orchestrator/providers/FallbackProvider';
import { SettingsPage } from './web/components/SettingsPage';


type View = 'dashboard' | 'public';

// FIX: Create an AppContext to provide settings-related state to components like SettingsPage.
interface AppContextType {
  brandPersona: string;
  setBrandPersona: (persona: string) => void;
  aiProviders: AiProviderPort[];
  setAiProviders: (providers: AiProviderPort[]) => void;
  saveSettings: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};


function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [brandPersona, setBrandPersona] = useState(
    'Friendly, helpful, and slightly tech-savvy. Aims to simplify complex topics.'
  );
  const [aiProviders, setAiProviders] = useState<AiProviderPort[]>([
    new GeminiProvider(process.env.API_KEY),
    new FallbackProvider(),
  ]);

  const saveSettings = () => {
    // In a real app, this would persist to localStorage or a backend.
    console.log('Settings saved:', { brandPersona, providers: aiProviders.map(p => p.providerName) });
  };

  const contextValue = {
    brandPersona,
    setBrandPersona,
    aiProviders,
    setAiProviders,
    saveSettings,
  };


  return (
    <AppContext.Provider value={contextValue}>
     <NotificationProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
        <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <span className="font-bold text-xl text-indigo-600 dark:text-indigo-400">Yclep AI</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setCurrentView('public')}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${currentView === 'public' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                           Public Site
                        </button>
                         <button
                            onClick={() => setCurrentView('dashboard')}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${currentView === 'dashboard' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                           Dashboard
                        </button>
                    </div>
                </div>
            </nav>
        </header>
        <main>
          {currentView === 'dashboard' ? <Dashboard /> : <PublicSite />}
        </main>
      </div>
     </NotificationProvider>
    </AppContext.Provider>
  );
}

export default App;
