import React from 'react';

const steps = [
    {
        name: 'Data Scout',
        description: 'Our AI scours the web for reviews, specs, and data to form a foundational understanding.',
        icon: '🔍',
    },
    {
        name: 'SEO & Competitor Analysis',
        description: 'It analyzes top competitors and identifies key SEO strategies to ensure the content ranks.',
        icon: '📈',
    },
    {
        name: 'AI Copywriter',
        description: 'A specialized agent writes a compelling, human-like review based on all gathered data.',
        icon: '✍️',
    },
    {
        name: 'Quality Check',
        description: 'A final agent reviews the entire analysis for quality, consistency, and accuracy.',
        icon: '✅',
    }
];

export const InteractiveShowcase: React.FC = () => {
    return (
        <div className="my-16 py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
           <div className="container mx-auto px-4">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">How Our AI Creates Perfect Reviews</h2>
                <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">A multi-agent system ensures comprehensive and high-quality analysis.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {steps.map((step, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
                        <div className="text-5xl mb-4">{step.icon}</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{step.description}</p>
                    </div>
                ))}
            </div>
           </div>
        </div>
    );
};
