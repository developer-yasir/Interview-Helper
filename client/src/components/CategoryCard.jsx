import { motion } from 'framer-motion';

const CategoryCard = ({ icon: Icon, title, count, isActive, onClick }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`relative overflow-hidden p-6 rounded-2xl text-left transition-all duration-300 w-full h-full
        ${isActive
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20 text-white'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white'
                }
      `}
        >
            <div className="relative z-10 flex flex-col h-full bg-slate-900 border border-zinc-500 bg-opacity-20 p-2 rounded-2xl">
                <div className={`p-3 rounded-xl w-fit mb-4 ${isActive ? 'bg-white/20' : 'bg-white/5'}`}>
                    <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-1">{title}</h3>
                <p className={`text-sm ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>
                    {count} Questions
                </p>
            </div>

            {/* Background decoration */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl opacity-50" />
        </motion.button>
    );
};

export default CategoryCard;
