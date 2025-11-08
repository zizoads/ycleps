import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/apiService';

interface CommandBarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  navigate: (tab: string) => void;
}

export const CommandBar: React.FC<CommandBarProps> = ({ isOpen, setIsOpen, navigate }) => {
  const [command, setCommand] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCommand('');
      setResponse('');
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command || isLoading) return;

    setIsLoading(true);
    setResponse('');
    try {
      const result = await apiService.runCommand(command, { navigate });
      setResponse(result);
      setCommand('');
      // Close after a successful command
      setTimeout(() => setIsOpen(false), 1500);
    } catch (error) {
      setResponse('An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20" onClick={() => setIsOpen(false)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleCommandSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Type a command (e.g., 'go to content hub')"
            className="w-full bg-transparent p-4 text-lg border-b border-gray-200 dark:border-gray-700 focus:outline-none"
          />
        </form>
        {(isLoading || response) && (
          <div className="p-4 text-sm text-gray-600 dark:text-gray-400">
            {isLoading ? 'Processing...' : `> ${response}`}
          </div>
        )}
         <div className="p-2 bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-500 dark:text-gray-400">
          <strong>Examples:</strong> 'go to strategy', 'add product Quantum Widget v2 with url example.com/qw2'
        </div>
      </div>
    </div>
  );
};
