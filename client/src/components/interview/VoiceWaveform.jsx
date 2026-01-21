import { motion } from 'framer-motion';

const VoiceWaveform = () => {
    return (
        <div className="flex items-center gap-1.5 h-6 px-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                    key={i}
                    animate={{
                        height: [8, 20, 12, 24, 8],
                    }}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.1,
                    }}
                    className={`w-1 rounded-full ${i % 2 === 0 ? 'bg-blue-400' : 'bg-purple-400'
                        }`}
                />
            ))}
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2 animate-pulse">
                Listening...
            </span>
        </div>
    );
};

export default VoiceWaveform;
