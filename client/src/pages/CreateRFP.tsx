import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRfp } from '../lib/api';
import { Send, Bot, Loader2, Sparkles, Laptop, Armchair, Cloud } from 'lucide-react';
import { useData } from '../lib/DataContext';

export const CreateRFP: React.FC = () => {
    const { refreshRfps } = useData();
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const navigate = useNavigate();

    const suggestions = [
        {
            icon: <Laptop size={20} />,
            text: "I need 20 high-performance laptops for engineering",
            label: "Hardware"
        },
        {
            icon: <Armchair size={20} />,
            text: " ergonomic office chairs for the new branch",
            label: "Furniture"
        },
        {
            icon: <Cloud size={20} />,
            text: "Enterprise cloud storage solution with 500TB capacity",
            label: "Software"
        }
    ];

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim()) return;

        setLoading(true);
        try {
            const rfp = await createRfp(input);
            await refreshRfps();
            navigate(`/rfp/${rfp.id}`);
        } catch (error) {
            console.error(error);
            alert('Failed to create RFP. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [input]);

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col relative">
            <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-48 overflow-y-auto">
                {/* Hero Section */}
                <div className="text-center space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="relative inline-block">
                        <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200 rotate-3 transition-transform hover:rotate-6">
                            <Bot className="text-white" size={40} />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-yellow-400 p-1.5 rounded-full shadow-sm animate-bounce">
                            <Sparkles size={16} className="text-white" />
                        </div>
                    </div>

                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                            What can I help you procure?
                        </h1>
                        <p className="mt-3 text-lg text-gray-500">
                            Describe your needs, and I'll draft a professional RFP instantly.
                        </p>
                    </div>

                    {/* Suggestions Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 w-full">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => setInput(s.text)}
                                className="group flex flex-col items-start p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all text-left"
                            >
                                <div className="p-2 bg-gray-50 text-gray-600 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors mb-2">
                                    {s.icon}
                                </div>
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{s.label}</span>
                                <p className="text-sm text-gray-600 line-clamp-2">{s.text}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating Input Area */}
            <div className="absolute bottom-6 left-0 right-0 px-4 sm:px-6">
                <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 p-2 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50 transition-all duration-300">
                    <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Describe your requirements (e.g., 'MacBooks for design team with $5k budget')..."
                            className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none p-4 min-h-[60px] max-h-[200px] resize-none text-gray-900 placeholder-gray-400 text-base"
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="mb-2 mr-2 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95 flex-shrink-0"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                        </button>
                    </form>
                </div>
                <div className="text-center mt-3">
                    <p className="text-xs text-gray-400">
                        AI can make mistakes. Please review the generated RFP.
                    </p>
                </div>
            </div>
        </div>
    );
};
