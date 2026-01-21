import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Award, MessageSquare, ChevronRight, Clock, User, Bot, Star, ArrowLeft } from 'lucide-react';

const InterviewHistory = ({ onBack }) => {
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5000/api/interview/sessions', {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setSessions(data);
            }
        } catch (err) {
            console.error("Failed to fetch sessions:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (selectedSession) {
        return (
            <div className="space-y-6">
                <button
                    onClick={() => setSelectedSession(null)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to History
                </button>

                <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 space-y-8">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-bold text-white">{selectedSession.type} Interview</h3>
                            <p className="text-gray-400">
                                {new Date(selectedSession.date).toLocaleDateString()} at {new Date(selectedSession.date).toLocaleTimeString()}
                            </p>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                            <span className="text-sm font-medium text-blue-400 uppercase tracking-wider">Score</span>
                            <span className="text-4xl font-black text-blue-400">{selectedSession.score}%</span>
                        </div>
                    </div>

                    <div className="p-6 bg-purple-500/10 border border-purple-500/20 rounded-2xl space-y-4">
                        <h4 className="flex items-center gap-2 font-bold text-purple-300">
                            <Award className="w-5 h-5" /> AI Feedback Summary
                        </h4>
                        <p className="text-gray-200 leading-relaxed italic">
                            "{selectedSession.feedback}"
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-white text-xl">Full Transcript</h4>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-800">
                            {selectedSession.messages.map((msg, i) => (
                                <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                            {msg.role === 'assistant' ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                            {msg.role === 'assistant' ? 'AI INTERVIEWER' : 'YOU'}
                                        </div>
                                        <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-tr-none'
                                                : 'bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Interview History</h3>
                <span className="text-gray-500 bg-gray-900 border border-gray-800 px-4 py-1 rounded-full text-sm">
                    {sessions.length} sessions completed
                </span>
            </div>

            {sessions.length === 0 ? (
                <div className="text-center py-20 bg-gray-900/30 border border-dashed border-gray-800 rounded-3xl">
                    <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No interviews completed yet. Start your first session!</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {sessions.map((session) => (
                        <motion.div
                            key={session._id}
                            whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.03)' }}
                            onClick={() => setSelectedSession(session)}
                            className="group p-6 bg-gray-900/50 border border-gray-800 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
                        >
                            <div className="flex items-center gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border font-bold text-xl ${session.score >= 80 ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                        session.score >= 60 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                                            'bg-red-500/10 border-red-500/20 text-red-400'
                                    }`}>
                                    {session.score}%
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                                        {session.type} Interview
                                    </h4>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(session.date).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {session.difficulty}</span>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors" />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InterviewHistory;
