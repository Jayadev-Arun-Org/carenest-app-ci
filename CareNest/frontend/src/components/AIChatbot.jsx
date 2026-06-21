import React, { useState, useRef, useEffect } from 'react';
import { askChatbot } from '../services/aiApi';
import { MessageCircle, X, Sparkles, User, Send } from 'lucide-react';

export default function AIChatbot({ patientId }) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hi there! I am your AI Health Assistant. Ask me anything about your prescriptions, appointments, or general health context.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const msg = input;
        setMessages(prev => [...prev, { sender: 'user', text: msg }]);
        setInput('');
        setLoading(true);
        try {
            const res = await askChatbot(msg, patientId);
            setMessages(prev => [...prev, { sender: 'bot', text: res.answer }]);
        } catch (err) {
            setMessages(prev => [...prev, { sender: 'bot', text: "I'm having trouble connecting to the AI service. Please try again later." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!open ? (
                <button 
                    onClick={() => setOpen(true)} 
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-bounce"
                >
                    <MessageCircle className="h-6 w-6" />
                </button>
            ) : (
                <div className="flex flex-col w-80 sm:w-96 h-[500px] max-h-[80vh] rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-4 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">CareNest AI</h3>
                                <p className="text-xs text-indigo-100 opacity-90">Personalized Support</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setOpen(false)}
                            className="rounded-full p-1.5 hover:bg-white/20 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div 
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50"
                    >
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex max-w-[85%] gap-2 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${m.sender === 'user' ? 'bg-teal-100 text-teal-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                        {m.sender === 'user' ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                                    </div>
                                    <div className={`rounded-2xl p-3 text-sm shadow-sm ${m.sender === 'user' ? 'bg-teal-600 text-white rounded-tr-sm' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm'}`}>
                                        {m.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="flex max-w-[85%] gap-2">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                        <Sparkles className="h-4 w-4" />
                                    </div>
                                    <div className="rounded-2xl p-4 bg-white border border-slate-100 rounded-tl-sm flex gap-1 items-center shadow-sm">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-white border-t border-slate-100">
                        <div className="flex items-center gap-2 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                                className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20 pr-12"
                            />
                            <button 
                                onClick={handleSend}
                                disabled={!input.trim() || loading}
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 text-white transition-all hover:bg-teal-600 disabled:opacity-50 disabled:hover:bg-teal-500"
                            >
                                <Send className="h-4 w-4 ml-0.5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
