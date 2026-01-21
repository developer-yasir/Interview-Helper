const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const auth = require('../middleware/auth');

// GET all jobs for logged in user
router.get('/', auth, async (req, res) => {
    try {
        const jobs = await Job.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST new job
router.post('/', auth, async (req, res) => {
    try {
        const newJob = new Job({
            user: req.user.id,
            company: req.body.company,
            position: req.body.position,
            status: req.body.status,
            notes: req.body.notes,
            jobLink: req.body.jobLink
        });
        const savedJob = await newJob.save();
        res.status(201).json(savedJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PATCH update status
router.patch('/:id', auth, async (req, res) => {
    try {
        const updatedJob = await Job.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { status: req.body.status },
            { new: true }
        );
        if (!updatedJob) return res.status(404).json({ message: 'Job not found' });
        res.json(updatedJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE job
router.delete('/:id', auth, async (req, res) => {
    try {
        const deletedJob = await Job.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!deletedJob) return res.status(404).json({ message: 'Job not found' });
        res.json({ message: 'Job deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
