import { useState, useEffect, useRef } from 'react';
import {
    Send, Bot, User, Mic, MicOff, X,
    ChevronRight, AlertCircle, CheckCircle2,
    ArrowLeft, Play, Terminal, Sparkles, StopCircle,
    Copy, Check, Layout, Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import CodeEditor from './CodeEditor';
import VoiceWaveform from './VoiceWaveform';
import ReactMarkdown from 'react-markdown';

const MockInterview = ({ profile, config, onExit }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState("// Write your solution here...\n\nfunction solution() {\n    return 'Hello from the sandbox!';\n}\n\n// Run and see output below\nconsole.log(solution());");
    const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
    const messagesEndRef = useRef(null);
    const { isListening, transcript, startListening, stopListening, resetTranscript } = useSpeechRecognition();

    const isTechnical = config.type === 'Technical';

    // Sync voice transcript to input
    useEffect(() => {
        if (transcript) {
            setInput(transcript);
        }
    }, [transcript]);

    // Initial Greeting
    useEffect(() => {
        const startSession = async () => {
            setLoading(true);
            try {
                const startMessage = {
                    role: 'user',
                    content: `Start the ${config.type} interview now. My name is ${profile?.name}.`
                };

                const token = localStorage.getItem('authToken');
                const res = await fetch('http://localhost:5000/api/interview/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    body: JSON.stringify({
                        messages: [startMessage],
                        userProfile: profile,
                        config: { ...config, mode: 'mock' }
                    })
                });
                const data = await res.json();
                setMessages([{ role: 'assistant', content: data.message }]);
            } catch (err) {
                console.error(err);
                setMessages([{ role: 'assistant', content: "I'm ready when you are! Say hello to start." }]);
            } finally {
                setLoading(false);
            }
        };
        startSession();
    }, []); // Run once on mount

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, loading]);

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
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
                    config: { ...config, mode: 'mock', currentCode: isTechnical ? code : null }
                })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "I encountered an error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleEndSession = async () => {
        if (messages.length < 2) {
            onExit();
            return;
        }

        if (!confirm("End session and generate feedback?")) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            await fetch('http://localhost:5000/api/interview/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    type: config.type,
                    difficulty: config.difficulty,
                    messages: messages
                })
            });
            onExit();
        } catch (err) {
            console.error("Failed to save session:", err);
            onExit();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className={`flex flex-col h-[calc(100vh-100px)] w-full mx-auto relative ${isTechnical ? 'max-w-full px-4' : 'max-w-5xl'}`}>

            {/* Ambient Background Elements */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Header */}
            <header className="flex items-center justify-between p-4 bg-gray-900/40 backdrop-blur-xl border border-gray-800/50 rounded-2xl mb-4 z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-white/5">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">Mock Interview</h2>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 font-medium text-gray-300">
                                {config.type}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-600" />
                            <span>{config.difficulty}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isTechnical && (
                        <button
                            onClick={() => setIsEditorCollapsed(!isEditorCollapsed)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${isEditorCollapsed
                                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                                    : 'bg-gray-800/40 border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-800/60'
                                }`}
                            title={isEditorCollapsed ? "Show Editor" : "Focus on Chat (Zen Mode)"}
                        >
                            {isEditorCollapsed ? <Layout className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">
                                {isEditorCollapsed ? "Show Editor" : "Zen Mode"}
                            </span>
                        </button>
                    )}
                    <button
                        onClick={handleEndSession}
                        className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all font-medium text-sm"
                    >
                        <StopCircle className="w-4 h-4" />
                        <span className="hidden md:inline">End Session</span>
                    </button>
                </div>
            </header>

            {/* Main Content: Split Screen for Technical, Single for others */}
            <div className={`flex flex-1 min-h-0 gap-4 mb-4 ${isTechnical ? 'flex-col lg:flex-row' : 'flex-col'}`}>

                {/* Chat Section */}
                <div className={`flex flex-col flex-1 bg-gray-900/20 rounded-2xl border border-gray-800/30 overflow-hidden transition-all duration-500 ease-in-out ${isTechnical && !isEditorCollapsed ? 'lg:w-[40%]' : 'w-full'}`}>
                    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-none">
                        <AnimatePresence initial={false}>
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex items-end gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'assistant'
                                            ? 'bg-gray-800 border border-purple-500/30 text-purple-400'
                                            : 'bg-blue-600 text-white'
                                            }`}>
                                            {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                        </div>
                                        <div className={`relative px-5 py-3 rounded-2xl shadow-xl leading-relaxed text-sm ${msg.role === 'assistant'
                                            ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700/50 text-gray-100 rounded-bl-none prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-gray-900/50 prose-pre:border prose-pre:border-white/10'
                                            : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white border border-blue-500/50 rounded-br-none'
                                            }`}>
                                            {msg.role === 'assistant' ? (
                                                <ReactMarkdown
                                                    components={{
                                                        code({ node, inline, className, children, ...props }) {
                                                            const match = /language-(\w+)/.exec(className || '');
                                                            const codeValue = String(children).replace(/\n$/, '');
                                                            const [copied, setCopied] = useState(false);

                                                            const handleCopy = () => {
                                                                navigator.clipboard.writeText(codeValue);
                                                                setCopied(true);
                                                                setTimeout(() => setCopied(false), 2000);
                                                            };

                                                            if (!inline && match) {
                                                                return (
                                                                    <div className="relative group my-4">
                                                                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                                            <button
                                                                                onClick={handleCopy}
                                                                                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white text-[10px] font-bold rounded-lg border border-white/10 shadow-lg flex items-center gap-1.5 transition-all active:scale-95"
                                                                            >
                                                                                {copied ? (
                                                                                    <><Check className="w-3 h-3 text-green-400" /> Copied!</>
                                                                                ) : (
                                                                                    <><Copy className="w-3 h-3" /> Copy</>
                                                                                )}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setCode(codeValue)}
                                                                                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg shadow-lg flex items-center gap-1.5 transition-all active:scale-95"
                                                                                title="Apply this code to the editor"
                                                                            >
                                                                                <Play className="w-3 h-3 fill-current" /> Apply to Editor
                                                                            </button>
                                                                        </div>
                                                                        <pre className="!bg-gray-950/50 !p-4 !rounded-xl border border-white/5 scrollbar-thin scrollbar-thumb-gray-800">
                                                                            <code className={className} {...props}>
                                                                                {children}
                                                                            </code>
                                                                        </pre>
                                                                    </div>
                                                                );
                                                            }
                                                            return <code className={`${className} bg-gray-950/50 px-1 rounded text-blue-400`} {...props}>{children}</code>;
                                                        }
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            ) : (
                                                <div className="whitespace-pre-wrap">{msg.content}</div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {loading && (
                            <div className="flex justify-start">
                                <div className="flex items-end gap-3">
                                    <div className="w-7 h-7 rounded-full bg-gray-800 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="bg-gray-800/50 border border-gray-700/50 px-4 py-3 rounded-2xl rounded-bl-none flex gap-1.5 items-center">
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75" />
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-4" />
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 bg-gray-900/40 border-t border-gray-800/50">
                        <div className="relative flex items-center gap-2 bg-gray-950/80 backdrop-blur-xl border border-gray-800 p-2 pl-4 rounded-xl shadow-inner focus-within:ring-1 focus-within:ring-blue-500/30 transition-all">
                            <div className="flex-1 min-w-0">
                                {isListening ? (
                                    <VoiceWaveform />
                                ) : (
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Your answer..."
                                        rows={1}
                                        className="w-full bg-transparent text-white placeholder:text-gray-600 focus:outline-none resize-none py-2 text-sm max-h-24 scrollbar-none"
                                    />
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={isListening ? stopListening : startListening}
                                    className={`p-2 rounded-lg transition-all ${isListening
                                        ? 'bg-red-500/20 text-red-500 animate-pulse'
                                        : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!input.trim() || loading}
                                    className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg disabled:opacity-50 transition-all transform active:scale-95"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Code Editor Section (Technical Mode Only) */}
                {isTechnical && (
                    <AnimatePresence>
                        {!isEditorCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                transition={{ duration: 0.3 }}
                                className="flex-1 lg:w-[60%] h-full"
                            >
                                <CodeEditor code={code} setCode={setCode} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default MockInterview;
