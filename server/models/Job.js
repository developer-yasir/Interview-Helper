const mongoose = require('mongoose');

const jobSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: String, required: true },
    position: { type: String, required: true },
    status: {
        type: String,
        required: true,
        enum: ['Applied', 'Interviewing', 'Offer', 'Rejected'],
        default: 'Applied'
    },
    dateApplied: { type: Date, default: Date.now },
    notes: { type: String },
    jobLink: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);
