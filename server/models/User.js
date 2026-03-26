const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    githubUsername: {
        type: String,
        default: ''
    },
    projects: [{
        title: String,
        description: String,
        link: String,
        technologies: [String]
    }],
    certifications: [{
        name: String,
        issuer: String,
        date: Date
    }],
    assessments: [{
        name: String,
        score: Number,
        date: Date
    }],
    academicRecords: [{
        semester: String,
        subjects: [{
            name: String,
            score: Number,
            totalScore: Number,
            grade: String
        }]
    }],
    extractedSkills: [String],
    analysisResults: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
