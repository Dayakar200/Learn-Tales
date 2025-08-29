import React, { useState, useEffect, useRef } from 'react';
import type { VyasAIOutput } from '../types';
import { Quiz } from './Quiz';

interface OutputDisplayProps {
    data: VyasAIOutput;
    storyImage: string | null;
    isImageLoading: boolean;
    language: string;
}

const PlayIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
);

const PauseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 6a1 1 0 00-1 1v6a1 1 0 102 0V7a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v6a1 1 0 102 0V7a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);

const RestartIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
    </svg>
);

const SectionCard: React.FC<{ title: string; icon: string; headerAccessory?: React.ReactNode; children: React.ReactNode }> = ({ title, icon, headerAccessory, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 mb-8 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-700 flex items-center">
                <span className="text-3xl mr-3">{icon}</span>
                {title}
            </h2>
            {headerAccessory}
        </div>
        {children}
    </div>
);

const LANGUAGE_CODE_MAP: { [key: string]: string } = {
    "Bengali": "bn-IN",
    "English": "en-US",
    "Gujarati": "gu-IN",
    "Hindi": "hi-IN",
    "Kannada": "kn-IN",
    "Malayalam": "ml-IN",
    "Marathi": "mr-IN",
    "Nepali": "ne-NP",
    "Odia (Oriya)": "or-IN",
    "Punjabi": "pa-IN",
    "Sindhi": "sd-IN",
    "Tamil": "ta-IN",
    "Telugu": "te-IN",
    "Urdu": "ur-IN"
};

const ImagePlaceholder: React.FC = () => (
    <div className="w-full aspect-video bg-slate-200 rounded-lg flex items-center justify-center animate-pulse mb-4">
        <div className="text-center text-slate-500">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="font-semibold">Conjuring a beautiful illustration...</p>
        </div>
    </div>
);


export const OutputDisplay: React.FC<OutputDisplayProps> = ({ data, storyImage, isImageLoading, language }) => {
    const [speechStatus, setSpeechStatus] = useState<'idle' | 'playing' | 'paused'>('idle');
    const [showQuiz, setShowQuiz] = useState(false);
    const [showTakeaways, setShowTakeaways] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    
    // Refs for chunk-based speech synthesis
    const storyChunksRef = useRef<string[]>([]);
    const currentChunkIndexRef = useRef<number>(0);
    
    const isSpeechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

    useEffect(() => {
        if (!isSpeechSupported) return;
        const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
        return () => { window.speechSynthesis.onvoiceschanged = null; };
    }, [isSpeechSupported]);

    useEffect(() => {
        // When a new story is loaded, reset everything.
        if (isSpeechSupported) {
            window.speechSynthesis.cancel();
        }
        setShowQuiz(false);
        setShowTakeaways(false);
        setSpeechStatus('idle');
        currentChunkIndexRef.current = 0;
        
        // Split the story into sentence-based chunks for more reliable playback.
        const chunks = data.story.match(/[^.!?]+[.!?]+/g) ?? [];
        storyChunksRef.current = chunks.map(c => c.trim()).filter(Boolean);

        return () => {
            if (isSpeechSupported) {
                window.speechSynthesis.cancel();
            }
        };
    }, [data, isSpeechSupported]);
    
    const speakChunk = (index: number) => {
        if (!isSpeechSupported || index >= storyChunksRef.current.length) {
            setSpeechStatus('idle'); // Finished all chunks
            return;
        }

        currentChunkIndexRef.current = index;
        const utterance = new SpeechSynthesisUtterance(storyChunksRef.current[index]);

        const languageCode = LANGUAGE_CODE_MAP[language];
        if (languageCode) {
            utterance.lang = languageCode;
            const voiceForLang = voices.find(voice => voice.lang === languageCode && voice.localService) 
                              || voices.find(voice => voice.lang === languageCode)
                              || voices.find(voice => voice.lang.startsWith(languageCode.split('-')[0]));
            if (voiceForLang) {
                utterance.voice = voiceForLang;
            }
        }
        
        utterance.onstart = () => setSpeechStatus('playing');
        
        utterance.onend = () => {
            // Automatically play the next chunk when the current one finishes.
            speakChunk(index + 1);
        };

        utterance.onerror = (event) => {
            console.error("Speech synthesis error:", event.error);
            setSpeechStatus('idle');
        };
        
        window.speechSynthesis.speak(utterance);
    };

    const handlePlayPause = () => {
        if (!isSpeechSupported) return;
        const synth = window.speechSynthesis;

        if (speechStatus === 'playing') {
            synth.pause();
            setSpeechStatus('paused');
        } else if (speechStatus === 'paused') {
            synth.resume();
            setSpeechStatus('playing');
        } else { // 'idle'
            speakChunk(0);
        }
    };

    const handleRestart = () => {
        if (!isSpeechSupported) return;
        window.speechSynthesis.cancel(); // Stop current speech
        
        // A small delay ensures the cancel command is processed before starting new speech.
        setTimeout(() => {
            speakChunk(0);
        }, 100);
    };

    const storySpeakerControls = isSpeechSupported ? (
        <div className="flex items-center space-x-2">
            {(speechStatus === 'playing' || speechStatus === 'paused') && (
                <button
                    onClick={handleRestart}
                    className="p-2 rounded-full hover:bg-amber-100 text-amber-500 transition-colors"
                    aria-label="Restart reading"
                    title="Restart"
                >
                    <RestartIcon />
                </button>
            )}
            <button
                onClick={handlePlayPause}
                className="p-2 rounded-full hover:bg-amber-100 text-amber-500 transition-colors"
                aria-label={speechStatus === 'playing' ? "Pause reading" : "Continue reading"}
                title={speechStatus === 'playing' ? "Pause" : (speechStatus === 'paused' ? "Resume" : "Read Aloud")}
            >
                {speechStatus === 'playing' ? <PauseIcon /> : <PlayIcon />}
            </button>
        </div>
    ) : null;


    return (
        <div className="space-y-8">
            <SectionCard title={`The Story of ${data.scoringModel.topic}`} icon="🎭" headerAccessory={storySpeakerControls}>
                {isImageLoading && <ImagePlaceholder />}
                {storyImage && !isImageLoading && (
                    <img 
                        src={storyImage} 
                        alt={`An illustration for the story about ${data.scoringModel.topic}`} 
                        className="w-full h-auto object-cover aspect-video rounded-lg mb-4 shadow-md animate-fade-in" 
                    />
                )}
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{data.story}</p>
                 <div className="mt-4 flex flex-wrap gap-2">
                    {data.scoringModel.tags.map(tag => (
                        <span key={tag} className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{tag}</span>
                    ))}
                </div>
                {!showQuiz && (
                    <div className="mt-6 text-center">
                        <button 
                            onClick={() => setShowQuiz(true)}
                            className="bg-amber-500 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-transform transform hover:scale-105"
                        >
                           Ready for a Quiz?
                        </button>
                    </div>
                )}
            </SectionCard>

            {showQuiz && (
                <SectionCard title="🧪 Time for a Quiz!" icon="🧪">
                    <Quiz items={data.quiz} onQuizComplete={() => setShowTakeaways(true)} />
                </SectionCard>
            )}

            {showTakeaways && (
                <SectionCard title="📘 Key Takeaways" icon="📘">
                    <ul className="space-y-3">
                        {data.takeaways.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-amber-500 font-bold mr-3">✓</span>
                                <span className="text-slate-600">{item}</span>
                            </li>
                        ))}
                    </ul>
                </SectionCard>
            )}
        </div>
    );
};