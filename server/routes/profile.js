const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');

// GET profile
router.get('/', auth, async (req, res) => {
    try {
        let profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            // Return empty or 404. Let's return empty/default structure if not found to avoid null checks on frontend
            // Actually, better to just return null and let frontend handle "Create Profile" state
            // But to match current behavior:
            profile = {
                user: req.user.id,
                name: 'New User',
                email: '',
                socialLinks: { linkedin: '', github: '', portfolio: '' },
                skills: [],
                experience: [],
                education: []
            };
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST/UPDATE profile
router.post('/', auth, async (req, res) => {
    try {
        let profile = await Profile.findOne({ user: req.user.id });

        // Build profile object from req.body
        const profileFields = { ...req.body, user: req.user.id };

        if (profile) {
            // Update existing
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            );
        } else {
            // Create new
            profile = await Profile.create(profileFields);
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
