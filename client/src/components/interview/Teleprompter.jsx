import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Briefcase, Award, Code, ChevronRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const Teleprompter = ({ profile, transcript, isOpen, onClose }) => {
    const [matches, setMatches] = useState([]);

    // Simple keyword matching against profile
    useEffect(() => {
        if (!transcript || !profile) return;

        const words = transcript.toLowerCase().split(' ');
        const newMatches = [];

        // Check Experience
        profile.experience?.forEach((exp, i) => {
            if (words.some(w => exp.company.toLowerCase().includes(w) || exp.role.toLowerCase().includes(w) || exp.description.toLowerCase().includes(w))) {
                newMatches.push({ type: 'experience', data: exp, id: `exp-${i}` });
            }
        });

        // Check Projects
        profile.projects?.forEach((proj, i) => {
            if (words.some(w => proj.name.toLowerCase().includes(w) || proj.description.toLowerCase().includes(w))) {
                newMatches.push({ type: 'project', data: proj, id: `proj-${i}` });
            }
        });

        // Check Skills
        if (words.some(w => profile.skills?.some(s => s.toLowerCase().includes(w)))) {
            const matchedSkills = profile.skills.filter(s => words.includes(s.toLowerCase()));
            if (matchedSkills.length) {
                newMatches.push({ type: 'skills', data: matchedSkills, id: 'skills' });
            }
        }

        if (newMatches.length > 0) {
            setMatches(newMatches);
        }
    }, [transcript, profile]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 320, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="h-full bg-slate-900/50 border-l border-white/10 flex flex-col overflow-hidden shadow-2xl backdrop-blur-xl"
                >
                    <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-400" />
                            Resume Context
                        </h3>
                        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {matches.length === 0 ? (
                            <div className="text-center text-slate-500 py-10">
                                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="text-xs">Listening for resume keywords...</p>
                            </div>
                        ) : (
                            matches.map((item) => (
                                <motion.div
                                    layout
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-slate-800/80 rounded-xl p-4 border border-indigo-500/20 shadow-lg"
                                >
                                    {item.type === 'experience' && (
                                        <>
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-bold text-white text-sm">{item.data.role}</h4>
                                                <Briefcase className="w-3 h-3 text-indigo-400" />
                                            </div>
                                            <p className="text-xs text-indigo-300 mb-2 font-medium">{item.data.company}</p>
                                            <p className="text-[10px] text-slate-300 leading-relaxed opacity-80">{item.data.description}</p>
                                        </>
                                    )}

                                    {item.type === 'project' && (
                                        <>
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-bold text-white text-sm">{item.data.name}</h4>
                                                <Code className="w-3 h-3 text-emerald-400" />
                                            </div>
                                            <p className="text-[10px] text-slate-300 leading-relaxed opacity-80">{item.data.description}</p>
                                        </>
                                    )}

                                    {item.type === 'skills' && (
                                        <>
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-bold text-white text-sm">Relevant Skills</h4>
                                                <Award className="w-3 h-3 text-amber-400" />
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {item.data.map(s => (
                                                    <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-200">{s}</span>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            ))
                        )}

                        {/* Always show full link at bottom */}
                        <div className="pt-4 border-t border-white/5 mt-4">
                            <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest">
                                Full Profile Loaded
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Teleprompter;
