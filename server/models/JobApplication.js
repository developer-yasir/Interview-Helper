const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
    company: { type: String, required: true },
    position: { type: String, required: true },
    status: {
        type: String,
        enum: ['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'],
        default: 'Applied'
    },
    salary: { type: String },
    dateApplied: { type: Date, default: Date.now },
    jobLink: { type: String },
    notes: { type: String },
    userId: { type: String, default: 'demo-user' } // Placeholder for future auth
}, { timestamps: true });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
