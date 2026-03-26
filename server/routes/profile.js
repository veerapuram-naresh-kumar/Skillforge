
const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Middleware to protect routes (should verify token)
// For now, assuming user ID is passed in body or we trust the client (not secure but simple)
// Ideally use a middleware like 'protect' from auth.js if exported

// Update user profile
router.put('/update', async (req, res) => {
    const { userId, githubUsername, projects, certifications, assessments, academicRecords } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.githubUsername = githubUsername || user.githubUsername;
        user.projects = projects || user.projects;
        user.certifications = certifications || user.certifications;
        user.assessments = assessments || user.assessments;
        user.academicRecords = academicRecords || user.academicRecords;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            githubUsername: updatedUser.githubUsername,
            projects: updatedUser.projects,
            certifications: updatedUser.certifications,
            assessments: updatedUser.assessments,
            academicRecords: updatedUser.academicRecords
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Get user profile
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
