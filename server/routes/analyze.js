const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const axios = require("axios");
const User = require("../models/User");

// Initialize OpenAI inside route or outside
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Needs Open AI API Key
});

// Helper: Fetch GitHub Skills
async function fetchGithubSkills(username) {
    if (!username) return [];
    try {
        const response = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
        const repos = response.data;
        const languages = new Set();

        // Extract languages from repos
        repos.forEach(repo => {
            if (repo.language) languages.add(repo.language);
        });

        return Array.from(languages);
    } catch (error) {
        console.error("GitHub API Error:", error.message);
        return [];
    }
}

// Helper: Analyze Academic Performance
function analyzeAcademics(records) {
    if (!records || records.length === 0) return { trend: "No Data", weakAreas: [], strongAreas: [] };

    let totalScore = 0;
    let subjectCount = 0;
    let weakAreas = [];
    let strongAreas = [];

    records.forEach(sem => {
        sem.subjects.forEach(sub => {
            totalScore += sub.score;
            subjectCount++;

            // Simple logic: < 60 is weak, > 80 is strong
            if (sub.score < 60) weakAreas.push(sub.name);
            if (sub.score > 80) strongAreas.push(sub.name);
        });
    });

    const average = subjectCount > 0 ? (totalScore / subjectCount).toFixed(2) : 0;

    return {
        averageScore: average,
        weakAreas: [...new Set(weakAreas)],
        strongAreas: [...new Set(strongAreas)],
        recommendation: weakAreas.length > 0 ? `Focus on improving: ${weakAreas.join(", ")}` : "Great academic performance!"
    };
}

router.post("/analyze", async (req, res) => {
    const { userId, role } = req.body; // Expect userId to fetch full profile

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 1. Skill Detection Engine
        const githubSkills = await fetchGithubSkills(user.githubUsername);

        const projectSkills = user.projects ? user.projects.reduce((acc, proj) => {
            return acc.concat(proj.technologies || []);
        }, []) : [];

        const certSkills = user.certifications ? user.certifications.map(c => c.name) : [];

        const allSkills = [...new Set([...githubSkills, ...projectSkills, ...certSkills, ...(user.extractedSkills || [])])];

        // 2. Academic Analyzer
        const academicAnalysis = analyzeAcademics(user.academicRecords);

        // 3. AI Analysis
        let aiInsights = { error: "AI service unavailable" };
        try {
            const prompt = `
            Role: Career & Academic Advisor.
            
            User Profile:
            - Target Role: ${role || "Software Engineer"}
            - Detected Skills (GitHub/Projects/Certs): ${allSkills.join(", ")}
            - Academic Performance: Average ${academicAnalysis.averageScore}%. 
            - Strong Subjects: ${academicAnalysis.strongAreas.join(", ")}
            - Weak Subjects: ${academicAnalysis.weakAreas.join(", ")}
            
            Task:
            1. Analyze the skill gap for the target role based on the VALIDATED skills from GitHub/Projects.
            2. Provide strategic advice to improve academic scores, specifically for the weak subjects.
            3. Suggest a project that combines their strong subjects and current skills.
            
            Format: JSON with keys: 'skillGap', 'academicAdvice', 'projectSuggestion'.
            `;

            const response = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    { role: "system", content: "You provide structured career and academic advice." },
                    { role: "user", content: prompt }
                ]
            });

            const aiContent = response.choices[0].message.content;
            try {
                aiInsights = JSON.parse(aiContent);
            } catch (e) {
                aiInsights = { raw: aiContent };
            }
        } catch (aiError) {
            console.error("AI Generation Failed:", aiError.message);
            // Continue to return partial data
        }

        const analysisResults = {
            detectedSkills: allSkills,
            academicAnalysis,
            aiInsights
        };

        // Save to User Profile for Dashboard
        user.extractedSkills = allSkills;
        user.analysisResults = analysisResults;
        await user.save();

        res.json(analysisResults);
    } catch (error) {
        console.error("Analysis Error:", error);
        res.status(500).json({ error: "Failed to perform analysis" });
    }
});

module.exports = router;
