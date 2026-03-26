const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  college: { type: String, required: true },
  branch: { type: String, required: true },
  year: { type: String, required: true },
  resumeUrl: { type: String, required: true }, // URL from cloudinary or local uploads
  resumeBuffer: { type: Buffer }, // Binary storage of the actual PDF file
  resumeMimeType: { type: String }, // MIME type (application/pdf)
  resumeFileName: { type: String }, // Original file name
  githubLink: { type: String },
  leetcodeLink: { type: String },
  knownSkills: [{
    type: String,
    lowercase: true,
    set: v => v ? v.toLowerCase() : v
  }],
  targetJobRole: {
    type: String,
    required: true,
    enum: [
      'MERN Developer',
      'Java Backend',
      'Data Scientist',
      'Frontend Developer',
      'Full Stack Developer',
      'Cloud Engineer',
      'Other'
    ]
  },
  processedSkillVector: [{
    skill: String,
    score: Number // 1: Beginner, 2: Intermediate, 3: Advanced
  }],
  missingSkills: [String],
  skillGapScore: { type: Number, default: 0 },
  readinessScore: { type: Number, default: 0 },
  learningPath: [String],
  extractedData: {
    phone: String,
    roleSummary: String,
    education: {
      degree: String,
      college: String,
      cgpa: Number
    },
    projects: [String],
    codingProfiles: {
      leetcodeRating: Number,
      codechefRating: Number,
      codeforcesRating: Number,
      problemsSolved: Number
    },
    certifications: [String],
    achievements: [String],
    languages: [String],
    interests: [String]
  },
  embedding: [Number]
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
