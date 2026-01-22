import { useState, useEffect, useRef } from 'react';
import {
    Send, Bot, User, Mic, MicOff, X,
    ChevronRight, AlertCircle, CheckCircle2,
    ArrowLeft, Play, Terminal, Sparkles, StopCircle,
    Copy, Check, Layout, Maximize2, Lightbulb, Volume2, Code2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import VoiceWaveform from './VoiceWaveform';
import AIOrb from './AIOrb';
import ReactMarkdown from 'react-markdown';
import SessionSummary from './SessionSummary';

const PracticeInterview = ({ profile, config, onExit }) => {
    // State
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState("");
    const [isNarrateMode, setIsNarrateMode] = useState(false);

    const [isTTSActive, setIsTTSActive] = useState(false);
    const [output, setOutput] = useState("");
    const [hintLoading, setHintLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false); // New state for avatar animation

    // Session State
    const [isSessionEnded, setIsSessionEnded] = useState(false);
    const [duration, setDuration] = useState(0); // Seconds

    const messagesEndRef = useRef(null);

    // Hooks
    const { isListening, transcript, startListening, stopListening, resetTranscript, hasSupport } = useSpeechRecognition((finalTranscript) => {
        // Auto-send callback when silence is detected
        if (finalTranscript && finalTranscript.trim().length > 0) {
            handleSendMessage(finalTranscript);
        }
    });

    // Computed

    const isVoiceMode = isListening || isSpeaking || isTTSActive;

    // Effects
    useEffect(() => {
        let timer;
        if (!isSessionEnded) {
            timer = setInterval(() => setDuration(prev => prev + 1), 1000);
        }
        return () => clearInterval(timer);
    }, [isSessionEnded]);

    useEffect(() => {
        if (isListening && transcript) {
            setInput(transcript);
        }
    }, [isListening, transcript]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    useEffect(() => {
        setIsSpeaking(loading || isTTSActive);
    }, [loading, isTTSActive]);

    // TTS Function
    const speakText = (text) => {
        if (!isTTSActive || !text) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.onstart = () => setIsTTSActive(true);
        utterance.onend = () => setIsTTSActive(false);
        window.speechSynthesis.speak(utterance);
    };

    // Code Execution Function (Basic)
    const handleRunCode = () => {
        setOutput("Running...");
        try {
            // Capture console.log
            let logs = [];
            const originalLog = console.log;
            console.log = (...args) => {
                logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
                originalLog.apply(console, args);
            };

            // Run code
            // eslint-disable-next-line no-new-func
            const result = new Function(code + "\n" + (code.includes('solution(') ? '' : 'return "No return value";'))();

            console.log = originalLog;

            setOutput((logs.length > 0 ? "Output:\n" + logs.join('\n') + "\n\n" : "") + "Result: " + String(result));
        } catch (err) {
            setOutput("Error:\n" + err.toString());
        }
    };

    // Hint Function
    const handleHint = async () => {
        setHintLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5000/api/interview/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({
                    messages: [...messages, { role: 'user', content: "Please give me a small hint for the current problem without solving it." }],
                    userProfile: profile,
                    config: { ...config, mode: 'mock' } // Backend handles generic chat
                })
            });
            const data = await res.json();
            const hintMsg = { role: 'assistant', content: "💡 HINT: " + data.message };
            setMessages(prev => [...prev, hintMsg]);
            speakText(hintMsg.content);
        } catch (err) {
            console.error(err);
        } finally {
            setHintLoading(false);
        }
    };

    const handleSendMessage = async (audioText = null) => {
        const textToSend = audioText || input;
        if (!textToSend.trim()) return;

        const userMsg = { role: 'user', content: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        resetTranscript();
        setLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5000/api/interview/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    userProfile: profile,
                    config: { ...config, mode: 'mock' }
                })
            });
            const data = await res.json();
            const botMsg = { role: 'assistant', content: data.message };
            setMessages(prev => [...prev, botMsg]);
            speakText(botMsg.content);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "I encountered an error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleEndSession = () => {
        stopListening();
        window.speechSynthesis.cancel();
        setIsSessionEnded(true);
    };

    return (
        <div className="flex bg-[#050510] h-[100dvh] w-full relative overflow-hidden font-sans overscroll-none selection:bg-purple-500/30">

            {/* Session Summary Modal */}
            <AnimatePresence>
                {isSessionEnded && (
                    <SessionSummary
                        messages={messages}
                        duration={duration}
                        onHome={() => { setIsSessionEnded(false); onExit(); }}
                        onRetry={() => { setIsSessionEnded(false); window.location.reload(); }}
                    />
                )}
            </AnimatePresence>
            {/* Main Stage (Avatar / Video Feed) */}
            <div className={`transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) relative flex flex-col flex-1`}>

                {/* 1. Animated Gradient Mesh Background (Aurora) */}
                <div className="absolute inset-0 overflow-hidden -z-10 bg-black">
                    <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[150%] bg-[#4f46e5] opacity-[0.15] blur-[150px] animate-[pulse_10s_ease-in-out_infinite]" />
                    <div className="absolute top-[20%] right-[-20%] w-[100%] h-[100%] bg-[#ec4899] opacity-[0.1] blur-[150px] animate-[pulse_8s_ease-in-out_infinite_reverse]" />
                    <div className="absolute bottom-[-20%] left-[20%] w-[100%] h-[100%] bg-[#06b6d4] opacity-[0.1] blur-[150px] animate-[pulse_12s_ease-in-out_infinite]" />
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
                </div>

                {/* 2. Minimalist Session Timer (Floating) */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 opacity-50 font-light tracking-[0.2em] text-xs text-white uppercase mix-blend-overlay">
                    {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
                </div>

                {/* Avatar Display */}
                {/* 3. Dynamic Main Stage (Orb vs Chat) */}
                <div className={`flex-1 relative flex flex-col overflow-hidden ${isVoiceMode ? 'items-center justify-center p-8' : ''}`}>
                    <AnimatePresence mode='wait'>
                        {isVoiceMode ? (
                            <motion.div
                                key="voice-mode"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.5 }}
                                className="w-full h-full flex flex-col items-center justify-center relative"
                            >
                                <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
                                    <AIOrb isListening={isListening} isSpeaking={isSpeaking} />
                                </div>

                                {/* Floating Chat Overlay (Cinematic Subtitles) */}
                                <div className="absolute bottom-32 left-0 right-0 px-8 z-10 flex flex-col items-center pointer-events-none">
                                    <AnimatePresence mode='popLayout'>
                                        {messages.slice(-1).map((msg, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="w-full max-w-3xl text-center"
                                            >
                                                <div className="inline-block px-8 py-4 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 shadow-lg">
                                                    <p className="text-lg md:text-xl font-medium text-white/90 leading-relaxed">
                                                        {msg.content}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="chat-mode"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                                className="w-full h-full flex flex-col relative z-20"
                            >
                                <div className="flex-1 w-full max-w-5xl mx-auto overflow-y-auto px-6 pt-24 pb-32 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent space-y-6 scroll-smooth">
                                    {/* Messages mapped below... */}
                                    {messages.map((msg, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                {/* Avatar */}
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'assistant'
                                                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                                                    : 'bg-gradient-to-br from-gray-600 to-gray-700'
                                                    }`}>
                                                    {msg.role === 'assistant' ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
                                                </div>

                                                <motion.div
                                                    className={`px-6 py-4 rounded-2xl shadow-md border ${msg.role === 'assistant'
                                                        ? 'bg-[#1a1a1a]/80 backdrop-blur-md border-white/5 text-gray-100 rounded-tl-none'
                                                        : 'bg-blue-600 text-white border-blue-500 rounded-tr-none'
                                                        }`}
                                                    whileHover={{ scale: 1.01 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <div className="prose prose-invert prose-sm max-w-none leading-relaxed opacity-95">
                                                        <ReactMarkdown>
                                                            {msg.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>


                </div >

                {/* Control Deck (Bottom Bar) */}
                {/* 4. Floating Control Deck (Glass Capsule) */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
                    <div className="flex items-center gap-2 px-3 py-3 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-1 ring-white/5">

                        <motion.button
                            onClick={() => setIsTTSActive(!isTTSActive)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isTTSActive ? 'bg-white/20 text-white shadow-inner' : 'text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <Volume2 className="w-5 h-5" />
                        </motion.button>

                        <button
                            onClick={() => {
                                if (isSpeaking) {
                                    window.speechSynthesis.cancel();
                                    setIsSpeaking(false);
                                    startListening(); // Interrupt and start listening immediately
                                } else {
                                    isListening ? stopListening() : startListening();
                                }
                            }}
                            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg mx-2 ${isListening
                                ? 'bg-red-500 text-white shadow-red-500/40 scale-110'
                                : isSpeaking
                                    ? 'bg-amber-500 text-white animate-pulse' // Interrupt state
                                    : 'bg-white text-black hover:scale-105'
                                }`}
                        >
                            {isListening ? (
                                <div className="flex gap-1 items-center">
                                    <span className="w-1 h-3 bg-white rounded-full animate-bounce" />
                                    <span className="w-1 h-5 bg-white rounded-full animate-bounce delay-75" />
                                    <span className="w-1 h-3 bg-white rounded-full animate-bounce" />
                                </div>
                            ) : isSpeaking ? <span className="text-xs font-bold uppercase tracking-wider">Stop</span> : <Mic className="w-6 h-6" />}
                        </button>

                        <button
                            onClick={handleHint}
                            disabled={hintLoading}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${hintLoading ? 'text-yellow-300 bg-yellow-500/10 animate-pulse' : 'text-gray-400 hover:text-yellow-300 hover:bg-white/5'
                                }`}
                        >
                            <Lightbulb className="w-5 h-5" />
                        </button>

                        <div className="w-px h-8 bg-white/10 mx-2" />

                        <div className="relative group">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                                className="flex items-center"
                            >
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 w-0 group-hover:w-48 group-focus-within:w-64 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] text-sm px-2"
                                />
                                <button
                                    disabled={!input.trim()}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${input.trim() ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>

                        <button
                            onClick={handleEndSession}
                            className="w-12 h-12 rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors ml-1"
                        >
                            <StopCircle className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div >

            {/* Code Workspace (Side Panel) - Dark IDE Theme */}

        </div >
    );
};

export default PracticeInterview;
