const mongoose = require('mongoose');

const profileSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: 'Guest User' },
    email: { type: String },
    phone: { type: String },
    jobTitle: { type: String },
    bio: { type: String },
    socialLinks: {
        linkedin: { type: String, default: '' },
        github: { type: String, default: '' },
        portfolio: { type: String, default: '' }
    },
    skills: [{ type: String }],
    experience: [{
        role: String,
        company: String,
        duration: String,
        description: String
    }],
    education: [{
        degree: String,
        school: String,
        year: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema);
