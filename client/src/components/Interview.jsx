import { useState, useEffect } from 'react';
import { Bot, Mic, BookOpen, ArrowRight, AlertTriangle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import LiveAssist from './interview/LiveAssist';
import PracticeInterview from './interview/PracticeInterview';
import ModeCard from './interview/ModeCard';

const Interview = () => {
    // Mode State: 'selection', 'live-assist', 'mock-active'
    const [view, setView] = useState(() => localStorage.getItem('interviewStep') || 'selection');

    // Default Mock Interview State (will be refined in chat)
    const [config, setConfig] = useState(() => {
        const savedConfig = localStorage.getItem('interviewConfig');
        return savedConfig ? JSON.parse(savedConfig) : {
            type: 'Technical',
            difficulty: 'Medium'
        };
    });

    // Persist State
    useEffect(() => {
        localStorage.setItem('interviewStep', view);
        localStorage.setItem('interviewConfig', JSON.stringify(config));
    }, [view, config]);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const res = await fetch('http://localhost:5000/api/profile', {
                    headers: { 'x-auth-token': token }
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                }
            } catch (err) {
                console.error("Failed to fetch profile:", err);
            }
        };
        fetchProfile();
    }, []);

    // RENDER: LIVE ASSIST MODE
    if (view === 'live-assist') {
        return (
            <LiveAssist
                profile={profile}
                config={config}
                onExit={() => setView('selection')}
            />
        );
    }

    // RENDER: MOCK INTERVIEW CHAT (Refined UI)
    if (view === 'mock-active') {
        return (
            <PracticeInterview
                profile={profile}
                config={config}
                onExit={() => setView('selection')}
            />
        );
    }

    // RENDER: MODE SELECTION (Home)
    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col justify-center p-6">
            <div className="flex items-center justify-center gap-6 mb-16">
                <div className="p-3 bg-blue-600/10 rounded-2xl">
                    <Sparkles className="w-10 h-10 text-blue-400" />
                </div>
                <h2 className="text-5xl font-bold text-white tracking-tight">
                    Interview <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Mastery</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Option 1: Live Assist */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-10 relative overflow-hidden group cursor-pointer hover:bg-gray-800/60 transition-all shadow-2xl"
                    onClick={() => setView('live-assist')}
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:rotate-12">
                        <Mic className="w-40 h-40" />
                    </div>

                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 text-blue-400 border border-blue-500/20">
                        <Mic className="w-8 h-8" />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-4">Live Assistant</h3>
                    <p className="text-gray-400 mb-8 leading-relaxed h-24">
                        Instant support during your actual interviews. Speech recognition listens and provides real-time intelligent answer suggestions.
                    </p>

                    <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4 mb-8">
                        <p className="text-yellow-500/80 text-xs font-medium flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            Suggestions only. Does not speak for you.
                        </p>
                    </div>

                    <div className="flex items-center text-blue-400 font-bold group-hover:translate-x-2 transition-transform uppercase tracking-wider text-sm">
                        Launch Copilot <ArrowRight className="w-5 h-5 ml-2" />
                    </div>
                </motion.div>

                {/* Option 2: Mock Interview */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-10 relative overflow-hidden group cursor-pointer hover:bg-gray-800/60 transition-all shadow-2xl"
                    onClick={() => setView('mock-active')}
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:-rotate-12">
                        <BookOpen className="w-40 h-40" />
                    </div>

                    <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-8 text-purple-400 border border-purple-500/20">
                        <Bot className="w-8 h-8" />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-4">Practice Mode</h3>
                    <p className="text-gray-400 mb-8 leading-relaxed h-24">
                        Realistic mock interviews tailored to your stack. Receive instant feedback, performance scoring, and detailed improvements.
                    </p>

                    <ul className="space-y-3 mb-8 text-sm text-gray-500">
                        <li className="flex items-center gap-3">
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                            Custom Tech Stack Scenarios
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                            Detailed Performance Feedback
                        </li>
                    </ul>

                    <div className="flex items-center text-purple-400 font-bold group-hover:translate-x-2 transition-transform uppercase tracking-wider text-sm">
                        Start Session <ArrowRight className="w-5 h-5 ml-2" />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Interview;
