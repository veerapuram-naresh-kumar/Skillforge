import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StudentRegistration = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', email: '', college: '', branch: '', year: '',
        githubLink: '', leetcodeLink: '', targetJobRole: 'MERN Developer'
    });
    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [resumeText, setResumeText] = useState("");

    const roles = [
        'MERN Developer', 'Java Backend', 'Data Scientist',
        'Frontend Developer', 'Full Stack Developer', 'Cloud Engineer', 'Other'
    ];

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSkillKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = skillInput.trim();
            if (val) {
                const alreadyExists = skills.some(s => s.toLowerCase() === val.toLowerCase());
                if (!alreadyExists) setSkills([...skills, val]);
            }
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove) => setSkills(skills.filter(s => s !== skillToRemove));

    const onFileChange = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.type !== 'application/pdf') {
                toast.error('Only PDF files are allowed for resume.');
                setResumeFile(null);
                e.target.value = null; // reset
            } else {
                setResumeFile(file);
                
                // Parse AI Resume data
                const parseData = new FormData();
                parseData.append('resume', file);
                
                const toastId = toast.loading("Extracting resume data locally...");
                try {
                    const res = await axios.post('http://localhost:5000/student/parse-resume', parseData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    
                    if (res.data.success && res.data.parsedData) {
                        const parsed = res.data.parsedData;
                        setFormData(prev => ({
                            ...prev,
                            name: prev.name || parsed.name || '',
                            email: prev.email || parsed.email || '',
                            college: prev.college || parsed.education?.college || '',
                            branch: prev.branch || parsed.education?.branch || '',
                            year: prev.year || parsed.education?.year || '',
                            githubLink: prev.githubLink || parsed.profiles?.github || '',
                            leetcodeLink: prev.leetcodeLink || parsed.profiles?.leetcode || ''
                        }));
                        
                        if (res.data.resumeText) setResumeText(res.data.resumeText);
                        
                        if (parsed.skills && parsed.skills.length > 0) {
                            setSkills(prev => {
                                const combined = [...prev, ...parsed.skills];
                                const unique = [];
                                const seen = new Set();
                                combined.forEach(s => {
                                    if (!seen.has(s.toLowerCase())) {
                                        seen.add(s.toLowerCase());
                                        unique.push(s);
                                    }
                                });
                                return unique;
                            });
                        }
                        
                        toast.update(toastId, { render: "Profile auto-filled from resume!", type: "success", isLoading: false, autoClose: 3000 });
                    }
                } catch(err) {
                    toast.update(toastId, { render: "Local Extraction failed. Fallback to manual entry.", type: "error", isLoading: false, autoClose: 3000 });
                }
            }
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!resumeFile) {
            toast.error('Resume PDF is required.');
            return;
        }

        setIsLoading(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        data.append('knownSkills', JSON.stringify(skills));
        data.append('resume', resumeFile);
        if (resumeText) data.append('resumeText', resumeText);

        try {
            const res = await axios.post('http://localhost:5000/student/register', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Registration successful!');
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 py-10 px-4 text-white font-sans">
            <ToastContainer theme="dark" position="bottom-right" />
            <div className="max-w-3xl mx-auto bg-slate-800 rounded-2xl shadow-2xl p-6 lg:p-10 border border-slate-700 relative overflow-hidden">
                {/* Decorative glowing gradient top bar */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                <h1 className="text-3xl font-bold mb-2 text-white/90">Student Registration</h1>
                <p className="text-sm text-slate-400 mb-8">Set up your profile to receive personalized skill insights and jobs.</p>

                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-slate-300 font-semibold mb-2">Full Name <span className="text-red-500">*</span></label>
                            <input required type="text" name="name" value={formData.name} onChange={onChange} className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" placeholder="Jane Doe" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 font-semibold mb-2">Email Address <span className="text-red-500">*</span></label>
                            <input required type="email" name="email" value={formData.email} onChange={onChange} className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" placeholder="jane@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 font-semibold mb-2">College <span className="text-red-500">*</span></label>
                            <input required type="text" name="college" value={formData.college} onChange={onChange} className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" placeholder="Stanford University" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 font-semibold mb-2">Branch / Major <span className="text-red-500">*</span></label>
                            <input required type="text" name="branch" value={formData.branch} onChange={onChange} className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" placeholder="Computer Science" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 font-semibold mb-2">Year of Study <span className="text-red-500">*</span></label>
                            <input required type="text" name="year" value={formData.year} onChange={onChange} className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" placeholder="3rd Year" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 font-semibold mb-2">Target Job Role <span className="text-red-500">*</span></label>
                            <select name="targetJobRole" value={formData.targetJobRole} onChange={onChange} className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-white">
                                {roles.map(r => <option key={r} value={r} className="bg-slate-800 text-white">{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 font-semibold mb-2">GitHub Profile URL</label>
                            <input type="url" name="githubLink" value={formData.githubLink} onChange={onChange} className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" placeholder="https://github.com/janedoe" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 font-semibold mb-2">LeetCode/Codeforces URL</label>
                            <input type="url" name="leetcodeLink" value={formData.leetcodeLink} onChange={onChange} className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" placeholder="https://leetcode.com/janedoe" />
                        </div>
                    </div>

                    {/* Skill Tags */}
                    <div>
                        <label className="block text-sm text-slate-300 font-semibold mb-2">Known Skills</label>
                        <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-3 flex flex-wrap gap-2 items-center min-h-[50px] focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition">
                            {skills.map((skill, idx) => (
                                <span key={`${skill}-${idx}`} className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-xs flex items-center gap-1 font-medium">
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
                        <label className="block text-sm text-slate-300 font-semibold mb-2">Upload Resume (PDF) <span className="text-red-500">*</span></label>
                        <div className={`border-2 border-dashed ${resumeFile ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-600 bg-slate-900/30'} rounded-xl p-8 text-center hover:bg-slate-700/50 hover:border-indigo-400 transition cursor-pointer relative`}>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={onFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                            />
                            {resumeFile ? (
                                <div className="flex flex-col items-center justify-center pointer-events-none">
                                    <div className="h-12 w-12 bg-indigo-500/20 rounded-full flex items-center justify-center mb-3">
                                        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <div className="text-indigo-300 font-medium mb-1 truncate max-w-full">{resumeFile.name}</div>
                                    <div className="text-xs text-slate-400 font-medium">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center pointer-events-none">
                                    <div className="h-14 w-14 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                    </div>
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
                        <span className="relative z-10">{isLoading ? 'Submitting Registration...' : 'Complete Registration'}</span>
                        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StudentRegistration;
