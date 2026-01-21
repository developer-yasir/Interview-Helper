const mongoose = require('mongoose');

const interviewSessionSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Technical', 'Behavioral', 'Mixed', 'Job-Specific']
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['Easy', 'Medium', 'Hard']
    },
    messages: [
        {
            role: { type: String, enum: ['user', 'assistant', 'system'] },
            content: { type: String }
        }
    ],
    feedback: {
        type: String
    },
    score: {
        type: Number,
        min: 0,
        max: 100
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
