import { motion } from 'framer-motion';
import { Bot, Mic } from 'lucide-react';

const AvatarDisplay = ({ isListening, isSpeaking, persona = "Interviewer" }) => {
    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-blue-900/10 rounded-3xl" />

            {/* Central Avatar Circle */}
            <div className="relative z-10 w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
                {/* Outer Ripple Rings (Animating) */}
                {(isListening || isSpeaking) && (
                    <>
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className={`absolute inset-0 rounded-full border-2 ${isListening ? 'border-red-500/30 bg-red-500/5' : 'border-purple-500/30 bg-purple-500/5'}`}
                        />
                        <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            className={`absolute inset-0 rounded-full border ${isListening ? 'border-red-500/20' : 'border-purple-500/20'}`}
                        />
                    </>
                )}

                {/* Main Avatar Container */}
                <div className={`relative w-full h-full rounded-full flex items-center justify-center backdrop-blur-sm border-4 transition-colors duration-500 ${isSpeaking
                    ? 'bg-purple-900/20 border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.4)]'
                    : isListening
                        ? 'bg-red-900/20 border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.4)]'
                        : 'bg-gray-800/40 border-gray-700/50'
                    }`}>
                    <Bot className={`w-24 h-24 transition-colors duration-300 ${isSpeaking ? 'text-purple-300' : isListening ? 'text-red-300' : 'text-gray-400'}`} />

                    {/* Status Indicator Icon */}
                    <div className="absolute bottom-4 right-4 bg-gray-900 rounded-full p-2 border border-white/10 shadow-lg">
                        {isListening ? (
                            <Mic className="w-5 h-5 text-red-500 animate-pulse" />
                        ) : (
                            <div className="flex gap-1 px-1">
                                <span className={`w-1 h-3 rounded-full ${isSpeaking ? 'bg-purple-400 animate-[bounce_1s_infinite]' : 'bg-gray-600'}`} />
                                <span className={`w-1 h-3 rounded-full ${isSpeaking ? 'bg-purple-400 animate-[bounce_1s_infinite_0.2s]' : 'bg-gray-600'}`} />
                                <span className={`w-1 h-3 rounded-full ${isSpeaking ? 'bg-purple-400 animate-[bounce_1s_infinite_0.4s]' : 'bg-gray-600'}`} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Persona Label */}
            <div className="mt-8 text-center relative z-10">
                <h3 className="text-2xl font-bold text-white tracking-tight">{persona}</h3>
                <p className={`text-sm font-medium mt-1 transition-colors ${isListening ? 'text-red-400' : isSpeaking ? 'text-purple-400' : 'text-gray-500'}`}>
                    {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Idle"}
                </p>
            </div>
        </div>
    );
};

export default AvatarDisplay;
