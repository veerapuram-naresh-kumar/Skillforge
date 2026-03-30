import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        college: '', branch: '', year: '', 
        githubLink: '', leetcodeLink: '', targetJobRole: 'MERN Developer'
    });
    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const roles = [
        'MERN Developer', 'Java Backend', 'Data Scientist',
        'Frontend Developer', 'Full Stack Developer', 'Cloud Engineer', 'Other'
    ];

    const { 
        name, email, password, confirmPassword, 
        college, branch, year, targetJobRole, githubLink, leetcodeLink 
    } = formData;

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSkillKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = skillInput.trim();
            if (val && !skills.includes(val)) setSkills([...skills, val]);
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove) => setSkills(skills.filter(s => s !== skillToRemove));

    const onFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.type !== 'application/pdf') {
                toast.error('Only PDF files are allowed for resume.');
                setResumeFile(null);
                e.target.value = null; // reset
            } else {
                setResumeFile(file);
            }
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }


        setIsLoading(true);

        try {
            // Step 1: Register User Account for Auth
            const authResult = await register(name, email, password);
            if (!authResult.success) {
                toast.error(authResult.message || 'Account Registration Failed');
                setIsLoading(false);
                return;
            }

            // Step 2: Upload Student Profile
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key !== 'password' && key !== 'confirmPassword') {
                    data.append(key, formData[key]);
                }
            });
            
            // Auto-append un-entered skill block if they forgot to press enter
            const finalSkills = [...skills];
            if (skillInput.trim() && !finalSkills.includes(skillInput.trim())) {
                finalSkills.push(skillInput.trim());
            }
            
            data.append('knownSkills', JSON.stringify(finalSkills));
            if (resumeFile) {
                data.append('resume', resumeFile);
            }

            const studentRes = await axios.post('http://localhost:5000/student/register', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Step 3: Trigger AI Preprocessing & Skill Gap Scoring Automatically
            if (studentRes.data?.student?._id) {
                try {
                    await axios.post(`http://localhost:5000/process/profile/${studentRes.data.student._id}`);
                } catch(aiError) {
                    console.error("AI Pipeline Step 1 failed:", aiError);
                }
            }

            toast.success('Registration & AI Profile Setup successful!');
            setTimeout(() => navigate('/dashboard'), 1500);

        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Error occurred while saving profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 py-10 px-4 text-white font-sans">
            <ToastContainer theme="dark" position="bottom-right" />
            <div className="max-w-3xl mx-auto bg-slate-800 rounded-2xl shadow-2xl p-6 lg:p-10 border border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                
                <h1 className="text-3xl font-bold mb-2 text-white/90">Create Account & Profile</h1>
                <p className="text-sm text-slate-400 mb-8">Set up your credentials and learning profile in one step.</p>
                
                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Auth Fields */}
                        <div>
                            <label className="block text-sm text-slate-300 font-semibold mb-2">Full Name <span className="text-red-500">*</span></label>
                            <input required type="text" name="name" value={name} onChange={onChange} className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500" placeholder="Jane Doe" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 font-semibold mb-2">Email Address <span className="text-red-500">*</span></label>
                            <input required type="email" name="email" value={email} onChange={onChange} className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500" placeholder="jane@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 font-semibold mb-2">Password <span className="text-red-500">*</span></label>
                            <input required type="password" name="password" value={password} onChange={onChange} className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500" placeholder="Strong password" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 font-semibold mb-2">Confirm Password <span className="text-red-500">*</span></label>
                            <input required type="password" name="confirmPassword" value={confirmPassword} onChange={onChange} className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500" placeholder="Confirm password" />
                        </div>

                        {/* Profile Fields */}
                        <div className="md:col-span-2 border-t border-slate-700 pt-6 mt-4">
                            <h2 className="text-xl font-bold text-white mb-6">Student Profile Details</h2>
                        </div>

                        <div>
                            <label className="block text-sm text-slate-300 font-semibold mb-2">College <span className="text-red-500">*</span></label>
                            <input required type="text" name="college" value={college} onChange={onChange} className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500" placeholder="Stanford University" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 font-semibold mb-2">Branch / Major <span className="text-red-500">*</span></label>
                            <input required type="text" name="branch" value={branch} onChange={onChange} className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500" placeholder="Computer Science" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 font-semibold mb-2">Year of Study <span className="text-red-500">*</span></label>
                            <input required type="text" name="year" value={year} onChange={onChange} className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500" placeholder="3rd Year" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 font-semibold mb-2">Target Job Role <span className="text-red-500">*</span></label>
                            <select name="targetJobRole" value={targetJobRole} onChange={onChange} className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-white">
                                {roles.map(r => <option key={r} value={r} className="bg-slate-800 text-white">{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 font-semibold mb-2">GitHub Profile URL</label>
                            <input type="url" name="githubLink" value={githubLink} onChange={onChange} className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500" placeholder="https://github.com/janedoe" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 font-semibold mb-2">LeetCode/Codeforces URL</label>
                            <input type="url" name="leetcodeLink" value={leetcodeLink} onChange={onChange} className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500" placeholder="https://leetcode.com/janedoe" />
                        </div>
                    </div>

                    {/* Skill Tags */}
                    <div>
                        <label className="block text-sm text-slate-300 font-semibold mb-2">Known Skills</label>
                        <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-3 flex flex-wrap gap-2 items-center min-h-[50px] focus-within:border-indigo-500">
                            {skills.map(skill => (
                                <span key={skill} className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-xs flex items-center gap-1 font-medium">
                                    {skill}
                                    <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-400 focus:outline-none ml-1 text-sm font-bold leading-none">&times;</button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={handleSkillKeyDown}
                                placeholder={skills.length === 0 ? "Type e.g. React, Java, NodeJS and press Enter..." : ""}
                                className="bg-transparent border-none outline-none flex-grow min-w-[200px] text-sm text-white"
                            />
                        </div>
                    </div>

                    {/* Resume Upload */}
                    <div>
                        <label className="block text-sm text-slate-300 font-semibold mb-2">Upload Resume (PDF) <span className="text-slate-500 text-xs font-normal">(Optional — auto-fills profile fields)</span></label>
                        <div className={`border-2 border-dashed ${resumeFile ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-600 bg-slate-900/30'} rounded-xl p-8 text-center hover:bg-slate-700/50 hover:border-indigo-400 transition cursor-pointer relative`}>
                            <input
                                type="file" accept="application/pdf" onChange={onFileChange} 
                                className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                            />
                            {resumeFile ? (
                                <div className="flex flex-col items-center justify-center pointer-events-none">
                                    <div className="h-12 w-12 bg-indigo-500/20 rounded-full flex items-center justify-center mb-3">📁</div>
                                    <div className="text-indigo-300 font-medium mb-1 truncate">{resumeFile.name}</div>
                                    <div className="text-xs text-slate-400 font-medium">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center pointer-events-none">
                                    <div className="text-slate-200 font-medium text-lg mb-1">Click to upload your resume</div>
                                    <div className="text-sm text-slate-400">PDF format only (Max 5MB)</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full relative overflow-hidden group bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        <span className="relative z-10">{isLoading ? 'Creating Account & Profile...' : 'Complete Setup'}</span>
                    </button>
                    
                    <p className="mt-6 text-center text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline">
                            Log In Here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
