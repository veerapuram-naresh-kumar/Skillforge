const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Student = require('../models/Student');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const axios = require('axios');

const router = express.Router();

// Configure Cloudinary
const useCloudinary = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'demo_key';

if (useCloudinary) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

let storage;
if (useCloudinary) {
    storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'skillforge_resumes',
        allowed_formats: ['pdf'],
      },
    });
} else {
    const fs = require('fs');
    if (!fs.existsSync('./uploads')) {
        fs.mkdirSync('./uploads');
    }
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './uploads/')
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname)
        }
    });
}

const upload = multer({ storage: storage });

// @route   POST /student/register
// @desc    Register a new student profile and upload resume
// @access  Public
router.post('/register', upload.single('resume'), async (req, res) => {
  try {
    const {
      name, email, college, branch, year, githubLink, leetcodeLink, knownSkills, targetJobRole
    } = req.body;

    // Validate duplicate emails
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this email already exists' });
    }

    // Process skills into array from FormData string
    let parsedSkills = [];
    if (knownSkills) {
      try {
        parsedSkills = JSON.parse(knownSkills);
      } catch (e) {
        // fallback if it's sent as a comma separated string
        parsedSkills = knownSkills.split(',').map(s => s.trim());
      }
    }

    let resumeBuffer = null;
    let resumeMimeType = "";
    
    if (req.file) {
      resumeMimeType = req.file.mimetype;
      if (req.file.buffer) {
        resumeBuffer = req.file.buffer;
      } else if (req.file.path && !useCloudinary) {
        resumeBuffer = fs.readFileSync(req.file.path);
      }
    }

    // Normalize URL for frontend if local
    let finalUrl = resumeUrl || req.body.resumeUrl;
    if (finalUrl && !finalUrl.startsWith('http') && !useCloudinary) {
      finalUrl = `http://localhost:5000/${finalUrl}`;
    }

    const newStudent = new Student({
      name,
      email,
      college,
      branch,
      year,
      resumeUrl: finalUrl,
      resumeBuffer,
      resumeMimeType,
      resumeFileName: req.file ? req.file.originalname : "Resume.pdf",
      githubLink,
      leetcodeLink,
      knownSkills: parsedSkills,
      targetJobRole
    });

    await newStudent.save();

    res.status(201).json({
      message: 'Student registered successfully',
      student: newStudent
    });

  } catch (error) {
    console.error("Error saving student:", error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

// @route   GET /student/profile/:id
// @desc    Get student profile by ID
// @access  Public
router.get('/profile/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /student/view-resume/:email
// @desc    Serve the direct binary file from MongoDB by Email
// @access  Public
router.get('/view-resume/:email', async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.params.email });
    if (!student || !student.resumeBuffer) {
      return res.status(404).json({ message: 'No direct binary file found for this student email.' });
    }
    res.set('Content-Type', student.resumeMimeType || 'application/pdf');
    res.send(student.resumeBuffer);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /profileByEmail/:email
// @desc    Get student profile by Email
// @access  Public
router.get('/profileByEmail/:email', async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.params.email });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error("Error fetching student by email:", error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /profileByEmail/:email
// @desc    Update student profile and resume
// @access  Public
router.put('/profileByEmail/:email', upload.single('resume'), async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.params.email });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const {
      name, college, branch, year, githubLink, leetcodeLink, knownSkills, targetJobRole
    } = req.body;

    // Process skills
    let parsedSkills = student.knownSkills;
    if (knownSkills) {
      try {
        parsedSkills = JSON.parse(knownSkills);
      } catch (e) {
        parsedSkills = knownSkills.split(',').map(s => s.trim());
      }
    }

    // Update fields
    if (name) student.name = name;
    if (college) student.college = college;
    if (branch) student.branch = branch;
    if (year) student.year = year;
    if (githubLink !== undefined) student.githubLink = githubLink;
    if (leetcodeLink !== undefined) student.leetcodeLink = leetcodeLink;
    if (targetJobRole) student.targetJobRole = targetJobRole;
    student.knownSkills = parsedSkills;

    // Update resume if provided
    if (req.file) {
      student.resumeUrl = useCloudinary ? req.file.path : `http://localhost:5000/${req.file.path.replace(/\\/g, '/')}`;
      student.resumeMimeType = req.file.mimetype;
      student.resumeFileName = req.file.originalname;
      if (req.file.buffer) {
        student.resumeBuffer = req.file.buffer;
      } else if (req.file.path && !useCloudinary) {
        student.resumeBuffer = fs.readFileSync(req.file.path);
      }
    }

    await student.save();

    
    // Fetch updated student after AI pipeline
    const updatedStudent = await Student.findById(student._id);

    res.json({ message: 'Profile updated successfully', student: updatedStudent });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /upload-resume-direct/:email
// @desc    Upload resume binary directly from dashboard by email
// @access  Public
router.post('/upload-resume-direct/:email', upload.single('resume'), async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.params.email });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    if (req.file) {
      student.resumeUrl = useCloudinary ? req.file.path : `http://localhost:5000/${req.file.path.replace(/\\/g, '/')}`;
      student.resumeMimeType = req.file.mimetype;
      student.resumeFileName = req.file.originalname;
      if (req.file.buffer) {
        student.resumeBuffer = req.file.buffer;
      } else if (req.file.path && !useCloudinary) {
        student.resumeBuffer = fs.readFileSync(req.file.path);
      }
      await student.save();
      return res.json({ message: 'Resume uploaded successfully', resumeUrl: student.resumeUrl });
    }
    res.status(400).json({ message: 'No file uploaded' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /student/parse-resume
// @desc    Local Rule-Based Resume Parsing (Strictly No APIs)
// @access  Public
router.post('/parse-resume', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Resume PDF is required' });

        let dataBuffer;
        const filePath = req.file.path;

        if (filePath.startsWith('http')) {
            const response = await axios.get(filePath, { responseType: 'arraybuffer' });
            dataBuffer = Buffer.from(response.data);
        } else {
            dataBuffer = fs.readFileSync(filePath);
        }

        const pdfData = await pdfParse(dataBuffer);
        const text = pdfData.text || "";
        const lowerText = text.toLowerCase();

        // 1. Regex Extraction (Improved Local Patterns)
        const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        
        const githubLink = (() => {
            const match = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
            return match ? `https://github.com/${match[1]}` : "";
        })();

        const leetcodeLink = (() => {
            const match = text.match(/(?:https?:\/\/)?(?:www\.)?leetcode\.com\/([a-zA-Z0-9_-]+)/i);
            return match ? `https://leetcode.com/${match[1]}` : "";
        })();

        // 1b. Basic Name Extraction (Heuristics)
        let extractedName = "";
        const textLines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
        if (textLines.length > 0) {
            // Usually the first line with uppercase letters and no digits or special chars
            for (let line of textLines.slice(0, 3)) {
                if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+$/.test(line) && line.length < 50) {
                    extractedName = line;
                    break;
                }
            }
        }

        // 2. Skill Dictionary (Local Knowledge Base)
        const dictionary = [
            "Java", "JavaScript", "Python", "C++", "SQL", "React", "Node.js", "Express",
            "MongoDB", "MySQL", "Git", "Docker", "Firebase", "HTML", "CSS", "TypeScript",
            "PostgreSQL", "AWS", "Azure", "Flutter", "Swift", "Kotlin", "Spring Boot",
            "Next.js", "TailwindCSS", "Redux", "GraphQL", "Kubernetes"
        ];
        
        const extractedSkills = new Set();
        dictionary.forEach(skill => {
            const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escaped}\\b`, 'i');
            if (regex.test(text)) extractedSkills.add(skill);
        });

        // 3. Inference Logic (MERN, Frontend, etc.)
        if (lowerText.includes("mern")) ["MongoDB", "Express", "React", "Node.js"].forEach(s => extractedSkills.add(s));
        if (lowerText.includes("frontend")) ["HTML", "CSS", "JavaScript"].forEach(s => extractedSkills.add(s));
        if (lowerText.includes("backend")) ["Node.js", "Express", "SQL"].forEach(s => extractedSkills.add(s));

        // 4. Academic Extraction
        let college = "";
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5);
        for (let line of lines) {
            if (/college|university|institute|school|technology|engineering/i.test(line) && line.length < 100) {
                college = line;
                break;
            }
        }

        const parsedData = {
            name: extractedName,
            email: emailMatch ? emailMatch[0] : "",
            profiles: {
                github: githubLink,
                leetcode: leetcodeLink
            },
            skills: Array.from(extractedSkills),
            education: {
                college: college || "",
                branch: "",
                year: ""
            }
        };

        res.json({ success: true, parsedData, resumeText: text });

    } catch (error) {
        console.error("Local Parse Error:", error);
        res.status(500).json({ success: false, message: "Local parsing failed", error: error.message });
    }
});

// @route   GET /student/semantic-search
// @desc    Keyword-based Local Search (Alternative to Semantic Search without APIs)
// @access  Public
router.get('/semantic-search', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ message: "Query is required" });

        const keywords = query.toLowerCase().split(' ').filter(k => k.length > 2);
        
        // Find students whose skills or role match the keywords
        const students = await Student.find({
            $or: [
                { knownSkills: { $in: keywords.map(k => new RegExp(k, 'i')) } },
                { targetJobRole: { $regex: query, $options: 'i' } },
                { name: { $regex: query, $options: 'i' } }
            ]
        }).limit(10);

        const matches = students.map(s => ({
            ...s.toObject(),
            similarity: 0.9 // Static score for keyword match
        }));

        res.json({ success: true, matches });

    } catch (err) {
        res.status(500).json({ message: "Search Error", error: err.message });
    }
});


module.exports = router;
