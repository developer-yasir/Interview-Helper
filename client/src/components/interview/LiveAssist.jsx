import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Copy, AlertTriangle, Activity, Volume2, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';

const LiveAssist = ({ onExit }) => {
    const { isListening, transcript, startListening, stopListening, resetTranscript, hasSupport } = useSpeechRecognition();
    const [suggestions, setSuggestions] = useState({
        neutral: "Waiting for interviewer's question...",
        confident: "Ready to provide strong answers...",
        technical: "Listening for technical keywords..."
    });
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [lastProcessedLength, setLastProcessedLength] = useState(0);

    // Auto-fetch suggestions when transcript changes significantly
    useEffect(() => {
        if (!isListening) return;

        // processing logic: wait for a pause or sufficient length
        const timer = setTimeout(() => {
            if (transcript.length - lastProcessedLength > 20) {
                fetchSuggestions(transcript);
                setLastProcessedLength(transcript.length);
            }
        }, 2000); // 2-second delay before creating suggestions as requested

        return () => clearTimeout(timer);
    }, [transcript, lastProcessedLength, isListening]);

    const fetchSuggestions = async (text) => {
        setLoadingSuggestions(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5000/api/interview/suggest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ transcript: text })
            });
            const data = await res.json();
            setSuggestions(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Could show a toast here
    };

    return (
        <div className="flex flex-col h-full max-w-6xl mx-auto p-4 gap-6">
            {/* Header / Controls */}
            <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-700 flex justify-between items-center shadow-lg">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                        <Activity className="text-green-400 animate-pulse" />
                        Live Assist Mode
                    </h2>
                    <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-400" />
                        Your audio is processed locally and ephemeral. No storage.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 text-xs font-medium flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Live Assist provides suggestions only. It does not speak on your behalf.
                    </div>

                    {!isListening ? (
                        <button
                            onClick={startListening}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-900/20"
                        >
                            <Mic className="w-5 h-5" /> Start Listening
                        </button>
                    ) : (
                        <button
                            onClick={stopListening}
                            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-bold transition-all border border-gray-600"
                        >
                            <MicOff className="w-5 h-5" /> Stop Listening
                        </button>
                    )}

                    <button onClick={onExit} className="text-gray-400 hover:text-white transition-colors">
                        Exit
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Live Transcript Log */}
                <div className="lg:col-span-2 bg-gray-900/50 rounded-2xl border border-gray-800 p-6 flex flex-col min-h-0">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Volume2 className="w-4 h-4" /> Live Transcript
                    </h3>
                    <div className="flex-1 overflow-y-auto font-mono text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                        {transcript || <span className="text-gray-600 italic">Listening for interviewer questions...</span>}
                    </div>
                </div>

                {/* Smart Suggestions Panel */}
                <div className="flex flex-col gap-4 min-h-0 overflow-y-auto">
                    <SuggestionCard
                        title="Neutral / Balanced"
                        color="blue"
                        content={suggestions.neutral}
                        loading={loadingSuggestions}
                        onCopy={() => copyToClipboard(suggestions.neutral)}
                    />
                    <SuggestionCard
                        title="Confident / Direct"
                        color="purple"
                        content={suggestions.confident}
                        loading={loadingSuggestions}
                        onCopy={() => copyToClipboard(suggestions.confident)}
                    />
                    <SuggestionCard
                        title="Technical / Deep"
                        color="green"
                        content={suggestions.technical}
                        loading={loadingSuggestions}
                        onCopy={() => copyToClipboard(suggestions.technical)}
                    />
                </div>
            </div>
        </div>
    );
};

const SuggestionCard = ({ title, color, content, loading, onCopy }) => {
    const colorClasses = {
        blue: 'border-blue-500/30 bg-blue-500/5 hover:border-blue-500/50',
        purple: 'border-purple-500/30 bg-purple-500/5 hover:border-purple-500/50',
        green: 'border-green-500/30 bg-green-500/5 hover:border-green-500/50',
    };

    const titleColors = {
        blue: 'text-blue-400',
        purple: 'text-purple-400',
        green: 'text-green-400',
    };

    return (
        <motion.div
            layout
            className={`border rounded-xl p-5 relative group transition-all cursor-default ${colorClasses[color]}`}
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className={`font-bold text-sm uppercase tracking-wider ${titleColors[color]}`}>{title}</h4>
                <button
                    onClick={(e) => { e.stopPropagation(); onCopy(); }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                    title="Copy to clipboard"
                >
                    <Copy className="w-4 h-4" />
                </button>
            </div>

            <div className="min-h-[60px] relative">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center"
                        >
                            <div className="flex gap-1">
                                <span className={`w-2 h-2 rounded-full animate-bounce bg-${color}-500 opacity-50`}></span>
                                <span className={`w-2 h-2 rounded-full animate-bounce delay-75 bg-${color}-500 opacity-50`}></span>
                                <span className={`w-2 h-2 rounded-full animate-bounce delay-150 bg-${color}-500 opacity-50`}></span>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.p
                            key={content}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-gray-200 text-sm leading-relaxed"
                        >
                            {content}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default LiveAssist;
