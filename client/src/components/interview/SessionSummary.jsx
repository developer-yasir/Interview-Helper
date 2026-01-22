import { motion } from 'framer-motion';
import { Award, Clock, MessageSquare, CheckCircle, Home, RotateCcw } from 'lucide-react';

const SessionSummary = ({ messages, duration, onHome, onRetry }) => {
    // Calculate basic stats
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    const userMessages = messages.filter(m => m.role === 'user');
    const hintsUsed = assistantMessages.filter(m => m.content.includes("💡 HINT")).length;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden"
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="text-center mb-8 relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
                        <Award className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Session Complete!</h2>
                    <p className="text-gray-400">Great job practicing. Here's how you did.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 relative z-10">
                    <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50 text-center">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-2 text-blue-400">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {Math.floor(duration / 60)}<span className="text-sm font-normal text-gray-500">m</span> {duration % 60}<span className="text-sm font-normal text-gray-500">s</span>
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">Duration</div>
                    </div>

                    <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50 text-center">
                        <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-2 text-purple-400">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div className="text-2xl font-bold text-white">{userMessages.length}</div>
                        <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">Exchanges</div>
                    </div>

                    <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50 text-center">
                        <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center mx-auto mb-2 text-yellow-400">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <div className="text-2xl font-bold text-white">{hintsUsed}</div>
                        <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">Hints Used</div>
                    </div>
                </div>

                <div className="flex gap-4 relative z-10">
                    <button
                        onClick={onHome}
                        className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" /> Back to Home
                    </button>
                    <button
                        onClick={onRetry}
                        className="flex-1 py-3 bg-white text-black hover:bg-gray-100 rounded-xl font-bold shadow-lg transition-transform transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-4 h-4" /> Practice Again
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default SessionSummary;
