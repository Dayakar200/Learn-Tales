import React, { useState } from 'react';

interface InputFormProps {
    onSubmit: (classGrade: string, subject: string, topic:string, language: string) => void;
    isLoading: boolean;
}

const subjects = ["Science", "Mathematics", "English", "Social Studies", "History", "Geography", "General Knowledge"];
const languages = [
    "Bengali",
    "English",
    "Gujarati",
    "Hindi",
    "Kannada",
    "Malayalam",
    "Marathi",
    "Nepali",
    "Odia (Oriya)",
    "Punjabi",
    "Sindhi",
    "Tamil",
    "Telugu",
    "Urdu"
];


export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
    const [classGrade, setClassGrade] = useState('Class 4');
    const [subject, setSubject] = useState('Science');
    const [language, setLanguage] = useState('English');
    const [topic, setTopic] = useState('Photosynthesis');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(topic.trim()){
            onSubmit(classGrade, subject, topic, language);
        }
    };

    const inputStyle = "w-full p-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-150 ease-in-out";

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div>
                    <label htmlFor="classGrade" className="block text-sm font-medium text-slate-600 mb-1">Class</label>
                    <select id="classGrade" value={classGrade} onChange={(e) => setClassGrade(e.target.value)} className={inputStyle}>
                        {[...Array(7)].map((_, i) => (
                            <option key={i + 1} value={`Class ${i + 1}`}>Class {i + 1}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-600 mb-1">Subject</label>
                     <select id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className={inputStyle}>
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="language" className="block text-sm font-medium text-slate-600 mb-1">Language</label>
                    <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)} className={inputStyle}>
                        {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-slate-600 mb-1">Topic</label>
                    <input type="text" id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} className={inputStyle} placeholder="e.g., Photosynthesis" required />
                </div>
                <div className="sm:col-span-2 lg:col-span-4">
                     <button type="submit" disabled={isLoading || !topic.trim()} className="w-full bg-amber-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition duration-150 ease-in-out disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center">
                        {isLoading ? 'Creating Magic...' : 'Generate Story'}
                    </button>
                </div>
            </form>
        </div>
    );
};