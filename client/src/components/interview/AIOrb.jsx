import { motion } from 'framer-motion';

const AIOrb = ({ isListening, isSpeaking }) => {
    // Cinematic "Apple-style" mesh gradients
    const activeGradient = isListening
        ? "from-rose-500 via-orange-500 to-amber-500" // Warm/Active
        : isSpeaking
            ? "from-cyan-400 via-blue-500 to-purple-600" // Cool/Intelligent
            : "from-blue-400/80 via-indigo-500/80 to-purple-500/80"; // Idle/Deep

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* 1. Deep Atmosphere Glow (The "Aura") */}
            <motion.div
                animate={{
                    opacity: isSpeaking ? 0.6 : 0.3,
                    scale: isSpeaking ? 1.2 : 1,
                }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className={`absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r ${activeGradient} blur-[120px] mix-blend-screen transition-colors duration-1000`}
            />

            <div className="relative w-72 h-72 flex items-center justify-center">

                {/* 2. The Fluid Core (Morphing Shape) */}
                <motion.div
                    animate={{
                        borderRadius: [
                            "60% 40% 30% 70% / 60% 30% 70% 40%",
                            "40% 60% 60% 40% / 60% 30% 70% 40%",
                            "60% 40% 30% 70% / 60% 30% 70% 40%"
                        ],
                        rotate: [0, 90, 180, 270, 360],
                    }}
                    transition={{
                        borderRadius: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                        rotate: { duration: 20, repeat: Infinity, ease: "linear" }
                    }}
                    className={`absolute inset-0 bg-gradient-to-br ${activeGradient} opacity-90 blur-3xl mix-blend-plus-lighter transition-colors duration-1000`}
                />

                {/* 3. The Solid Inner Nucleus (Sharp center) */}
                <motion.div
                    animate={{
                        scale: isSpeaking ? [1, 1.1, 1] : [1, 0.95, 1],
                    }}
                    transition={{ duration: isSpeaking ? 0.4 : 3, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute w-32 h-32 rounded-full bg-white blur-xl opacity-90 mix-blend-overlay`}
                />

                {/* 4. Reactive Rings (Voice Ripple) */}
                {isSpeaking && (
                    <>
                        {[1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: [0, 0.4, 0], scale: 2 }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.4,
                                    ease: "easeOut"
                                }}
                                className="absolute inset-0 rounded-full border border-white/20"
                            />
                        ))}
                    </>
                )}

                {/* 5. Listening State (Subtle Pulse) */}
                {isListening && (
                    <motion.div
                        animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-[-20px] rounded-full border-2 border-white/30 blur-sm"
                    />
                )}
            </div>

            {/* Cinematic Status Text */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={isListening ? "list" : isSpeaking ? "speak" : "idle"}
                className="absolute -bottom-24 flex flex-col items-center gap-2"
            >
                <span className="text-3xl font-light tracking-tight text-white/90 drop-shadow-2xl font-serif italic">
                    {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Ready"}
                </span>
                <div className="h-px w-12 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            </motion.div>
        </div>
    );
};

export default AIOrb;
