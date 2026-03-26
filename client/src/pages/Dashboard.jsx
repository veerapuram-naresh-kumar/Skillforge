import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import FloatingCard from '../components/FloatingCard';
import RadarChart from '../components/RadarChart';
import AIInsightPanel from '../components/AIInsightPanel';
import SkillPill from '../components/SkillPill';
import GlowButton from '../components/GlowButton';
import LearningRecommendations from '../components/LearningRecommendations';
import SkillRoadmap from '../components/SkillRoadmap';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';


const Dashboard = () => {
    const { user, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    // Data State
    const [fullProfile, setFullProfile] = useState(null);
    const [analysisData, setAnalysisData] = useState(null);
    const [analysisLoading, setAnalysisLoading] = useState(true);

    // Learning Recommendations State
    const [recommendations, setRecommendations] = useState([]);
    const [recommendationsLoading, setRecommendationsLoading] = useState(false);
    const [recommendationsJobReady, setRecommendationsJobReady] = useState(false);
    const [roadmapData, setRoadmapData] = useState([]);
    const [matchedSkillsData, setMatchedSkillsData] = useState([]);
    const [readinessScoreData, setReadinessScoreData] = useState(0);
    const [missingSkillsData, setMissingSkillsData] = useState([]);

    // Semantic Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        } else if (user) {
            // Fetch Latest Profile Data
            const fetchProfile = async () => {
                try {
                    // Assuming we have an endpoint to get full profile or we store it in context
                    // For now, let's fetch it or use what we have if specific endpoint exists
                    // We'll use the profile route I created earlier: /api/profile/:id
                    const res = await axios.get(`http://localhost:5000/api/profile/${user._id}`);

                    // Fetch the Student collection profile where readinessScore is saved
                    let studentData = {};
                    try {
                        const studentRes = await axios.get(`http://localhost:5000/student/profileByEmail/${user.email}`);
                        studentData = studentRes.data;
                    } catch (e) {
                        console.log("No student profile found yet");
                    }

                    // Merge both so we have access to all data
                    const mergedProfile = { ...res.data, ...studentData };
                    setFullProfile(mergedProfile);

                    if (mergedProfile.analysisResults && Object.keys(mergedProfile.analysisResults).length > 0) {
                        setAnalysisData(mergedProfile.analysisResults);
                        setAnalysisLoading(false);
                    } else {
                        // User has no analysis checks, maybe redirect to setup?
                        // For now just stop loading
                        setAnalysisLoading(false);
                    }

                    // Fetch Learning Recommendations using student MongoDB _id
                    if (studentData?._id) {
                        setRecommendationsLoading(true);
                        try {
                            const recRes = await axios.get(`http://localhost:5000/process/learning-recommendations/${studentData._id}`);
                            const recData = recRes.data;
                            setRecommendationsJobReady(recData.jobReady || false);
                            setRecommendations(recData.skillGap || []);
                            setRoadmapData(recData.roadmap || []);
                            setMatchedSkillsData(recData.matchedSkills || []);
                            setMissingSkillsData(recData.missingSkills || []);
                            setReadinessScoreData(recData.readinessScore ?? 0);
                        } catch (recErr) {
                            console.error('Failed to fetch learning recommendations', recErr);
                        } finally {
                            setRecommendationsLoading(false);
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch profile", error);
                    setAnalysisLoading(false);
                }
            };
            fetchProfile();
        }
    }, [user, authLoading, navigate]);

    const handleSemanticSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;
        
        setIsSearching(true);
        try {
            const res = await axios.get(`http://localhost:5000/student/semantic-search?query=${encodeURIComponent(searchQuery)}`);
            setSearchResults(res.data.matches || []);
        } catch (err) {
            console.error("Search Failed:", err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const data = new FormData();
        data.append('resume', file);

        try {
            const res = await axios.post(`http://localhost:5000/student/upload-resume-direct/${user.email}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Update profile with new resume URL
            setFullProfile(prev => ({ ...prev, resumeUrl: res.data.resumeUrl }));
            window.location.reload(); // Refresh to ensure binary stream is ready
        } catch (err) {
            console.error("Upload failed", err);
            alert("Upload failed. Try again.");
        } finally {
            setIsUploading(false);
        }
    };

    // Derived Data
    const skills = analysisData?.detectedSkills?.map(s => ({ name: s, level: 'detected' })) || [];

    // Parse AI Insights safely
    const ai = analysisData?.aiInsights || {};
    // eslint-disable-next-line no-unused-vars
    const roadmap = ai.projectSuggestion ? [{ week: 1, title: "Foundation", desc: "Review Core Concepts" }, { week: 2, title: "Project Kickoff", desc: ai.projectSuggestion }] : [];

    // Academic Stats
    const academic = analysisData?.academicAnalysis || { averageScore: 0, weakAreas: [], strongAreas: [] };

    // Real-time calculation state
    const [selectedRole, setSelectedRole] = useState('');
    const [dynamicReadiness, setDynamicReadiness] = useState(0);
    const [dynamicGap, setDynamicGap] = useState(0);
    const [dynamicMissing, setDynamicMissing] = useState([]);

    const roles = [
        'MERN Developer', 'Java Backend', 'Data Scientist',
        'Frontend Developer', 'Full Stack Developer', 'Cloud Engineer', 'Other'
    ];

    const roleRequirements = {
        'mern developer': ['mongodb', 'express', 'react', 'node', 'javascript'],
        'java backend': ['java', 'spring boot', 'sql', 'hibernate', 'rest api'],
        'data scientist': ['python', 'sql', 'machine learning', 'data visualization', 'pandas'],
        'frontend developer': ['html', 'css', 'javascript', 'react'],
        'full stack developer': ['javascript', 'react', 'node', 'sql', 'html', 'css'],
        'cloud engineer': ['aws', 'linux', 'docker', 'kubernetes', 'bash'],
        'other': []
    };

    // Calculate dynamically when role changes
    useEffect(() => {
        if (!fullProfile) return;

        // Initialize if not set
        if (!selectedRole && (fullProfile.targetRole || fullProfile.targetJobRole)) {
            setSelectedRole(fullProfile.targetRole || fullProfile.targetJobRole);
            return;
        }

        if (fullProfile.processedSkillVector && selectedRole) {
            const reqSkills = roleRequirements[selectedRole.toLowerCase()] || [];
            let matchCount = 0;
            let missing = [];

            // Allow string parsing fallback
            const studentSkills = fullProfile.processedSkillVector.map(v => typeof v === 'string' ? v.toLowerCase() : (v.skill || '').toLowerCase());

            reqSkills.forEach(req => {
                if (studentSkills.includes(req)) {
                    matchCount++;
                } else {
                    missing.push(req);
                }
            });

            const total = reqSkills.length;
            if (total > 0) {
                const readiness = Math.round((matchCount / total) * 100);
                setDynamicReadiness(readiness);
                setDynamicGap(100 - readiness);
            } else {
                setDynamicReadiness(100);
                setDynamicGap(0);
            }
            setDynamicMissing(missing);
        } else {
            // Fallback to static DB data if processed skills vector somehow missing
            setDynamicReadiness(fullProfile.readinessScore || 0);
            setDynamicGap(fullProfile.skillGapScore || 0);
            setDynamicMissing(fullProfile.missingSkills || []);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fullProfile, selectedRole]);

    // Chart Data (Academic vs Skill Mock)
    const chartData = {
        labels: ['Academics', 'Practical Skills', 'Projects', 'Certifications', 'Soft Skills'],
        datasets: [
            {
                label: 'Your Profile',
                data: [
                    academic.averageScore || 0,
                    skills.length * 10, // heuristic
                    fullProfile?.projects?.length * 20 || 0,
                    fullProfile?.certifications?.length * 20 || 0,
                    70 // Mock soft skills for now
                ],
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: '#3b82f6',
                borderWidth: 2,
            },
            {
                label: 'Market Standard',
                data: [75, 80, 60, 40, 80], // Benchmark
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                borderColor: '#ec4899',
                borderWidth: 2,
                borderDash: [5, 5],
            },
        ],
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <header className="flex justify-between items-center mb-8">
                    <div className="animate-fade-in">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                            Dashboard
                        </h1>
                        <p className="text-slate-400">Welcome back, {user ? user.name : 'Space Cadet'} 👨‍🚀</p>
                    </div>
                    <div className="flex-1 max-w-md mx-8 relative" ref={searchRef}>
                        <form onSubmit={handleSemanticSearch} className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search Talent (e.g. Java, Python, React)"
                                className="w-full bg-slate-800/80 border border-slate-700/50 rounded-full py-2.5 pl-5 pr-12 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
                            />
                            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white transition-colors">
                                {isSearching ? (
                                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                )}
                            </button>
                        </form>
                        
                        {/* Search Results Dropdown */}
                        {searchResults.length > 0 && searchQuery && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-3 py-1 mb-1 flex justify-between">
                                    <span>Top Talent Matches</span>
                                    <button onClick={() => setSearchResults([])} className="hover:text-red-400">Close</button>
                                </div>
                                {searchResults.map((match, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-white/5">
                                        <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 font-bold">
                                            {match.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-sm font-bold truncate">{match.name}</h4>
                                                <span className="text-[10px] font-mono text-emerald-400">Keyword Match</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 truncate">{match.targetJobRole} @ {match.college}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-4 items-center">
                        <button onClick={() => navigate('/profile')} className="text-slate-300 hover:text-white font-semibold transition-colors">Profile</button>
                        <button onClick={handleLogout} className="text-red-400 hover:text-red-300 font-semibold transition-colors">Logout</button>
                    </div>
                </header>

                {(!analysisData && typeof fullProfile?.readinessScore === 'undefined') && !analysisLoading ? (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-4">No Profile Data Found</h2>
                        <p className="text-slate-400 mb-6">Complete your profile setup to generate your Career Readiness scores.</p>
                        <GlowButton onClick={() => navigate('/profile-setup')}>Start Analysis 🚀</GlowButton>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Left Column - Stats */}
                        <div className="space-y-6">
                            <FloatingCard delay={0.1} className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border-indigo-500/30">
                                <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Academic Score</h3>
                                <div className="flex items-center gap-4">
                                    <div className="relative w-24 h-24 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="50%" cy="50%" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-700" />
                                            <circle cx="50%" cy="50%" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-green-400"
                                                strokeDasharray="251.2"
                                                strokeDashoffset={251.2 - (251.2 * ((parseFloat(fullProfile?.extractedData?.education?.cgpa) || 0) <= 10 ? (parseFloat(fullProfile?.extractedData?.education?.cgpa) || 0) * 10 : (parseFloat(fullProfile?.extractedData?.education?.cgpa) || 0)) / 100)}
                                            />
                                        </svg>
                                        <span className="absolute text-xl font-bold">
                                            {fullProfile?.extractedData?.education?.cgpa ? 
                                                (parseFloat(fullProfile.extractedData.education.cgpa) <= 10 ? `${fullProfile.extractedData.education.cgpa} CGPA` : `${fullProfile.extractedData.education.cgpa}%`) 
                                            : '0.00%'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-green-400 font-medium">Valid Performance</p>
                                        <p className="text-xs text-slate-400">Extracted from Resume</p>
                                    </div>
                                </div>
                            </FloatingCard>

                            <FloatingCard delay={0.15} className="bg-gradient-to-br from-purple-900/40 to-slate-900/40 border-purple-500/30">
                                <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Career Readiness</h3>
                                <div className="flex items-center gap-4">
                                    <div className="relative w-24 h-24 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="50%" cy="50%" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-700" />
                                            <circle cx="50%" cy="50%" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                                                strokeDasharray="251.2"
                                                strokeDashoffset={251.2 - (251.2 * (dynamicReadiness / 100))}
                                                className="text-purple-400 transition-all duration-1000 ease-out"
                                            />
                                        </svg>
                                        <span className="absolute text-2xl font-bold">{dynamicReadiness}%</span>
                                    </div>
                                    <div>
                                        <p className="text-purple-400 font-medium">Industry Ready</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Target role: <span className="font-semibold text-white">{selectedRole || 'Not Set'}</span>
                                        </p>
                                        <p className="text-xs text-red-400 mt-2">Skill Gap: {dynamicGap}%</p>
                                    </div>
                                </div>
                            </FloatingCard>

                            {/* Missing Required Skills */}
                            {dynamicMissing && dynamicMissing.length > 0 && (
                                <FloatingCard delay={0.18} className="bg-gradient-to-br from-red-900/20 to-slate-900/40 border-red-500/30">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Critical Missing Skills</h3>
                                        <span className="bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded-lg border border-red-500/30 font-bold">{dynamicMissing.length} Actions Required</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {dynamicMissing.map((skill, index) => (
                                            <span key={`miss-${index}`} className="flex items-center gap-1.5 bg-red-900/40 text-red-300 px-3 py-1.5 rounded-lg text-xs font-mono border border-red-500/20">
                                                <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-white/5">
                                        Master these to boost your readiness score for the <span className="font-semibold text-white capitalize">{selectedRole}</span> role.
                                    </p>
                                </FloatingCard>
                            )}

                            {/* AI Learning Path */}
                            {fullProfile?.learningPath && fullProfile.learningPath.length > 0 && (
                                <FloatingCard delay={0.2} className="bg-gradient-to-br from-emerald-900/20 to-slate-900/40 border-emerald-500/30 mt-6 block w-full col-span-1">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-xl">🚀</span>
                                        <h3 className="text-emerald-400 text-sm font-bold uppercase tracking-wider">AI Generated Learning Path</h3>
                                    </div>
                                    <ul className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-emerald-500/30 before:to-transparent">
                                        {fullProfile.learningPath.map((step, index) => (
                                            <li key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-emerald-500/30 bg-emerald-900/50 text-emerald-300 font-bold text-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_10px_rgba(16,185,129,0.2)] relative z-10 mx-5 md:mx-auto">
                                                    {index + 1}
                                                </div>
                                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-900/60 p-4 rounded-xl border border-white/5 shadow-lg relative group-hover:border-emerald-500/30 transition-colors">
                                                    <p className="text-sm text-slate-300 leading-relaxed font-medium">{step}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </FloatingCard>
                            )}

                            <FloatingCard delay={0.2}>
                                <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Detected Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {skills.length > 0 ? skills.map((s, i) => (
                                        <SkillPill key={i} skill={s.name} level={s.level} />
                                    )) : <p className="text-slate-500">No skills detected yet.</p>}
                                </div>
                            </FloatingCard>

                            {/* Stored Resume File Box - Direct Binary Storage */}
                            <FloatingCard delay={0.25} className="bg-slate-800/40 border-indigo-500/20 overflow-hidden">
                                <h3 className="text-gray-200 text-sm font-bold uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Stored Resume File</h3>
                                
                                <div className="flex flex-col items-center justify-center p-6 bg-black/40 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-all cursor-pointer">
                                    <div className="relative mb-4">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                        <div className="relative w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                                            <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                        </div>
                                    </div>
                                    
                                    <div className="text-center">
                                        <p className="text-xs font-bold text-white mb-1 truncate max-w-[150px]">
                                            {fullProfile?.resumeFileName || 'Stored_Resume.pdf'}
                                        </p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Binary Blob • MongoDB Local</p>
                                    </div>

                                    <div className="flex flex-col gap-3 w-full">
                                        <a 
                                            href={user?.email ? `http://localhost:5000/student/view-resume/${user.email}` : '#'} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="w-full text-center bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                                        >
                                            OPEN STORED PDF
                                        </a>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleResumeUpload} 
                                            className="hidden" 
                                            accept=".pdf"
                                        />
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-white text-[11px] font-bold rounded-xl border border-white/10 transition-all active:scale-95"
                                        >
                                            {isUploading ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    <span>UPLOADING RAW FILE...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                                    <span>REPLACE / UPLOAD RESUME</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 text-[9px] text-slate-500 text-center italic flex items-center justify-center gap-2 font-mono">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    DIRECT RAW FILE PERSISTENCE ACTIVE
                                </div>
                            </FloatingCard>
                        </div>

                        {/* Middle Column - Radar Chart */}
                        <div className="md:col-span-1 h-80 md:h-auto">
                            <FloatingCard delay={0.3} className="h-full flex flex-col">
                                <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Profile Matrix</h3>
                                <div className="flex-1 relative">
                                    <RadarChart data={chartData} />
                                </div>
                            </FloatingCard>
                        </div>

                        {/* Right Column - AI Insights */}
                        <div className="md:col-span-1">
                            {analysisLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                                    <span className="ml-3 text-indigo-400 animate-pulse">Fetching Insights...</span>
                                </div>
                            ) : (
                                <div className="space-y-4 h-full overflow-y-auto custom-scrollbar">
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-indigo-500/30">
                                        <h4 className="font-bold text-indigo-400 mb-2">🎓 Academic Advice</h4>
                                        <p className="text-sm text-slate-300">{ai.academicAdvice || "Keep up the good work! Focus on maintaining your strong grades."}</p>
                                    </div>
                                    <div className="bg-slate-800/50 p-4 rounded-xl border border-purple-500/30">
                                        <h4 className="font-bold text-purple-400 mb-2">🚀 Recommended Project</h4>
                                        <p className="text-sm text-slate-300">{ai.projectSuggestion || "Build a portfolio project combining your top skills."}</p>
                                    </div>
                                    {ai.skillGap && (
                                        <div className="bg-slate-800/50 p-4 rounded-xl border border-red-500/30">
                                            <h4 className="font-bold text-red-400 mb-2">⚠️ Skill Gaps</h4>
                                            <p className="text-sm text-slate-300">{typeof ai.skillGap === 'string' ? ai.skillGap : JSON.stringify(ai.skillGap)}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                )}

                {/* Skill Gap Roadmap - Phase-based learning plan */}
                {(roadmapData.length > 0 || recommendationsLoading) && (
                    <SkillRoadmap
                        roadmap={roadmapData}
                        targetRole={fullProfile?.targetJobRole || selectedRole}
                        readinessScore={readinessScoreData}
                        missingSkills={missingSkillsData}
                        matchedSkills={matchedSkillsData}
                        loading={recommendationsLoading}
                    />
                )}

                {/* Learning Recommendations - Detailed per-skill resources */}
                {(recommendations.length > 0 || recommendationsJobReady || recommendationsLoading) && (
                    <LearningRecommendations
                        recommendations={recommendations}
                        jobReady={recommendationsJobReady}
                        loading={recommendationsLoading}
                    />
                )}
            </div>
        </div>
    );
};

export default Dashboard;
