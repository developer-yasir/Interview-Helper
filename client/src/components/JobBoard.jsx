import { useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Mail, X, Send, Briefcase, Calendar, CheckCircle } from 'lucide-react';
import BoardColumn from './BoardColumn';
import SortableJobCard from './SortableJobCard';

const JobBoard = () => {
    const [jobs, setJobs] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showEmailModal, setShowEmailModal] = useState(false);

    // Email Form State
    const [emailForm, setEmailForm] = useState({
        company: '',
        position: '',
        recruiterEmail: '',
        subject: '',
        body: ''
    });

    const statuses = ['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5000/api/jobs', {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over) return;

        const activeJobId = active.id;
        const overId = over.id; // This could be a container ID (status) or another job ID

        // Find the current job
        const job = jobs.find(j => j._id === activeJobId);
        let newStatus = job.status;

        // Check if dropped on a column container
        if (statuses.includes(overId)) {
            newStatus = overId;
        } else {
            // Dropped on another card, find that card's status
            const overJob = jobs.find(j => j._id === overId);
            if (overJob) {
                newStatus = overJob.status;
            }
        }

        if (job.status !== newStatus) {
            // Optimistic Update
            const updatedJobs = jobs.map(j =>
                j._id === activeJobId ? { ...j, status: newStatus } : j
            );
            setJobs(updatedJobs);

            // Backend Update
            try {
                const token = localStorage.getItem('authToken');
                await fetch(`http://localhost:5000/api/jobs/${activeJobId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    body: JSON.stringify({ status: newStatus })
                });
            } catch (err) {
                console.error("Failed to update status", err);
                fetchJobs(); // Revert on error
            }
        }

        setActiveId(null);
    };

    const handleApply = async (e) => {
        e.preventDefault();
        const mailtoLink = `mailto:${emailForm.recruiterEmail}?subject=${encodeURIComponent(emailForm.subject)}&body=${encodeURIComponent(emailForm.body)}`;
        window.open(mailtoLink, '_blank');

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5000/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    company: emailForm.company,
                    position: emailForm.position,
                    status: 'Applied',
                    notes: `Applied via email to ${emailForm.recruiterEmail}`,
                    dateApplied: new Date()
                })
            });
            const savedJob = await res.json();
            setJobs([savedJob, ...jobs]);
            setShowEmailModal(false);
            resetEmailForm();
        } catch (err) {
            console.error(err);
        }
    };

    const resetEmailForm = () => {
        setEmailForm({
            company: '',
            position: '',
            recruiterEmail: '',
            subject: '',
            body: ''
        });
    };

    const deleteJob = async (id) => {
        if (!confirm("Delete this application?")) return;
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`http://localhost:5000/api/jobs/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            setJobs(jobs.filter(j => j._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    // Filtered Jobs
    const filteredJobs = jobs.filter(job =>
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.position.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Statistics
    const stats = {
        total: jobs.length,
        active: jobs.filter(j => ['Applied', 'Interviewing'].includes(j.status)).length,
        interviews: jobs.filter(j => j.status === 'Interviewing').length,
        offers: jobs.filter(j => j.status === 'Offer').length
    };

    const activeJob = activeId ? jobs.find(j => j._id === activeId) : null;

    return (
        <div className="max-w-[1800px] mx-auto p-6">
            {/* Header & Stats */}
            <div className="mb-10 space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">My Applications</h2>
                        <p className="text-gray-400 text-lg">Manage, track, and optimize your job search workflow.</p>
                    </div>
                    <button
                        onClick={() => setShowEmailModal(true)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/20 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 group"
                    >
                        <div className="bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition-colors">
                            <Plus className="w-5 h-5" />
                        </div>
                        New Application
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <StatCard icon={Briefcase} label="Total Applications" value={stats.total} color="text-blue-400" bg="bg-blue-500/10" border="border-blue-500/20" />
                    <StatCard icon={Send} label="Active" value={stats.active} color="text-yellow-400" bg="bg-yellow-500/10" border="border-yellow-500/20" />
                    <StatCard icon={Calendar} label="Interviews" value={stats.interviews} color="text-purple-400" bg="bg-purple-500/10" border="border-purple-500/20" />
                    <StatCard icon={CheckCircle} label="Offers" value={stats.offers} color="text-green-400" bg="bg-green-500/10" border="border-green-500/20" />
                </div>

                {/* Search Bar */}
                <div className="relative max-w-xl">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search company, position, or status..."
                        className="w-full bg-gray-900 border border-gray-800 rounded-2xl pl-12 pr-6 py-4 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-600 shadow-lg"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center">
                        <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-800 border border-gray-700 rounded-lg">⌘ K</kbd>
                    </div>
                </div>
            </div>

            {/* Drag & Drop Board - Grid Layout */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 pb-8 items-start min-h-[600px]">
                    {statuses.map(status => (
                        <BoardColumn
                            key={status}
                            id={status}
                            title={status}
                            jobs={filteredJobs.filter(j => j.status === status)}
                            onDelete={deleteJob}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeJob ? (
                        <div className="opacity-90 rotate-3 cursor-grabbing scale-105">
                            <SortableJobCard job={activeJob} onDelete={() => { }} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Email Modal Component */}
            <AnimatePresence>
                {showEmailModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-gray-900 border border-gray-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
                                <h3 className="text-xl font-bold flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Mail className="w-5 h-5" /></div>
                                    Compose Application
                                </h3>
                                <button onClick={() => setShowEmailModal(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500 hover:text-white" /></button>
                            </div>
                            <form onSubmit={handleApply} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Company</label>
                                        <input placeholder="Ex. Google" required className="input w-full bg-gray-800 border-gray-700 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" value={emailForm.company} onChange={e => setEmailForm({ ...emailForm, company: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Position</label>
                                        <input placeholder="Ex. Senior Frontend Dev" required className="input w-full bg-gray-800 border-gray-700 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" value={emailForm.position} onChange={e => setEmailForm({ ...emailForm, position: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Recruiter Email</label>
                                    <input placeholder="recruiter@company.com" type="email" required className="input w-full bg-gray-800 border-gray-700 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" value={emailForm.recruiterEmail} onChange={e => setEmailForm({ ...emailForm, recruiterEmail: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Subject Line</label>
                                    <input placeholder="Application for [Role]" required className="input w-full bg-gray-800 border-gray-700 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none" value={emailForm.subject} onChange={e => setEmailForm({ ...emailForm, subject: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Message</label>
                                    <textarea placeholder="Hi [Name], I'm interested in..." required rows={5} className="input w-full bg-gray-800 border-gray-700 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" value={emailForm.body} onChange={e => setEmailForm({ ...emailForm, body: e.target.value })} />
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                                    <button type="button" onClick={() => setShowEmailModal(false)} className="px-6 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium transition-colors">Cancel</button>
                                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105">Send & Track</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Helper Components
const StatCard = ({ icon: Icon, label, value, color, bg, border }) => (
    <div className={`relative overflow-hidden ${bg} border ${border} p-6 rounded-2xl flex items-center gap-5 transition-transform hover:scale-[1.02]`}>
        <div className={`p-4 rounded-xl bg-gray-900/50 ${color}`}>
            <Icon className="w-8 h-8" />
        </div>
        <div>
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">{label}</p>
            <p className="text-3xl font-extrabold text-white">{value}</p>
        </div>
        {/* Decorative Background Icon */}
        <Icon className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-5 ${color}`} />
    </div>
);

export default JobBoard;
