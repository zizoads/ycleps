import React, { useState, useRef, useEffect } from 'react';
import { apiService } from '../services/apiService';

export const Terminal: React.FC = () => {
    const [lines, setLines] = useState<string[]>(['Welcome to the Yclep AI Diagnostic Terminal.']);
    const [isProcessing, setIsProcessing] = useState(false);
    const terminalBodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Auto-scroll to bottom
        if (terminalBodyRef.current) {
            terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
        }
    }, [lines]);

    const runSimulation = async (event: 'success' | 'fail') => {
        setIsProcessing(true);
        const command = `> SIMULATE_EVENT: ${event.toUpperCase()}`;
        setLines(prev => [...prev, command]);

        try {
            const result = await apiService.runTerminalSimulation(event);
            const resultLines = result.split('\n');
            setLines(prev => [...prev, ...resultLines]);
        } catch (error) {
            setLines(prev => [...prev, 'Error: Simulation failed.']);
        } finally {
            setIsProcessing(false);
        }
    };


    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">System Terminal</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Simulate system events to test the AI Monitor Agent and failover logic.
            </p>
            <div className="bg-black text-white font-mono text-sm rounded-lg p-4 h-80 overflow-y-auto" ref={terminalBodyRef}>
                {lines.map((line, index) => (
                    <div key={index}>
                        <span className="text-green-400 mr-2">$</span>
                        <span>{line}</span>
                    </div>
                ))}
                {isProcessing && <div className="animate-pulse">_</div>}
            </div>
            <div className="mt-4 flex gap-4">
                <button
                    onClick={() => runSimulation('success')}
                    disabled={isProcessing}
                    className="bg-green-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-400"
                >
                    Simulate AI Success
                </button>
                 <button
                    onClick={() => runSimulation('fail')}
                    disabled={isProcessing}
                    className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-red-400"
                >
                    Simulate AI Failover
                </button>
            </div>
        </div>
    );
};
