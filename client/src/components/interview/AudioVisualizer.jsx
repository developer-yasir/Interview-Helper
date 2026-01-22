import { motion } from 'framer-motion';

const AudioVisualizer = ({ isListening }) => {
    return (
        <div className="flex items-center gap-1 h-8">
            {[...Array(12)].map((_, i) => (
                <motion.div
                    key={i}
                    className="w-1 bg-indigo-400 rounded-full"
                    animate={isListening ? {
                        height: [4, Math.random() * 24 + 4, 4],
                        opacity: [0.3, 1, 0.3]
                    } : {
                        height: 4,
                        opacity: 0.3
                    }}
                    transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: i * 0.1,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    );
};

export default AudioVisualizer;
