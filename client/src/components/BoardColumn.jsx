import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Circle, Clock, CheckCircle, XCircle, Briefcase } from 'lucide-react';
import SortableJobCard from './SortableJobCard';

const statusConfig = {
    'Wishlist': { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20', icon: Briefcase },
    'Applied': { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Clock },
    'Interviewing': { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: Circle },
    'Offer': { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: CheckCircle },
    'Rejected': { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: XCircle },
};

const BoardColumn = ({ id, title, jobs, onDelete }) => {
    const { setNodeRef, isOver } = useDroppable({ id });
    const config = statusConfig[title] || statusConfig['Wishlist'];
    const Icon = config.icon;

    return (
        <div className={`flex flex-col h-full w-full rounded-3xl border transition-all duration-300 ${isOver ? 'bg-gray-800/80 border-blue-500/50 shadow-2xl shadow-blue-500/10' : 'bg-gray-900/40 border-gray-800/50 hover:border-gray-700'}`}>
            {/* Header */}
            <div className="p-5 flex justify-between items-center sticky top-0 bg-inherit rounded-t-3xl z-10 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${config.bg} ${config.color} ring-1 ring-inset ring-white/10`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-100 text-base tracking-tight">{title}</h3>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">{jobs.length} Jobs</p>
                    </div>
                </div>
            </div>

            {/* Cards Container */}
            <div
                ref={setNodeRef}
                className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent space-y-4 min-h-[200px]"
            >
                <SortableContext items={jobs.map(j => j._id)} strategy={verticalListSortingStrategy}>
                    {jobs.map((job) => (
                        <SortableJobCard
                            key={job._id}
                            job={job}
                            onDelete={onDelete}
                        />
                    ))}
                </SortableContext>

                {jobs.length === 0 && !isOver && (
                    <div className="h-40 mx-2 rounded-2xl flex flex-col items-center justify-center text-gray-700 space-y-3 border-2 border-dashed border-gray-800/50 bg-gray-900/20 group hover:border-gray-700/50 hover:bg-gray-800/20 transition-all">
                        <div className="p-4 rounded-full bg-gray-800/50 group-hover:bg-gray-800 transition-colors">
                            <Icon className="w-6 h-6 opacity-30 group-hover:opacity-50 transition-opacity" />
                        </div>
                        <span className="text-sm font-medium opacity-50 group-hover:opacity-70 transition-opacity">No jobs yet</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BoardColumn;
