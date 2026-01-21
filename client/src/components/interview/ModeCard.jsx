import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const ModeCard = ({ icon: Icon, title, description, color, features, onClick }) => {
    const isPurple = color === 'purple';

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`relative overflow-hidden bg-gray-900/40 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8 cursor-pointer group transition-all hover:bg-gray-800/60 shadow-2xl`}
        >
            {/* Background Glow */}
            <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[80px] opacity-20 transition-opacity group-hover:opacity-30 ${isPurple ? 'bg-purple-500' : 'bg-blue-500'}`} />

            <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${isPurple
                        ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                        : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                    }`}>
                    <Icon className="w-7 h-7" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-white group-hover:to-gray-500 transition-all">
                    {title}
                </h3>

                <p className="text-gray-400 mb-8 leading-relaxed">
                    {description}
                </p>

                <div className="space-y-3 mb-8">
                    {features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                            <CheckCircle2 className={`w-4 h-4 ${isPurple ? 'text-purple-500/50' : 'text-blue-500/50'}`} />
                            {feature}
                        </div>
                    ))}
                </div>

                <div className={`flex items-center gap-2 font-bold uppercase tracking-wider text-sm transition-all group-hover:gap-4 ${isPurple ? 'text-purple-400' : 'text-blue-400'}`}>
                    Launch Mode <ArrowRight className="w-5 h-5" />
                </div>
            </div>

            {/* Subtle Decorative Icon */}
            <Icon className={`absolute -right-6 -bottom-6 w-32 h-32 opacity-5 transform -rotate-12 transition-transform group-hover:scale-110 ${isPurple ? 'text-purple-400' : 'text-blue-400'}`} />
        </motion.div>
    );
};

export default ModeCard;
