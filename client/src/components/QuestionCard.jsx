import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';

const QuestionCard = ({ question, difficulty }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Difficulty badge colors
    const getDifficultyColor = (diff) => {
        switch (diff.toLowerCase()) {
            case 'beginner': return 'bg-green-500/20 text-green-300 border-green-500/30';
            case 'intermediate': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
            case 'advanced': return 'bg-red-500/20 text-red-300 border-red-500/30';
            default: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden mb-4"
        >
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
            >
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border mb-3 ${getDifficultyColor(difficulty)}`}>
                            {difficulty}
                        </div>
                        <h3 className="text-xl font-semibold text-white leading-relaxed">
                            {question.question}
                        </h3>
                    </div>
                    <button
                        className={`p-2 rounded-full transition-colors ${isOpen ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-400'}`}
                    >
                        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-700/50 bg-gray-900/50"
                    >
                        <div className="p-6 text-gray-300 leading-relaxed space-y-4">
                            <div className="flex items-center gap-2 text-blue-400 text-sm font-medium mb-2">
                                <Eye className="w-4 h-4" />
                                <span>Ideally Answer</span>
                            </div>
                            <p>{question.answer}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default QuestionCard;
