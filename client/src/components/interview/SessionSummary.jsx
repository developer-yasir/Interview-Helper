import { motion } from 'framer-motion';
import { Download, CheckCircle, Clock, Activity, FileText, ChevronRight, RefreshCw, X } from 'lucide-react';
import { jsPDF } from 'jspdf';

const SessionSummary = ({ transcript, duration, paceHistory = [], suggestions = [], onClose }) => {

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(51, 65, 85); // Slate 700
        doc.text("Interview Session Summary", 20, 20);

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // Slate 500
        doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 28);

        // Stats
        doc.setDrawColor(226, 232, 240); // Slate 200
        doc.line(20, 35, 190, 35);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text("Session Stats", 20, 45);

        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        doc.text(`Duration: ${duration} minutes`, 20, 55);
        doc.text(`Average Pace: ${calculateAvgPace()} WPM`, 20, 62);

        // Transcript
        doc.line(20, 70, 190, 70);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text("Transcript Log", 20, 80);

        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);

        const splitText = doc.splitTextToSize(transcript || "No transcript recorded.", 170);
        doc.text(splitText, 20, 90);

        doc.save("interview-session-summary.pdf");
    };

    const calculateAvgPace = () => {
        if (!paceHistory.length) return 0;
        const total = paceHistory.reduce((acc, curr) => acc + curr, 0);
        return Math.round(total / paceHistory.length);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col h-full max-w-4xl mx-auto p-6 gap-8 text-slate-200"
        >
            <div className="text-center space-y-2 mb-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 mb-4"
                >
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Session Complete</h2>
                <p className="text-slate-400">Great work! Here's your performance breakdown.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center gap-2">
                    <Clock className="w-6 h-6 text-blue-400 mb-2" />
                    <span className="text-3xl font-bold text-white">{duration}</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Minutes</span>
                </div>
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center gap-2">
                    <Activity className="w-6 h-6 text-indigo-400 mb-2" />
                    <span className="text-3xl font-bold text-white">{calculateAvgPace()}</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Avg WPM</span>
                </div>
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center gap-2">
                    <FileText className="w-6 h-6 text-purple-400 mb-2" />
                    <span className="text-3xl font-bold text-white">{transcript ? transcript.split(' ').length : 0}</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Words Spoken</span>
                </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex-1 min-h-0 flex flex-col gap-6 relative overflow-hidden group">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-400" /> Transcript
                    </h3>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20"
                    >
                        <Download className="w-4 h-4" /> Export PDF
                    </motion.button>
                </div>

                <div className="bg-black/20 rounded-xl p-6 flex-1 overflow-y-auto custom-scrollbar border border-white/5">
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                        {transcript || <span className="text-slate-600 italic">No transcript available for this session.</span>}
                    </p>
                </div>
            </div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={onClose}
                    className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-wider"
                >
                    Close Session <X className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
};

export default SessionSummary;
