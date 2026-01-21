import { useState, useRef, useEffect } from 'react';
import { Code2, Copy, Check, RotateCcw, Play, Terminal, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

const CodeEditor = ({ code, setCode, language = "javascript" }) => {
    const [copied, setCopied] = useState(false);
    const [consoleLogs, setConsoleLogs] = useState([]);
    const [isConsoleOpen, setIsConsoleOpen] = useState(true);
    const textareaRef = useRef(null);
    const consoleEndRef = useRef(null);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReset = () => {
        if (confirm("Are you sure you want to reset your code?")) {
            setCode("// Write your solution here...\n\nfunction solution() {\n    \n}\n\n// Test cases\nconsole.log(solution());");
            setConsoleLogs([]);
        }
    };

    const runCode = () => {
        setConsoleLogs([]);
        setIsConsoleOpen(true);

        // Capture console.log
        const originalLog = console.log;
        const logs = [];

        console.log = (...args) => {
            logs.push({
                type: 'log', content: args.map(arg =>
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' ')
            });
            originalLog(...args);
        };

        try {
            // Use Function constructor for execution
            const execute = new Function(code);
            execute();

            if (logs.length === 0) {
                logs.push({ type: 'system', content: 'Code executed successfully (no output)' });
            }
        } catch (err) {
            logs.push({ type: 'error', content: err.toString() });
        } finally {
            console.log = originalLog;
            setConsoleLogs(logs);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;

            const newCode = code.substring(0, start) + "    " + code.substring(end);
            setCode(newCode);

            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 4;
            }, 0);
        }
    };

    useEffect(() => {
        consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [consoleLogs]);

    const lineCount = code.split('\n').length;

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl relative">
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-gray-800 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 p-1.5 rounded-lg text-blue-400">
                        <Terminal className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{language} sandbox</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleReset}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        title="Reset Code"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleCopy}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        title="Copy Code"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={runCode}
                        className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg shadow-lg shadow-green-900/20 transition-all font-bold text-xs uppercase tracking-widest"
                    >
                        <Play className="w-3.5 h-3.5 fill-current" /> Run
                    </button>
                </div>
            </div>

            {/* Editor Content Area */}
            <div className="flex-1 flex overflow-hidden relative min-h-0">
                <div className="w-12 bg-[#1e1e1e] text-[#858585] text-right pr-3 font-mono text-sm py-4 select-none border-r border-gray-800/50">
                    {Array.from({ length: Math.max(lineCount, 20) }).map((_, i) => (
                        <div key={i} className="h-6 leading-6">{i + 1}</div>
                    ))}
                </div>

                <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    spellCheck="false"
                    className="flex-1 bg-transparent text-[#d4d4d4] font-mono text-sm py-4 px-4 resize-none focus:outline-none leading-6 scrollbar-thin scrollbar-thumb-gray-800"
                    placeholder="// Write your solution here..."
                />
            </div>

            {/* Console Area */}
            <div className={`shrink-0 border-t border-gray-800 bg-[#1e1e1e] transition-all duration-300 flex flex-col ${isConsoleOpen ? 'h-48' : 'h-10'}`}>
                {/* Console Header */}
                <div
                    className="flex items-center justify-between px-4 py-2 bg-[#252526] cursor-pointer hover:bg-[#2d2d2e] transition-colors"
                    onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                >
                    <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Output Console</span>
                        {consoleLogs.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-[9px] font-black">{consoleLogs.length}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); setConsoleLogs([]); }}
                            className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-white transition-all"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {isConsoleOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
                    </div>
                </div>

                {/* Console Content */}
                {isConsoleOpen && (
                    <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2 bg-[#1e1e1e] select-text">
                        {consoleLogs.length === 0 ? (
                            <div className="text-gray-600 italic">No output yet. Click "Run" to execute code.</div>
                        ) : (
                            consoleLogs.map((log, i) => (
                                <div key={i} className={`flex gap-3 items-start ${log.type === 'error' ? 'text-red-400 bg-red-400/5 -mx-4 px-4 py-1' : log.type === 'system' ? 'text-blue-400 border-l border-blue-500/50 pl-2' : 'text-[#d4d4d4]'}`}>
                                    <span className="opacity-30 shrink-0 select-none">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                                    <span className="whitespace-pre-wrap break-all">{log.content}</span>
                                </div>
                            ))
                        )}
                        <div ref={consoleEndRef} />
                    </div>
                )}
            </div>

            {/* Status Bar */}
            <div className="h-6 bg-blue-600 px-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/90 select-none shrink-0">
                <div className="flex gap-4">
                    <span>UTF-8</span>
                    <span>Spaces: 4</span>
                </div>
                <div>
                    <span>Line: {code.substring(0, textareaRef.current?.selectionStart || 0).split('\n').length}</span>
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;
