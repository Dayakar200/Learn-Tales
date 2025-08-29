import React, { useState } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { OutputDisplay } from './components/OutputDisplay';
import { Spinner } from './components/Spinner';
import { Footer } from './components/Footer';
import type { VyasAIOutput } from './types';
import { generateEducationalContent, generateStoryImage } from './services/geminiService';

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [output, setOutput] = useState<VyasAIOutput | null>(null);
    const [storyImage, setStoryImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentLanguage, setCurrentLanguage] = useState('English');

    const handleSubmit = async (classGrade: string, subject: string, topic: string, language: string) => {
        setIsLoading(true);
        setIsImageLoading(false);
        setError(null);
        setOutput(null);
        setStoryImage(null);
        setCurrentLanguage(language);

        try {
            const result = await generateEducationalContent(classGrade, subject, topic, language);
            setOutput(result);
            setIsLoading(false); // Main content is ready, stop the main spinner

            if (result.image_prompt) {
                setIsImageLoading(true);
                try {
                    const imageUrl = await generateStoryImage(result.image_prompt);
                    setStoryImage(imageUrl);
                } catch (imgErr) {
                    console.error("Image generation failed, but this is non-critical.", imgErr);
                    // We can choose to not show an error to the user for this.
                } finally {
                    setIsImageLoading(false);
                }
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(`Oh no! Something went wrong. ${err.message}. Please try again.`);
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
            setIsLoading(false);
            setIsImageLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-amber-50 text-slate-800 font-sans flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
                    
                    {isLoading && <Spinner />}
                    
                    {error && (
                        <div className="mt-8 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md" role="alert">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}
                    
                    {output && !isLoading && (
                        <div className="mt-8">
                            <OutputDisplay data={output} storyImage={storyImage} isImageLoading={isImageLoading} language={currentLanguage} />
                        </div>
                    )}

                    {!output && !isLoading && !error && (
                         <div className="mt-12 text-center text-slate-500">
                            <img src="https://picsum.photos/400/300?random=1" alt="A friendly illustration representing learning" className="mx-auto rounded-lg shadow-lg mb-6"/>
                            <h2 className="text-2xl font-bold text-slate-700">Ready to Learn Something New?</h2>
                            <p className="mt-2 text-lg">Just tell me what you'd like to learn about above, and I'll create a special story just for you!</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default App;