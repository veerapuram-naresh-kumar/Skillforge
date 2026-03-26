
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import GlowButton from '../components/GlowButton';
import { motion } from 'framer-motion';

const ProfileSetup = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    // Form State
    const [github, setGithub] = useState('');
    const [role, setRole] = useState('Software Engineer');
    const [semesters, setSemesters] = useState([{ semester: 'Sem 1', subjects: [{ name: '', score: '' }] }]);
    const [loading, setLoading] = useState(false);

    // Dynamic Form Handlers
    const addSemester = () => {
        setSemesters([...semesters, { semester: `Sem ${semesters.length + 1}`, subjects: [{ name: '', score: '' }] }]);
    };

    const addSubject = (semIndex) => {
        const newSemesters = [...semesters];
        newSemesters[semIndex].subjects.push({ name: '', score: '' });
        setSemesters(newSemesters);
    };

    const handleSubjectChange = (semIndex, subIndex, key, value) => {
        const newSemesters = [...semesters];
        newSemesters[semIndex].subjects[subIndex][key] = value;
        setSemesters(newSemesters);
    };

    const handleSubmit = async () => {
        if (!user) {
            toast.error("Please login first");
            return navigate('/login');
        }

        setLoading(true);
        try {
            // 1. Update Profile (GitHub, Academics, Role)
            const profileData = {
                userId: user._id,
                githubUsername: github,
                role: role,
                academicRecords: semesters.map(sem => ({
                    semester: sem.semester,
                    subjects: sem.subjects.map(sub => ({
                        name: sub.name,
                        score: Number(sub.score),
                        totalScore: 100 // Defaulting for simple input
                    }))
                }))
            };

            await axios.put('http://localhost:5000/api/profile/update', profileData);

            // 2. Trigger Analysis
            toast.info("Running AI Analysis... This might take a moment 🧠");

            const analysisRes = await axios.post('http://localhost:5000/api/analyze', {
                userId: user._id,
                role: role
            });

            if (analysisRes.data) {
                // Update local storage user if analysis is saved there (Optional, Dashboard fetches it)
                toast.success("Profile Setup Complete! Redirecting...");
                setTimeout(() => navigate('/dashboard'), 1500);
            }

        } catch (error) {
            console.error(error);
            toast.error("Process Failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // JSX for each step...
    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 z-10"
            >
                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        {step === 1 ? "Start Your Journey" : "Academic Performance"}
                    </h2>
                    <div className="flex gap-2">
                        <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                        <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                    </div>
                </div>

                {step === 1 && (
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                        <div>
                            <label className="block text-slate-400 mb-2">Target Role / Career Goal</label>
                            <input
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="e.g. Full Stack Developer"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-400 mb-2">GitHub Username</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3 text-slate-500">github.com/</span>
                                <input
                                    type="text"
                                    value={github}
                                    onChange={(e) => setGithub(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-600 rounded-lg pl-28 pr-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                                    placeholder="username"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">We analyze your repos to detect real-world skills.</p>
                        </div>

                        <div className="flex justify-end pt-4">
                            <GlowButton onClick={() => setStep(2)}>Next Step →</GlowButton>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                        <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                            {semesters.map((sem, sIndex) => (
                                <div key={sIndex} className="bg-slate-800/30 p-4 rounded-xl border border-white/5">
                                    <h3 className="font-semibold text-indigo-400 mb-3">{sem.semester}</h3>
                                    {sem.subjects.map((sub, subIndex) => (
                                        <div key={subIndex} className="flex gap-4 mb-2">
                                            <input
                                                type="text"
                                                value={sub.name}
                                                onChange={(e) => handleSubjectChange(sIndex, subIndex, 'name', e.target.value)}
                                                className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                                                placeholder="Subject Name"
                                            />
                                            <input
                                                type="number"
                                                value={sub.score}
                                                onChange={(e) => handleSubjectChange(sIndex, subIndex, 'score', e.target.value)}
                                                className="w-24 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                                                placeholder="Score %"
                                            />
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addSubject(sIndex)}
                                        className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 font-medium"
                                    >
                                        + Add Subject
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addSemester}
                                className="w-full py-2 border-2 border-dashed border-slate-600 rounded-xl text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-colors"
                            >
                                + Add Another Semester
                            </button>
                        </div>

                        <div className="flex justify-between pt-4 border-t border-white/10">
                            <button onClick={() => setStep(1)} className="text-slate-400 hover:text-white transition-colors">← Back</button>
                            <GlowButton onClick={handleSubmit}>
                                {loading ? "Analyzing..." : "Complete Setup & Analyze 🚀"}
                            </GlowButton>
                        </div>
                    </motion.div>
                )}

            </motion.div>
        </div>
    );
};

export default ProfileSetup;
