import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import FloatingCard from '../components/FloatingCard';
import RadarChart from '../components/RadarChart';
import SkillPill from '../components/SkillPill';
import GlowButton from '../components/GlowButton';
import LearningRecommendations from '../components/LearningRecommendations';
import SkillRoadmap from '../components/SkillRoadmap';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
    getRecommendations as getClientRecommendations, 
    getRoadmap as getClientRoadmap,
    getSingleSkillRoadmap as getClientRoadmapSingle
} from '../utils/learningResources';


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
    const [matchedRecommendations, setMatchedRecommendations] = useState([]);

    // Talent Search State
    const [talentSearchQuery, setTalentSearchQuery] = useState('');
    const [talentSearchResults, setTalentSearchResults] = useState([]);
    const [isSearchingTalent, setIsSearchingTalent] = useState(false);
    const searchRef = useRef(null);

    // Global Mastery Search State
    const [masterSearchQuery, setMasterSearchQuery] = useState('');
    const [searchActive, setSearchActive] = useState(false);
    const [searchResult, setSearchResult] = useState({ roadmap: [], recommendations: [] });

    // Initial Profile Fetch
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        } else if (user) {
            const fetchProfile = async () => {
                setAnalysisLoading(true);
                try {
                    const res = await axios.get(`http://localhost:5000/api/profile/${user._id}`);
                    let studentData = {};
                    try {
                        const studentRes = await axios.get(`http://localhost:5000/student/profileByEmail/${user.email}`);
                        studentData = studentRes.data;
                    } catch (e) { console.log("Student profile fetch skip"); }

                    const mergedProfile = { ...res.data, ...studentData };
                    setFullProfile(mergedProfile);
                    setAnalysisData(mergedProfile.analysisResults || {});
                    setAnalysisLoading(false);

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
                            console.error('Learning rec fetch failed');
                        } finally {
                            setRecommendationsLoading(false);
                        }
                    }
                } catch (error) {
                    console.error("Profile fetch error", error);
                    setAnalysisLoading(false);
                }
            };
            fetchProfile();
        }
    }, [user, authLoading, navigate]);

    // Role Logic & Dynamic Calculation
    const roles = ['MERN Developer', 'Java Backend', 'Data Scientist', 'Frontend Developer', 'Full Stack Developer', 'Cloud Engineer', 'Other'];
    const roleRequirements = {
        'mern developer': ['mongodb', 'express', 'react', 'node', 'javascript'],
        'java backend': ['java', 'spring boot', 'sql', 'hibernate', 'rest api'],
        'data scientist': ['python', 'sql', 'machine learning', 'data visualization', 'pandas'],
        'frontend developer': ['html', 'css', 'javascript', 'react'],
        'full stack developer': ['javascript', 'react', 'node', 'sql', 'html', 'css'],
        'cloud engineer': ['aws', 'linux', 'docker', 'kubernetes', 'bash'],
        'other': []
    };

    const [selectedRole, setSelectedRole] = useState('');
    const [dynamicReadiness, setDynamicReadiness] = useState(0);
    const [dynamicGap, setDynamicGap] = useState(0);
    const [dynamicMissing, setDynamicMissing] = useState([]);

    useEffect(() => {
        if (!fullProfile) return;
        if (!selectedRole && (fullProfile.targetRole || fullProfile.targetJobRole)) {
            setSelectedRole(fullProfile.targetRole || fullProfile.targetJobRole);
            return;
        }
        if (!selectedRole) return;

        const reqSkills = (roleRequirements[selectedRole.toLowerCase()] || []).map(r => r.toLowerCase());
        const studentSkills = (fullProfile.processedSkillVector || []).map(v => typeof v === 'string' ? v.toLowerCase() : (v.skill || '').toLowerCase());
        const rawNormalized = (fullProfile.knownSkills || []).map(s => s.toLowerCase().trim());
        const allSkills = [...new Set([...studentSkills, ...rawNormalized])];

        const missing = reqSkills.filter(r => !allSkills.includes(r));
        const matched = reqSkills.filter(r => allSkills.includes(r));
        const readiness = reqSkills.length > 0 ? Math.round((matched.length / reqSkills.length) * 100) : 100;

        setDynamicReadiness(readiness);
        setDynamicGap(100 - readiness);
        setDynamicMissing(missing);
        setMatchedSkillsData(matched);

        setRecommendations(getClientRecommendations(missing));
        setMatchedRecommendations(getClientRecommendations(matched));
        setRoadmapData(getClientRoadmap(missing, selectedRole));
        setRecommendationsJobReady(missing.length === 0);
    }, [selectedRole, fullProfile]);

    // Handlers
    const handleTalentSearch = async (e) => {
        e.preventDefault();
        if (!talentSearchQuery.trim()) return;
        setIsSearchingTalent(true);
        try {
            const res = await axios.get(`http://localhost:5000/student/semantic-search?query=${encodeURIComponent(talentSearchQuery)}`);
            setTalentSearchResults(res.data.matches || []);
        } catch (err) { console.error("Talent search fail"); }
        finally { setIsSearchingTalent(false); }
    };

    const handleMasterSearch = (e) => {
        e.preventDefault();
        const q = masterSearchQuery.trim();
        if (!q) return;
        setSearchResult({ 
            roadmap: getClientRoadmapSingle(q), 
            recommendations: getClientRecommendations([q]) 
        });
        setSearchActive(true);
    };

    const handleClearMasterSearch = () => { setSearchActive(false); setMasterSearchQuery(''); };
    const handleLogout = () => { logout(); navigate('/login'); };

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
            setFullProfile(prev => ({ ...prev, resumeUrl: res.data.resumeUrl }));
            window.location.reload();
        } catch (err) { alert("Upload failed"); }
        finally { setIsUploading(false); }
    };

    // UI Helpers
    const skills = (() => {
        const sSet = new Set();
        (fullProfile?.processedSkillVector || []).forEach(v => sSet.add((typeof v === 'string' ? v : v.skill).toLowerCase()));
        (fullProfile?.knownSkills || []).forEach(s => sSet.add(s.toLowerCase()));
        return Array.from(sSet).map(s => ({ name: s }));
    })();

    const ai = analysisData?.aiInsights || {};
    const academic = analysisData?.academicAnalysis || { averageScore: 0 };

    const chartData = {
        labels: ['Academics', 'Practical Skills', 'Projects', 'Certifications', 'Soft Skills'],
        datasets: [
            {
                label: 'Your Profile',
                data: [academic.averageScore || 0, skills.length * 10, fullProfile?.projects?.length * 20 || 0, fullProfile?.certifications?.length * 20 || 0, 70],
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: '#3b82f6',
                borderWidth: 2,
            },
            {
                label: 'Standard',
                data: [75, 80, 60, 40, 80],
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                borderColor: '#ec4899',
                borderWidth: 2,
                borderDash: [5, 5],
            },
        ],
    };

    if (authLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Auth...</div>;

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6 relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-20">
                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Dashboard</h1>
                        <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Welcome back, {user?.name || 'Explorer'}</p>
                    </div>

                    <div className="flex-1 w-full max-w-4xl flex flex-col md:flex-row items-center gap-4">
                        {/* Master Search */}
                        <div className="relative group flex-1 w-full">
                            <form onSubmit={handleMasterSearch} className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Learn anything: Search Skill or Role (e.g. React, Java Developer)..." 
                                    value={masterSearchQuery}
                                    onChange={(e) => setMasterSearchQuery(e.target.value)}
                                    className="w-full bg-slate-800/40 border border-slate-700/50 text-white rounded-2xl py-3 pl-12 pr-4 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-600 text-sm backdrop-blur-md"
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors text-xl">🎯</span>
                            </form>
                        </div>

                        {/* Talent Search */}
                        <div className="relative w-full md:w-64" ref={searchRef}>
                            <form onSubmit={handleTalentSearch} className="relative">
                                <input
                                    type="text"
                                    value={talentSearchQuery}
                                    onChange={(e) => setTalentSearchQuery(e.target.value)}
                                    placeholder="Find Talent..."
                                    className="w-full bg-slate-800/20 border border-slate-700/30 rounded-xl py-2.5 pl-4 pr-10 text-xs focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                                />
                                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400">
                                    {isSearchingTalent ? <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /> : '🔍'}
                                </button>
                            </form>
                            <AnimatePresence>
                                {talentSearchResults.length > 0 && talentSearchQuery && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full right-0 w-80 mt-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-2 z-[100] backdrop-blur-xl"
                                    >
                                        <div className="px-3 py-2 border-b border-white/5 mb-2 flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Top Talent Matches</span>
                                            <button onClick={() => setTalentSearchResults([])} className="text-slate-500 hover:text-white text-xs">✕</button>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                            {talentSearchResults.map((match, i) => (
                                                <div key={i} className="flex items-center gap-3 p-2.5 hover:bg-white/5 rounded-xl transition-all cursor-pointer border border-transparent hover:border-white/5">
                                                    <div className="w-9 h-9 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 font-bold text-xs">{match.name.charAt(0)}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-xs font-bold text-slate-200 truncate">{match.name}</h4>
                                                        <p className="text-[10px] text-slate-500 truncate">{match.targetJobRole || 'Software Engineer'}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/profile')} className="px-4 py-2 text-slate-300 hover:text-white font-bold text-xs transition-colors rounded-xl hover:bg-white/5">Profile</button>
                        <button onClick={handleLogout} className="px-4 py-2 text-red-400 hover:bg-red-400/10 font-bold text-xs transition-all rounded-xl border border-red-400/20">Logout</button>
                    </div>
                </header>

                <main>
                    {searchActive ? (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-3xl gap-4">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-3xl">🚀</div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white capitalize">Mastery Roadmap: {masterSearchQuery}</h2>
                                        <p className="text-indigo-300/70 text-sm font-medium">Curated end-to-end learning path with practice projects.</p>
                                    </div>
                                </div>
                                <button onClick={handleClearMasterSearch} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-white/10 text-xs font-black transition-all shadow-lg active:scale-95">✕ Exit Exploration</button>
                            </div>
                            <SkillRoadmap roadmap={searchResult.roadmap} targetRole={masterSearchQuery} loading={false} />
                            <LearningRecommendations recommendations={searchResult.recommendations} loading={false} />
                        </motion.div>
                    ) : (
                        <div className="space-y-10">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-1 space-y-6">
                                    {/* Academic Card */}
                                    <FloatingCard className="bg-slate-800/40 border-slate-700/50 ring-1 ring-white/5 p-6 rounded-3xl backdrop-blur-sm">
                                        <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Academic Excellence</h3>
                                        <div className="flex items-center gap-6">
                                            <div className="relative w-24 h-24 shrink-0">
                                                {(() => {
                                                    const sVal = fullProfile?.cgpa || fullProfile?.extractedData?.education?.cgpa || 0;
                                                    const sNum = parseFloat(sVal) || 0;
                                                    const pct = sNum <= 10 ? sNum * 10 : sNum;
                                                    return (
                                                        <>
                                                            <svg className="w-full h-full -rotate-90">
                                                                <circle cx="50%" cy="50%" r="42" fill="none" stroke="#1e293b" strokeWidth="6" />
                                                                <circle cx="50%" cy="50%" r="42" fill="none" stroke="#22c55e" strokeWidth="6" strokeDasharray="263.8" strokeDashoffset={263.8 - (263.8 * (pct / 100))} strokeLinecap="round" className="transition-all duration-1000" />
                                                            </svg>
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                                <span className="text-2xl font-black">{sNum || '0.0'}</span>
                                                                <span className="text-[8px] text-slate-500 font-bold uppercase">CGPA</span>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                            <div>
                                                <p className="text-emerald-400 font-black text-sm">Target Verified</p>
                                                <p className="text-slate-500 text-[10px] mt-1 italic font-medium">{fullProfile?.cgpa ? 'Profile Personal Record' : 'Extracted from Resume'}</p>
                                            </div>
                                        </div>
                                    </FloatingCard>

                                    {/* Career Readiness */}
                                    <FloatingCard className="bg-indigo-500/10 border-indigo-500/20 p-6 rounded-3xl relative overflow-hidden group">
                                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
                                        <h3 className="text-indigo-400 text-[10px] font-black uppercase tracking-[.2em] mb-6">Career Readiness</h3>
                                        <div className="flex items-center gap-6 mb-6">
                                            <div className="relative w-24 h-24 shrink-0">
                                                <svg className="w-full h-full -rotate-90">
                                                    <circle cx="50%" cy="50%" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
                                                    <circle cx="50%" cy="50%" r="42" fill="none" stroke="#6366f1" strokeWidth="8" strokeDasharray="263.8" strokeDashoffset={263.8 - (263.8 * (dynamicReadiness / 100))} strokeLinecap="round" className="transition-all duration-1000" />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center font-black text-2xl">{dynamicReadiness}%</div>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Gap Analysis</p>
                                                <p className="text-indigo-200 text-lg font-black">{dynamicGap}% to Goal</p>
                                            </div>
                                        </div>
                                        
                                        <div className="pt-4 border-t border-indigo-500/10">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-3">Compare Roles</p>
                                            <div className="flex flex-wrap gap-2">
                                                {roles.slice(0, 5).map(r => (
                                                    <button key={r} onClick={() => setSelectedRole(r)} className={`text-[9px] px-2.5 py-1.5 rounded-lg border font-black transition-all ${selectedRole === r ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-slate-900/50 border-slate-700 text-slate-500 hover:text-slate-300'}`}>{r}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </FloatingCard>
                                </div>

                                <div className="lg:col-span-1 h-full">
                                    <FloatingCard className="h-full min-h-[400px] flex flex-col p-6 rounded-3xl bg-slate-800/40 border-slate-700/50 backdrop-blur-sm">
                                        <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[.2em] mb-6">Profile Matrix</h3>
                                        <div className="flex-1 relative pb-4"><RadarChart data={chartData} /></div>
                                    </FloatingCard>
                                </div>

                                <div className="lg:col-span-1 flex flex-col gap-6">
                                    <FloatingCard className="flex-1 p-6 rounded-3xl bg-slate-800/40 border-slate-700/50 ring-1 ring-white/5 space-y-6">
                                        <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[.2em]">Detected Expertise</h3>
                                            <span className="text-indigo-400 font-mono text-[10px] font-bold bg-indigo-500/10 px-2 py-1 rounded-md">{skills.length} Total</span>
                                        </div>
                                        <div className="space-y-6 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                                            <div>
                                                <p className="text-[10px] uppercase font-black text-indigo-400/60 mb-3 tracking-widest flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> For {selectedRole || 'Target Role'}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {matchedSkillsData.map((s, i) => <SkillPill key={i} skill={s} level="match" />)}
                                                    {matchedSkillsData.length === 0 && <p className="text-slate-600 text-[10px] italic">No matches found for this path.</p>}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-black text-slate-600 mb-3 tracking-widest flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" /> Supplementary
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {skills.filter(s => !matchedSkillsData.map(m => m.toLowerCase()).includes(s.name.toLowerCase())).map((s, i) => (
                                                        <SkillPill key={i} skill={s.name} level="supplementary" />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </FloatingCard>
                                </div>
                            </div>

                            {roadmapData.length > 0 && <SkillRoadmap roadmap={roadmapData} targetRole={selectedRole} loading={recommendationsLoading} />}
                            {(recommendations.length > 0 || matchedRecommendations.length > 0) && (
                                <LearningRecommendations 
                                    recommendations={recommendations} 
                                    matchedRecommendations={matchedRecommendations} 
                                    loading={recommendationsLoading} 
                                />
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
