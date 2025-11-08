import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { Product } from '../../domain/model/Product';

interface QuizModalProps {
    onClose: () => void;
    onResult: (product: Product) => void;
}

const QUESTIONS = [
    "What is the most important factor for you when choosing this type of product?",
    "How do you primarily plan to use this product?"
];

type QuizStep = 'intro' | 'questions' | 'loading' | 'result';

export const QuizModal: React.FC<QuizModalProps> = ({ onClose, onResult }) => {
    const [step, setStep] = useState<QuizStep>('intro');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [result, setResult] = useState<{ recommendation: Product; reason: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const handleNext = () => {
        const newAnswers = [...answers, currentAnswer];
        setAnswers(newAnswers);
        setCurrentAnswer('');
        if (currentQuestion < QUESTIONS.length - 1) {
            setCurrentQuestion(q => q + 1);
        } else {
            submitQuiz(newAnswers);
        }
    };
    
    const submitQuiz = async (finalAnswers: string[]) => {
        setStep('loading');
        setError(null);
        try {
            const res = await apiService.getQuizRecommendation(finalAnswers);
            setResult(res);
            setStep('result');
        } catch (e) {
            setError("Sorry, our AI couldn't find a recommendation right now. Please try again.");
            setStep('questions'); // Go back to let them try again
        }
    };
    
    const handleViewProduct = () => {
        if (result) {
            onResult(result.recommendation);
            onClose();
        }
    };

    const renderContent = () => {
        switch (step) {
            case 'intro':
                return (
                    <div className="text-center">
                        <h3 className="text-xl font-semibold mb-4">Find Your Perfect Product</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Answer a couple of questions and our AI assistant will find the best match for you from our catalog.</p>
                        <button onClick={() => setStep('questions')} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-full hover:bg-indigo-700">Start Quiz</button>
                    </div>
                );
            case 'questions':
                return (
                    <div>
                         <h3 className="text-lg font-semibold mb-2 text-center">{`Question ${currentQuestion + 1}/${QUESTIONS.length}`}</h3>
                         <p className="text-center mb-4">{QUESTIONS[currentQuestion]}</p>
                         <textarea
                            value={currentAnswer}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Your answer here..."
                         />
                         {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                         <div className="mt-6 text-right">
                             <button onClick={handleNext} disabled={!currentAnswer} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-full hover:bg-indigo-700 disabled:bg-indigo-400">Next</button>
                         </div>
                    </div>
                );
            case 'loading':
                 return (
                    <div className="text-center">
                        <h3 className="text-xl font-semibold mb-4">Analyzing your answers...</h3>
                        <p className="text-gray-600 dark:text-gray-400">Our AI is finding the best product for you.</p>
                    </div>
                );
            case 'result':
                return (
                    <div className="text-center">
                        <h3 className="text-xl font-semibold mb-2">We recommend...</h3>
                        <h4 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">{result?.recommendation.name}</h4>
                        <p className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-gray-700 dark:text-gray-300 mb-6">
                           <strong>AI Assistant:</strong> "{result?.reason}"
                        </p>
                        <button onClick={handleViewProduct} className="bg-green-500 text-white font-bold py-2 px-6 rounded-full hover:bg-green-600">View Product</button>
                    </div>
                );
        }
    };


    return (
         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg">
                <div className="flex justify-end p-2">
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-3xl leading-none">&times;</button>
                </div>

                <div className="p-6 pt-0">
                   {renderContent()}
                </div>
            </div>
        </div>
    );
};
