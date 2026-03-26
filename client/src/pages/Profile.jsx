import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [studentData, setStudentData] = useState(null);

    const [formData, setFormData] = useState({
        name: '', college: '', branch: '', year: '',
        githubLink: '', leetcodeLink: '', targetJobRole: 'MERN Developer'
    });
    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeText, setResumeText] = useState("");

    const roles = [
        'MERN Developer', 'Java Backend', 'Data Scientist',
        'Frontend Developer', 'Full Stack Developer', 'Cloud Engineer', 'Other'
    ];

    useEffect(() => {
        if (!user) return;
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/student/profileByEmail/${user.email}`);
                if (res.data) {
                    setStudentData(res.data);
                    setFormData({
                        name: res.data.name || user.name,
                        college: res.data.college || '',
                        branch: res.data.branch || '',
                        year: res.data.year || '',
                        githubLink: res.data.githubLink || '',
                        leetcodeLink: res.data.leetcodeLink || '',
                        targetJobRole: res.data.targetJobRole || res.data.targetRole || 'MERN Developer'
                    });
                    setSkills(res.data.knownSkills || []);
                }
            } catch (err) {
                console.log("No existing student profile found. Please fill it out.");
                setFormData(prev => ({ ...prev, name: user.name }));
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

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
                                // Deduplicate case-insensitively while preserving original casing if possible
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
        setIsSubmitting(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        // Auto-append un-entered skill
        const finalSkills = [...skills];
        if (skillInput.trim() && !finalSkills.includes(skillInput.trim())) {
            finalSkills.push(skillInput.trim());
        }
        data.append('knownSkills', JSON.stringify(finalSkills));
        if (resumeText) data.append('resumeText', resumeText);

        if (resumeFile) {
            data.append('resume', resumeFile);
        }

        try {
            if (studentData) {
                // Update Existing Profile
                await axios.put(`http://localhost:5000/student/profileByEmail/${user.email}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Profile Rescanned and Updated successfully!');
            } else {
                // Create New Profile if they missed it during registration
                data.append('email', user.email);
                const newRes = await axios.post('http://localhost:5000/student/register', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (newRes.data?.student?._id) {
                    await axios.post(`http://localhost:5000/process/profile/${newRes.data.student._id}`);
                }
                toast.success('Registration & AI Setup complete!');
            }
            setIsEditing(false);
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Error saving profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white"><p>Please log in to view profile.</p></div>;
    }

    if (isLoading) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading profile data...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6 relative overflow-hidden">
            <ToastContainer theme="dark" position="bottom-right" />
            <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        {isEditing ? 'Update Target Profile' : 'Student Identity'}
                    </h1>
                    <div className="flex gap-4">
                        <button onClick={() => navigate('/dashboard')} className="text-slate-300 hover:text-white font-semibold transition-colors">Dashboard</button>
                        <button onClick={handleLogout} className="text-red-400 hover:text-red-300 font-semibold transition-colors">Logout</button>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 lg:p-10 border border-slate-700 relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                    {!isEditing && studentData ? (
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex items-center gap-6 pb-6 border-b border-white/10">
                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg shadow-indigo-500/30">
                                    {formData.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{formData.name}</h2>
                                    <p className="text-indigo-400 font-semibold">{formData.targetJobRole}</p>
                                    <p className="text-slate-400 text-sm mt-1">{user.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-sm uppercase tracking-widest text-slate-500 font-bold mb-4">Academic Details</h3>
                                    <ul className="space-y-4 shadow-inner bg-slate-900/30 p-5 rounded-xl border border-white/5">
                                        <li><span className="text-slate-400 text-sm block">College</span> <span className="font-semibold">{formData.college}</span></li>
                                        <li><span className="text-slate-400 text-sm block">Branch / Major</span> <span className="font-semibold">{formData.branch}</span></li>
                                        <li><span className="text-slate-400 text-sm block">Year of Study</span> <span className="font-semibold">{formData.year}</span></li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-sm uppercase tracking-widest text-slate-500 font-bold mb-4">Code Profiles</h3>
                                    <ul className="space-y-4 shadow-inner bg-slate-900/30 p-5 rounded-xl border border-white/5 h-[164px]">
                                        <li><span className="text-slate-400 text-sm block">GitHub</span> {formData.githubLink ? <a href={formData.githubLink} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline truncate block">{formData.githubLink}</a> : <span className="text-slate-500 italic">Not set</span>}</li>
                                        <li><span className="text-slate-400 text-sm block">LeetCode</span> {formData.leetcodeLink ? <a href={formData.leetcodeLink} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline truncate block">{formData.leetcodeLink}</a> : <span className="text-slate-500 italic">Not set</span>}</li>
                                    </ul>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm uppercase tracking-widest text-slate-500 font-bold mb-4 flex items-center gap-2">Known Technical Skills <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">{skills.length}</span></h3>
                                <div className="flex flex-wrap gap-2">
                                    {skills.length > 0 ? skills.map((s, idx) => (
                                        <span key={`${s}-${idx}`} className="bg-slate-700/50 border border-slate-600 text-slate-200 px-4 py-1.5 rounded-full text-sm font-medium">{s}</span>
                                    )) : <span className="text-slate-500 italic">No skills registered yet. Try updating your profile!</span>}
                                </div>
                            </div>

                            <div className="pt-6 mt-6 border-t border-white/10 flex justify-end">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                                >
                                    Edit & Rescan Profile
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={onSubmit} className="space-y-6 animate-fade-in">
                            <div className="mb-8 border-b border-slate-700 pb-4 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">Update Academic & Skill Data</h2>
                                {studentData && (
                                    <button type="button" onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white text-sm">Cancel Edit</button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm text-slate-300 font-semibold mb-2">Full Name</label>
                                    <input required type="text" name="name" value={formData.name} onChange={onChange} className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-300 font-semibold mb-2">College</label>
                                    <input required type="text" name="college" value={formData.college} onChange={onChange} className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-300 font-semibold mb-2">Branch / Major</label>
                                    <input required type="text" name="branch" value={formData.branch} onChange={onChange} className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-300 font-semibold mb-2">Year of Study</label>
                                    <input required type="text" name="year" value={formData.year} onChange={onChange} className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-300 font-semibold mb-2">Target Job Role <span className="text-indigo-400 font-normal text-xs">(determines readiness AI)</span></label>
                                    <select name="targetJobRole" value={formData.targetJobRole} onChange={onChange} className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-white">
                                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div className="hidden md:block"></div>
                                <div>
                                    <label className="block text-sm text-slate-300 font-semibold mb-2">GitHub URL</label>
                                    <input type="url" name="githubLink" value={formData.githubLink} onChange={onChange} className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-300 font-semibold mb-2">LeetCode URL</label>
                                    <input type="url" name="leetcodeLink" value={formData.leetcodeLink} onChange={onChange} className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500" />
                                </div>
                            </div>

                            {/* Skills Builder */}
                            <div className="mt-8 border-t border-slate-700 pt-6">
                                <label className="block text-sm text-slate-300 font-semibold mb-2">Learned Tech & Skills <span className="text-indigo-400 font-normal text-xs">(Type and press enter)</span></label>
                                <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-3 flex flex-wrap gap-2 items-center min-h-[50px] focus-within:border-indigo-500">
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
                                        placeholder={skills.length === 0 ? "Type e.g. React, Java..." : "Add more tech..."}
                                        className="bg-transparent border-none outline-none flex-grow min-w-[200px] text-sm text-white"
                                    />
                                </div>
                            </div>

                            {/* Resume Upload (Optional on Edit) */}
                            <div className="mt-6 border-2 border-dashed border-slate-600 bg-slate-900/30 rounded-xl p-6 text-center hover:bg-slate-800 transition cursor-pointer relative">
                                <input type="file" accept="application/pdf" onChange={onFileChange} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" />
                                {resumeFile ? (
                                    <div className="text-indigo-300 font-medium">New Record Selected: {resumeFile.name}</div>
                                ) : (
                                    <div className="text-slate-400 font-medium text-sm">
                                        {studentData ? "Click to upload a newer version of your Resume PDF (Optional)" : "Click to upload your Resume PDF (Required)"}
                                    </div>
                                )}
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full relative overflow-hidden group bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] mt-8 disabled:opacity-50">
                                {isSubmitting ? 'Syncing Profile Context && Running AI Scanner...' : studentData ? 'Save Changes & Trigger AI Rescan' : 'Complete Setup & Scan AI'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
