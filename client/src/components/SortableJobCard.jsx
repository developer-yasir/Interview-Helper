import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripVertical, Clock, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

const SortableJobCard = ({ job, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: job._id, data: { ...job } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const getDaysSinceApplied = () => {
        const diff = new Date() - new Date(job.dateApplied);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        return days === 0 ? 'Today' : `${days}d ago`;
    };

    // Generate a consistent color based on company name
    const getLogoColor = (name) => {
        const colors = [
            'from-blue-500 to-cyan-500',
            'from-purple-500 to-pink-500',
            'from-orange-500 to-red-500',
            'from-green-500 to-emerald-500',
            'from-yellow-500 to-orange-500',
            'from-indigo-500 to-purple-500',
        ];
        const index = name.length % colors.length;
        return colors[index];
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-gray-800 border border-gray-700/50 p-4 rounded-xl shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-blue-500/10 hover:border-gray-600/80 transition-all group relative cursor-grab active:cursor-grabbing mb-3"
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-9 h-9 flex-shrink-0 rounded-lg bg-gradient-to-br ${getLogoColor(job.company)} flex items-center justify-center text-white font-bold text-base shadow-lg`}>
                        {job.company.substring(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-gray-100 leading-tight text-sm mb-0.5 truncate" title={job.position}>{job.position}</h4>
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium truncate">
                            <Building2 className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate" title={job.company}>{job.company}</span>
                        </div>
                    </div>
                </div>

                {/* Drag Handle (Visible on hover) */}
                <div className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <GripVertical className="w-4 h-4" />
                </div>
            </div>

            <div className="flex justify-between items-center text-[11px] mt-2 pt-2 border-t border-gray-700/30">
                <div className="flex items-center gap-1 text-gray-400 bg-gray-900/50 px-2 py-1 rounded-md font-medium">
                    <Clock className="w-3 h-3" />
                    {getDaysSinceApplied()}
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(job._id);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="text-gray-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Delete Application"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            {isDragging && (
                <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-500 rounded-xl z-50 pointer-events-none ring-4 ring-blue-500/20" />
            )}
        </div>
    );
};

export default SortableJobCard;
