import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Copy, AlertTriangle, Activity, Volume2, Shield, Sparkles, Maximize2, Minimize2, LifeBuoy, BookOpen, Image as ImageIcon } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';
import SessionSummary from './SessionSummary';
import Teleprompter from './Teleprompter';
import { motion, AnimatePresence } from 'framer-motion';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';

const LiveAssist = ({ profile, config, onExit }) => {
    const { isListening, transcript, startListening, stopListening, resetTranscript, hasSupport } = useSpeechRecognition();
    const [suggestions, setSuggestions] = useState({
        neutral: { hook: "", meat: "Listening for context...", close: "" },
        confident: { hook: "", meat: "", close: "" },
        technical: { hook: "", meat: "", close: "" },
        pace: "0 wpm",
        keywords: []
    });
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [lastProcessedLength, setLastProcessedLength] = useState(0);
    const [activeTone, setActiveTone] = useState('confident');
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);

    // SCREENSHOT LOGIC
    const handleScreenshot = async () => {
        try {
            const items = await navigator.clipboard.read();
            for (const item of items) {
                if (item.types.some(type => type.startsWith('image/'))) {
                    const blob = await item.getType(item.types.find(type => type.startsWith('image/')));
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        const base64Image = e.target.result;
                        setLoadingSuggestions(true);

                        // Send to backend
                        const token = localStorage.getItem('authToken');
                        const res = await fetch('http://localhost:5000/api/interview/suggest', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                            body: JSON.stringify({ image: base64Image, transcript: "", profile, config, mode: 'vision' })
                        });
                        const data = await res.json();
                        setSuggestions(data);
                        setActiveTone('technical');
                        setLoadingSuggestions(false);
                    };
                    reader.readAsDataURL(blob);
                    return; // Stop after first image
                }
            }
            alert("No image found in clipboard! Take a screenshot first, then click here.");
        } catch (err) {
            console.error("Clipboard Error:", err);
            alert("Please allow clipboard access to use Vision features.");
        }
    };

    // PIVOT LOGIC
    const handlePivot = async () => {
        setLoadingSuggestions(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5000/api/interview/suggest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    transcript: transcript || "I need to change the topic.",
                    profile,
                    config,
                    mode: "pivot"
                })
            });
            const data = await res.json();
            setSuggestions(data);
            setActiveTone('neutral');
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    // Auto-fetch suggestions when transcript changes significantly
    useEffect(() => {
        if (transcript.length - lastProcessedLength > 50) {
            const fetchSuggestions = async () => {
                setLoadingSuggestions(true);
                try {
                    const token = localStorage.getItem('authToken');
                    const res = await fetch('http://localhost:5000/api/interview/suggest', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token
                        },
                        body: JSON.stringify({ transcript, profile, config })
                    });
                    const data = await res.json();
                    setSuggestions(data);
                    setLastProcessedLength(transcript.length);
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoadingSuggestions(false);
                }
            };
            fetchSuggestions();
        }
    }, [transcript, lastProcessedLength, profile, config]);

    // Session Tracking
    const [sessionStartTime, setSessionStartTime] = useState(null);
    const [showSummary, setShowSummary] = useState(false);
    const [stats, setStats] = useState({ duration: 0, wordCount: 0, paceHistory: [] });

    const handleStartListening = () => {
        setSessionStartTime(Date.now());
        startListening();
    };

    const handleStopListening = () => {
        stopListening();
        // Don't show summary yet, let user decide when to end
    };

    const handleSessionEnd = () => {
        stopListening();
        const duration = sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 1000) : 0;
        const wordCount = transcript.trim().split(/\s+/).length;
        setStats(prev => ({ ...prev, duration, wordCount }));
        setShowSummary(true);
    };

    // Auto-select highest confidence tone
    useEffect(() => {
        const tones = ['neutral', 'confident', 'technical'];
        // Simple logic: keep current or default to confident (could use backend confidence score)
        // For now, we trust user Selection or Pivot, default confident
    }, [suggestions]);

    const [paceStatus, setPaceStatus] = useState('normal');

    // Pacing Analysis Effect
    useEffect(() => {
        if (!suggestions.pace) return;
        const wpm = parseInt(suggestions.pace);
        if (isNaN(wpm)) return;

        if (isListening) {
            setStats(prev => ({ ...prev, paceHistory: [...prev.paceHistory, wpm] }));
        }

        if (wpm > 160) setPaceStatus('fast');
        else if (wpm >= 130) setPaceStatus('optimal');
        else setPaceStatus('slow');
    }, [suggestions.pace, isListening]);

    const getPaceColor = () => {
        switch (paceStatus) {
            case 'fast': return 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]';
            case 'optimal': return 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]';
            default: return 'border-indigo-500/30';
        }
    };

    if (showSummary) {
        return <SessionSummary
            transcript={transcript}
            duration={stats.duration}
            paceHistory={stats.paceHistory}
            suggestions={[]}
            onClose={onExit}
        />;
    }

    return (
        <div className={`flex flex-col h-full mx-auto transition-all duration-500 ${isFocusMode ? 'max-w-xl justify-center' : 'max-w-7xl p-6 gap-8'} text-slate-200`}>
            {/* Professional Header */}
            <header className={`bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 flex flex-wrap justify-between items-center shadow-2xl relative overflow-hidden transition-all duration-500 ${isFocusMode ? 'p-4 gap-2' : 'p-6 gap-6'}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-blue-500/10 opacity-30" />

                <div className="relative flex items-center gap-4">
                    <div className={`p-3 bg-indigo-500/20 rounded-2xl border transition-all duration-500 ${isFocusMode ? 'scale-75' : ''} ${isListening ? getPaceColor() : 'border-indigo-500/30'}`}>
                        {isListening ? (
                            <AudioVisualizer isListening={true} />
                        ) : (
                            <Activity className="text-indigo-400 w-8 h-8" />
                        )}
                    </div>
                    {!isFocusMode && (
                        <div className="transition-opacity duration-300">
                            <h2 className="text-2xl font-bold text-white tracking-tight">
                                Live Interview Assistant
                            </h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border transition-colors duration-500
                                    ${paceStatus === 'fast' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                                        paceStatus === 'optimal' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                                            'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'}`}>
                                    <Activity className="w-3 h-3" /> {paceStatus === 'fast' ? 'Slow Down' : paceStatus === 'optimal' ? 'Perfect Pace' : 'Steady'}
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-500/10 px-2 py-0.5 rounded-full border border-slate-500/20">
                                    <Volume2 className="w-3 h-3" /> AI Active
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 relative">
                    {/* Pivot Button */}
                    {!isFocusMode && (
                        <button
                            onClick={handlePivot}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 hover:text-orange-300 transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-500/5 group"
                            title="Emergency Pivot: Change Topic"
                        >
                            <LifeBuoy className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                            <span className="hidden sm:inline">Pivot</span>
                        </button>
                    )}

                    {/* Teleprompter Toggle */}
                    {!isFocusMode && (
                        <button
                            onClick={() => setIsTeleprompterOpen(!isTeleprompterOpen)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-xs font-bold uppercase tracking-wider border shadow-lg ${isTeleprompterOpen ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-slate-800/40 text-slate-400 border-white/5 hover:bg-white/5'}`}
                            title="Toggle Resume Teleprompter"
                        >
                            <BookOpen className="w-4 h-4" />
                            <span className="hidden sm:inline">Resume</span>
                        </button>
                    )}

                    {/* Screenshot Button */}
                    {!isFocusMode && (
                        <button
                            onClick={handleScreenshot}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20 hover:bg-pink-500/20 hover:text-pink-300 transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-pink-500/5"
                            title="Paste Screenshot from Clipboard (Vision)"
                        >
                            <ImageIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Vision</span>
                        </button>
                    )}

                    {/* Focus Mode Toggle */}
                    <button
                        onClick={() => setIsFocusMode(!isFocusMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${isFocusMode ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'}`}
                        title={isFocusMode ? "Expand View" : "Focus Mode"}
                    >
                        {isFocusMode ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                        <span className="uppercase tracking-wider">{isFocusMode ? 'Expand' : 'Focus'}</span>
                    </button>

                    <button
                        onClick={handleSessionEnd}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 transition-all active:scale-95 group border border-rose-400/20"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20" />
                            <span className="w-2 h-2 bg-white rounded-full block" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider">End Session</span>
                    </button>
                </div>
            </header>

            <div className={`grid gap-8 flex-1 min-h-0 overflow-hidden transition-all duration-500 ${isFocusMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'}`}>
                {/* Consolidated Smart Suggestion */}
                <div className={`${isFocusMode ? 'col-span-1' : isTeleprompterOpen ? 'lg:col-span-6' : 'lg:col-span-8'} flex flex-col gap-6 min-h-0 transition-all duration-300`}>
                    <div className="flex flex-col gap-4 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl h-full">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-indigo-400" />
                                Smart Suggestions
                            </h3>
                            <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/5">
                                {['neutral', 'confident', 'technical'].map(tone => (
                                    <button
                                        key={tone}
                                        onClick={() => setActiveTone(tone)}
                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all
                                        ${activeTone === tone ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        {tone}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <AnimatePresence mode="wait">
                                {loadingSuggestions ? (
                                    <div className="flex items-center justify-center h-40">
                                        <div className="absolute w-8 h-8 border-2 border-indigo-500/30 rounded-full animate-ping" />
                                        <div className="w-16 h-16 border-2 border-t-indigo-500 border-r-transparent border-b-indigo-500 border-l-transparent rounded-full animate-spin" />
                                    </div>
                                ) : (
                                    <SuggestionCard
                                        title={activeTone.charAt(0).toUpperCase() + activeTone.slice(1)}
                                        icon={activeTone === 'neutral' ? 'blue' : activeTone === 'confident' ? 'purple' : 'indigo'}
                                        track={suggestions[activeTone]}
                                        keywords={suggestions.keywords}
                                        loading={false}
                                        onCopy={() => navigator.clipboard.writeText(suggestions[activeTone]?.meat)}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Teleprompter Panel */}
                {!isFocusMode && (
                    <div className={`${isTeleprompterOpen ? 'lg:col-span-3' : 'hidden'} min-h-0 transition-all duration-300`}>
                        <div className="h-full rounded-3xl overflow-hidden border border-white/10 shadow-xl">
                            <Teleprompter
                                profile={profile}
                                transcript={transcript}
                                isOpen={isTeleprompterOpen}
                                onClose={() => setIsTeleprompterOpen(false)}
                            />
                        </div>
                    </div>
                )}

                {/* Clean Transcript (Moved to Side) */}
                {!isFocusMode && (
                    <div className={`${isTeleprompterOpen ? 'lg:col-span-3' : 'lg:col-span-4'} bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/10 p-6 flex flex-col min-h-0 shadow-xl relative group transition-colors hover:border-white/20`}>
                        <div className="flex flex-col gap-4 mb-6">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] animate-pulse' : 'bg-slate-700'}`} />
                                Audio Log
                            </h3>
                            {!isListening && (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                                    <Mic className="w-4 h-4" />
                                    <p className="text-xs font-medium">Ready to start. Click the mic button.</p>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar font-mono text-sm leading-relaxed text-slate-300 opacity-80">
                            {transcript ? (
                                <p>{transcript}</p>
                            ) : (
                                <span className="text-slate-600 italic">Waiting for speech...</span>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                                <span>{transcript.length > 0 ? `${transcript.split(' ').length} words` : '0 words'}</span>
                                <span className={`transition-colors ${paceStatus === 'fast' ? 'text-amber-500' : 'text-slate-500'}`}>{suggestions.pace || '0 wpm'}</span>
                            </div>
                            <button
                                onClick={isListening ? handleStopListening : handleStartListening}
                                className={`p-4 rounded-2xl transition-all duration-300 shadow-xl active:scale-95 group relative overflow-hidden
                                ${isListening ? 'bg-rose-500 hover:bg-rose-600 border border-rose-400/20 shadow-rose-500/20' : 'bg-indigo-500 hover:bg-indigo-600 border border-indigo-400/20 shadow-indigo-500/20'}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                {isListening ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SuggestionCard = ({ title, icon, track, keywords = [], loading, onCopy }) => {
    const { hook, meat, close, confidence = 92 } = track || {};

    const highlightText = (text) => {
        if (!text || !keywords.length) return text;
        const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) =>
            keywords.some(k => k.toLowerCase() === part.toLowerCase()) ?
                <span key={i} className="bg-indigo-500/30 text-white font-bold px-1 rounded">{part}</span> : part
        );
    };

    const colors = {
        blue: 'bg-blue-500 shadow-blue-500/20',
        purple: 'bg-purple-500 shadow-purple-500/20',
        indigo: 'bg-indigo-500 shadow-indigo-500/20',
    };

    const progressColors = {
        blue: 'bg-gradient-to-r from-blue-500 to-cyan-500',
        purple: 'bg-gradient-to-r from-purple-500 to-pink-500',
        indigo: 'bg-gradient-to-r from-indigo-500 to-violet-500',
    };

    return (
        <motion.div layout className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-white/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex justify-between items-start mb-6 relative">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl border border-white/10 ${colors[icon]} shadow-lg`}>
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-white tracking-tight">{title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="h-1.5 w-16 bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${confidence}%` }}
                                    className={`h-full ${progressColors[icon]}`}
                                />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-wider ${icon === 'blue' ? 'text-blue-400' : icon === 'purple' ? 'text-purple-400' : 'text-indigo-400'}`}>
                                {confidence}% Synergy
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onCopy(); }}
                    className="p-3 rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5 active:scale-95 shadow-sm"
                    title="Copy Answer"
                >
                    <Copy className="w-5 h-5" />
                </button>
            </div>

            <div className="relative min-h-[120px]">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <div className="space-y-4 py-2">
                            <div className="h-4 w-full bg-white/5 rounded-full animate-pulse" />
                            <div className="h-4 w-11/12 bg-white/5 rounded-full animate-pulse" />
                            <div className="h-4 w-4/5 bg-white/5 rounded-full animate-pulse" />
                        </div>
                    ) : (
                        <motion.div
                            key={`${title}-${hook}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-slate-800/30 rounded-2xl p-6 border border-white/5"
                        >
                            <p className="text-slate-200 text-lg leading-relaxed font-medium tracking-tight">
                                {hook && <span className="text-slate-500 italic mr-2">{highlightText(hook)}</span>}
                                {meat && <span>{highlightText(meat)}</span>}
                                {close && <span className="text-slate-500 italic ml-2">{highlightText(close)}</span>}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default LiveAssist;
