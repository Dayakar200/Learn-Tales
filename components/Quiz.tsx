import React, { useState, useEffect } from 'react';
import type { QuizItem } from '../types';

interface QuizProps {
    items: QuizItem[];
    onQuizComplete: () => void;
}

export const Quiz: React.FC<QuizProps> = ({ items, onQuizComplete }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
    const [score, setScore] = useState(0);

    const currentQuestion = items[currentQuestionIndex];
    const answerSelected = selectedAnswers[currentQuestionIndex] !== undefined;

    const handleAnswer = (option: string, optionIndex: number) => {
        if (answerSelected) return;

        const answerLetter = String.fromCharCode(65 + optionIndex);
        setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: answerLetter }));

        if (answerLetter === currentQuestion.correctAnswer) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < items.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };
    
    const getOptionClass = (optionIndex: number) => {
        const optionLetter = String.fromCharCode(65 + optionIndex);
        if (!answerSelected) {
            return "bg-white hover:bg-amber-100 border-slate-300";
        }
        if (optionLetter === currentQuestion.correctAnswer) {
            return "bg-green-100 border-green-500 text-green-800 font-bold";
        }
        if (optionLetter === selectedAnswers[currentQuestionIndex]) {
            return "bg-red-100 border-red-500 text-red-800";
        }
        return "bg-slate-50 border-slate-200 text-slate-500";
    };

    if (!items || items.length === 0) {
        return <p>No quiz questions available.</p>;
    }
    
    const isQuizFinished = currentQuestionIndex === items.length - 1 && answerSelected;
    
    useEffect(() => {
        if (isQuizFinished) {
            // A small delay can feel smoother before revealing the next section.
            const timer = setTimeout(() => {
                onQuizComplete();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isQuizFinished, onQuizComplete]);

    return (
        <div>
            {isQuizFinished && selectedAnswers[items.length - 1] ? (
                <div className="text-center p-6 bg-amber-50 rounded-lg animate-fade-in">
                    <h3 className="text-2xl font-bold text-slate-800">Quiz Complete!</h3>
                    <p className="mt-2 text-lg text-slate-600">You scored</p>
                    <p className="text-5xl font-extrabold text-amber-500 my-2">{score} / {items.length}</p>
                    <p className="text-slate-600">Great job learning today!</p>
                </div>
            ) : (
                <div className="animate-fade-in">
                    <p className="text-sm text-slate-500 mb-2">Question {currentQuestionIndex + 1} of {items.length}</p>
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">{currentQuestion.question}</h3>
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswer(option, index)}
                                disabled={answerSelected}
                                className={`w-full text-left p-3 border rounded-lg transition-colors flex items-center ${getOptionClass(index)}`}
                            >
                                <span className="font-bold mr-3">{String.fromCharCode(65 + index)}.</span>
                                {option}
                            </button>
                        ))}
                    </div>

                    {answerSelected && (
                        <div className="mt-4 p-4 bg-sky-50 border border-sky-200 rounded-lg animate-fade-in">
                            <p className="font-bold text-sky-800">Explanation:</p>
                            <p className="text-sky-700">{currentQuestion.explanation}</p>
                        </div>
                    )}
                    
                    {answerSelected && !isQuizFinished && (
                        <button onClick={handleNext} className="mt-6 w-full bg-amber-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
                           Next Question &rarr;
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};