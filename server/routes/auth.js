const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    console.log(`Register attempt for email: ${email}`);

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            // "Magic Register": User already exists. Let's see if the password matches, so we can just log them in!
            if (await userExists.matchPassword(password)) {
                console.log(`User already exists, seamless login: ${userExists._id}`);
                return res.status(200).json({
                    _id: userExists._id,
                    name: userExists.name,
                    email: userExists.email,
                    token: generateToken(userExists._id),
                });
            } else {
                console.log(`User already exists but password incorrect: ${email}`);
                return res.status(400).json({ message: 'User already exists. If this is you, please use the correct password or go to Login.' });
            }
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            console.log(`User created successfully: ${user._id}`);
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            console.log('Invalid user data provided');
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration Error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt for email: ${email}`);

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            console.log(`User logged in successfully: ${user._id}`);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            console.log(`Login failed for email: ${email} - Invalid credentials`);
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
