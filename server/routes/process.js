const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { getRecommendations, getRoadmap } = require('../services/learningResources');

// Utility function to normalize and map skills
const normalizeAndMapSkills = (skillsArray) => {
    // 1. & 2. Lowercase and normalize spaces
    let processed = skillsArray.map(s => s.toLowerCase().trim());

    // 3. Map similar skills
    // We can add to this dictionary as the project grows
    const mappings = {
        'nodejs': 'node',
        'node.js': 'node',
        'reactjs': 'react',
        'react.js': 'react',
        'dsa': 'dsa',
        'data structures and algorithms': 'dsa',
        'js': 'javascript',
        'cpp': 'c++',
        'python3': 'python',
        'c#': 'csharp',
        'ml': 'machine learning',
        'ai': 'artificial intelligence'
    };

    processed = processed.map(skill => mappings[skill] || skill);

    // Remove duplicates using Set
    return [...new Set(processed)];
};

// 4. Encode skill proficiency score
const encodeScore = (level) => {
    if (!level) return 2; // Default to intermediate if not specified
    const l = level.toLowerCase();
    if (l === 'beginner') return 1;
    if (l === 'intermediate') return 2;
    if (l === 'advanced') return 3;
    return 2;
};

const roleRequirements = {
    'mern developer': ['mongodb', 'express', 'react', 'node', 'javascript'],
    'java backend': ['java', 'spring boot', 'sql', 'hibernate', 'rest api'],
    'data scientist': ['python', 'sql', 'machine learning', 'data visualization', 'pandas'],
    'frontend developer': ['html', 'css', 'javascript', 'react'],
    'full stack developer': ['javascript', 'react', 'node', 'sql', 'html', 'css'],
    'cloud engineer': ['aws', 'linux', 'docker', 'kubernetes', 'bash'],
    'other': []
};

// @route   POST /process/profile/:id
// @desc    Preprocess a student's skills and store the vector
// @access  Public
router.post('/profile/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Extract known skills from student profile
        const rawSkills = student.knownSkills || [];

        // 1, 2, 3: Normalize, map, remove duplicates
        const uniqueNormalizedSkills = normalizeAndMapSkills(rawSkills);

        // Accept optional proficiencies from request body
        const userProvidedProficiencies = req.body.proficiencies || {};

        // 4 & 5. Encode proficiency and structure the vector to store
        const processedSkillVector = uniqueNormalizedSkills.map(skill => {
            const levelText = userProvidedProficiencies[skill];
            return {
                skill: skill,
                score: encodeScore(levelText)
            };
        });

        // 6. Calculate Skill Gap & Readiness
        const role = (student.targetJobRole || '').toLowerCase();
        const requiredSkills = roleRequirements[role] || [];

        let matchCount = 0;
        let missing = [];
        const studentSkillNames = processedSkillVector.map(v => v.skill);

        requiredSkills.forEach(reqSkill => {
            if (studentSkillNames.includes(reqSkill)) {
                matchCount++;
            } else {
                missing.push(reqSkill);
            }
        });

        const totalRequired = requiredSkills.length;
        let readinessScore = 0;
        let skillGapScore = 0;

        if (totalRequired > 0) {
            readinessScore = Math.round((matchCount / totalRequired) * 100);
            skillGapScore = 100 - readinessScore;
        } else {
            readinessScore = 100;
            skillGapScore = 0;
        }

        // 7. Extract Resume Parsing JSON dynamically using Gemini AI
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const fs = require('fs');
        const path = require('path');
        const axios = require('axios');

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyBMTzJhNP4n2svro0iYTjXgQozAyBAKziM');
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let dataBuffer;
        try {
            if (student.resumeUrl.startsWith('http')) {
                const response = await axios.get(student.resumeUrl, { responseType: 'arraybuffer' });
                dataBuffer = response.data;
            } else {
                dataBuffer = fs.readFileSync(path.resolve(student.resumeUrl));
            }
        } catch (err) {
            console.error("PDF Read Error:", err);
            dataBuffer = Buffer.from("No readable PDF buffer");
        }

        const prompt = `
        Analyze the attached resume document and extract the information into a strict JSON object with this exact structure:
        {
          "phone": "string or empty",
          "roleSummary": "string or empty",
          "education": {
            "degree": "string",
            "college": "string",
            "cgpa": number or evaluate if text says percentage
          },
          "projects": ["string array of project names"],
          "codingProfiles": {
            "leetcodeRating": number or 0,
            "codechefRating": number or 0,
            "codeforcesRating": number or 0,
            "problemsSolved": number or 0
          },
          "certifications": ["string array"],
          "achievements": ["string array"],
          "languages": ["string array"],
          "interests": ["string array"],
          "knownSkills": ["string array of all technical skills discovered"],
          "learningPath": ["string array: Provide exactly 5 prioritized, actionable learning steps/technologies the user must master next to achieve their Target Role of: ${student.targetJobRole || 'Software Engineer'}. Base this heavily on the skills they currently lack in their resume."]
        }
        
        Only return the JSON object, NO markdown formatting, NO backticks.
        `;

        try {
            const result = await model.generateContent([
                prompt,
                { inlineData: { data: dataBuffer.toString("base64"), mimeType: "application/pdf" } }
            ]);
            let responseText = result.response.text().trim();
            if (responseText.startsWith('\`\`\`json')) responseText = responseText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
            else if (responseText.startsWith('\`\`\`')) responseText = responseText.replace(/\`\`\`/g, '');
            
            const parsedData = JSON.parse(responseText);

            student.extractedData = parsedData;

            // Automatically sync extracted data into the main User Profile fields so it shows up everywhere!
            if (parsedData.education) {
                if (parsedData.education.college && !student.college) student.college = parsedData.education.college;
                if (parsedData.education.degree && !student.branch) student.branch = parsedData.education.degree;
            }
            if (parsedData.githubLink && !student.githubLink) student.githubLink = parsedData.githubLink;
            if (parsedData.leetcodeLink && !student.leetcodeLink) student.leetcodeLink = parsedData.leetcodeLink;

            // Merge parsed knownSkills natively discovered from the resume
            const parsedSkillsList = parsedData.knownSkills || [];
            parsedSkillsList.forEach(ps => {
                const mappedPs = normalizeAndMapSkills([ps])[0];
                if (mappedPs && !studentSkillNames.includes(mappedPs)) {
                    studentSkillNames.push(mappedPs);
                    processedSkillVector.push({ skill: mappedPs, score: 2 });
                }
            });

            if (parsedData.learningPath && Array.isArray(parsedData.learningPath)) {
                student.learningPath = parsedData.learningPath;
            }
            
            // Recalculate gap with injected pdf parsed skills locally
            matchCount = 0; missing = [];
            requiredSkills.forEach(reqSkill => {
                if (studentSkillNames.includes(reqSkill)) matchCount++;
                else missing.push(reqSkill);
            });
            
            if (totalRequired > 0) {
                readinessScore = Math.round((matchCount / totalRequired) * 100);
                skillGapScore = 100 - readinessScore;
            }
        } catch(aiError) {
             console.error("Gemini Extraction Error:", aiError);
             student.extractedData = { phone: "Parse Failed", roleSummary: "AI could not parse Document", projects: [] }; // fallback
        }

        // Update the database
        student.processedSkillVector = processedSkillVector;
        student.missingSkills = missing;
        student.readinessScore = readinessScore;
        student.skillGapScore = skillGapScore;

        await student.save();

        res.json({
            message: 'Profile preprocessed and gap scores calculated successfully',
            targetRole: student.targetJobRole,
            originalSkills: rawSkills,
            processedVector: student.processedSkillVector,
            missingSkills: student.missingSkills,
            readinessScore: student.readinessScore,
            skillGapScore: student.skillGapScore
        });

    } catch (error) {
        console.error("Error preprocessing profile:", error);
        res.status(500).json({ message: 'Server error during preprocessing' });
    }
});

// @route   GET /process/learning-recommendations/:id
// @desc    Dynamically compute missing skills from processedSkillVector + targetJobRole,
//          then return curated learning recommendations AND an ordered phased roadmap.
// @access  Public
router.get('/learning-recommendations/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const targetRole = (student.targetJobRole || '').toLowerCase();
        const requiredSkills = roleRequirements[targetRole] || [];

        // Build student's normalized skill set from processedSkillVector
        const studentSkills = (student.processedSkillVector || []).map(v =>
            typeof v === 'string' ? v.toLowerCase().trim() : (v.skill || '').toLowerCase().trim()
        );

        // Also include raw knownSkills as fallback (normalized)
        const rawNormalized = (student.knownSkills || []).map(s => {
            const mappings = {
                'nodejs': 'node', 'node.js': 'node', 'reactjs': 'react', 'react.js': 'react',
                'js': 'javascript', 'cpp': 'c++', 'python3': 'python', 'c#': 'csharp',
                'ml': 'machine learning', 'ai': 'artificial intelligence'
            };
            const lower = s.toLowerCase().trim();
            return mappings[lower] || lower;
        });

        const allStudentSkills = [...new Set([...studentSkills, ...rawNormalized])];

        // Compute missing skills dynamically
        const missingSkills = requiredSkills.filter(req => !allStudentSkills.includes(req));
        const matchedSkills = requiredSkills.filter(req => allStudentSkills.includes(req));
        const readinessScore = requiredSkills.length > 0
            ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
            : 100;

        if (missingSkills.length === 0) {
            return res.json({
                jobReady: true,
                message: 'You are job ready! 🎉 No missing skills detected.',
                targetRole: student.targetJobRole,
                readinessScore: 100,
                skillGap: [],
                roadmap: []
            });
        }


        const recommendations = getRecommendations(missingSkills);
        const roadmap = getRoadmap(missingSkills, targetRole);

        res.json({
            jobReady: false,
            targetRole: student.targetJobRole,
            readinessScore,
            missingSkills,
            matchedSkills,
            skillGap: recommendations,
            roadmap
        });
    } catch (error) {
        console.error('Learning Recommendations Error:', error);
        res.status(500).json({ message: 'Server error fetching recommendations' });
    }
});

module.exports = router;
