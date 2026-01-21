import { useState, useEffect } from 'react';
import { User, Upload, Save, Check, Plus, X, Briefcase, Trash2, Eye, Edit, FileDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';

const Profile = () => {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        jobTitle: '',
        bio: '',
        socialLinks: { linkedin: '', github: '', portfolio: '' },
        skills: [],
        experience: [],
        education: []
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [msg, setMsg] = useState('');
    const [newSkill, setNewSkill] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [initialProfile, setInitialProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [skillSuggestions, setSkillSuggestions] = useState([]);
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    // Predefined skill suggestions
    const allSkills = [
        'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'Go',
        'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure',
        'Git', 'CI/CD', 'REST API', 'GraphQL', 'Express.js', 'Next.js', 'Vue.js', 'Angular',
        'HTML', 'CSS', 'Tailwind CSS', 'SASS', 'Redux', 'Jest', 'Cypress', 'Webpack',
        'Agile', 'Scrum', 'TDD', 'Microservices', 'System Design', 'Data Structures', 'Algorithms'
    ];

    useEffect(() => {
        fetchProfile();
    }, []);

    // Track unsaved changes
    useEffect(() => {
        if (initialProfile) {
            const hasChanges = JSON.stringify(profile) !== JSON.stringify(initialProfile);
            setHasUnsavedChanges(hasChanges);
        }
    }, [profile, initialProfile]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                document.querySelector('form').requestSubmit();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Warn before leaving with unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    // Calculate profile completeness
    const calculateCompleteness = () => {
        const fields = [
            profile.name,
            profile.email,
            profile.phone,
            profile.jobTitle,
            profile.bio,
            profile.socialLinks.linkedin || profile.socialLinks.github || profile.socialLinks.portfolio,
            profile.skills.length > 0,
            profile.experience.length > 0,
            profile.education.length > 0
        ];
        const filledFields = fields.filter(Boolean).length;
        return Math.round((filledFields / fields.length) * 100);
    };

    // Validation functions
    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const validateURL = (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const validatePhone = (phone) => {
        const regex = /^[\d\s\-\+\(\)]+$/;
        return phone.length >= 10 && regex.test(phone);
    };

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch('http://localhost:5000/api/profile', {
                headers: { 'x-auth-token': token }
            });
            if (res.status === 401) {
                // Token invalid or expired
                return;
            }
            const data = await res.json();
            const loadedProfile = {
                ...data,
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || '',
                jobTitle: data.jobTitle || '',
                bio: data.bio || '',
                socialLinks: data.socialLinks || { linkedin: '', github: '', portfolio: '' },
                skills: Array.isArray(data.skills) ? data.skills : (data.skills ? data.skills.split(',').map(s => s.trim()) : []),
                experience: data.experience || [],
                education: data.education || []
            };
            setProfile(loadedProfile);
            setInitialProfile(loadedProfile);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('cv', file);
        const token = localStorage.getItem('authToken');

        try {
            const res = await fetch('http://localhost:5000/api/upload/cv', {
                method: 'POST',
                headers: { 'x-auth-token': token },
                body: formData
            });
            const data = await res.json();

            setProfile(prev => ({
                ...prev,
                name: data.name || prev.name,
                jobTitle: data.jobTitle || prev.jobTitle,
                email: data.email || prev.email,
                phone: data.phone || prev.phone,
                bio: data.bio || prev.bio,
                socialLinks: {
                    linkedin: data.socialLinks?.linkedin || prev.socialLinks.linkedin,
                    github: data.socialLinks?.github || prev.socialLinks.github,
                    portfolio: data.socialLinks?.portfolio || prev.socialLinks.portfolio
                },
                skills: Array.isArray(data.skills) ? [...new Set([...prev.skills, ...data.skills])] : prev.skills,
                experience: data.experience && data.experience.length > 0 ? data.experience : prev.experience,
                education: data.education && data.education.length > 0 ? data.education : prev.education
            }));
            setMsg('CV Parsed! details auto-filled.');
        } catch (err) {
            console.error(err);
            setMsg('Failed to parse CV.');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('authToken');
        try {
            await fetch('http://localhost:5000/api/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(profile)
            });
            setInitialProfile(profile); // Reset unsaved changes tracking
            setHasUnsavedChanges(false);
            setMsg('Profile Saved Successfully!');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setTimeout(() => setMsg(''), 3000);
        }
    };

    const addSkill = (e) => {
        if (e.key === 'Enter' && newSkill.trim()) {
            e.preventDefault();
            if (!profile.skills.includes(newSkill.trim())) {
                setProfile(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
            }
            setNewSkill('');
            setSkillSuggestions([]);
        }
    };

    // Filter skill suggestions as user types
    useEffect(() => {
        if (newSkill.trim().length > 0) {
            const filtered = allSkills.filter(skill =>
                skill.toLowerCase().includes(newSkill.toLowerCase()) &&
                !profile.skills.includes(skill)
            ).slice(0, 5);
            setSkillSuggestions(filtered);
        } else {
            setSkillSuggestions([]);
        }
    }, [newSkill, profile.skills]);

    const removeSkill = (skillToRemove) => {
        setProfile(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
    };

    const removeExperience = (index) => {
        setProfile(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));
    };

    const addExperience = () => {
        const newExp = {
            role: 'Job Title',
            company: 'Company Name',
            duration: 'Duration',
            description: 'Job description...'
        };
        setProfile(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
    };

    const addEducation = () => {
        const newEdu = {
            degree: 'Degree',
            school: 'School/University',
            year: 'Year'
        };
        setProfile(prev => ({ ...prev, education: [...prev.education, newEdu] }));
    };

    const removeEducation = (index) => {
        setProfile(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }));
    };

    const handleReset = async () => {
        if (!window.confirm('Are you sure you want to reset your profile? This will clear all data.')) return;

        const emptyProfile = {
            name: '',
            email: '',
            phone: '',
            jobTitle: '',
            bio: '',
            socialLinks: { linkedin: '', github: '', portfolio: '' },
            skills: [],
            experience: [],
            education: []
        };

        setProfile(emptyProfile);
        setInitialProfile(emptyProfile);
        setHasUnsavedChanges(false);

        try {
            await fetch('http://localhost:5000/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emptyProfile)
            });
            setMsg('✅ Profile reset successfully!');
        } catch (err) {
            console.error(err);
            setMsg('❌ Failed to reset profile.');
        }
        setTimeout(() => setMsg(''), 3000);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        let yPos = 20;

        // Header
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text(profile.name || 'Your Name', 20, yPos);
        yPos += 10;

        doc.setFontSize(14);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100);
        doc.text(profile.jobTitle || 'Software Engineer', 20, yPos);
        yPos += 15;

        // Contact Info
        doc.setFontSize(10);
        doc.setTextColor(0);
        if (profile.email) {
            doc.text(`Email: ${profile.email}`, 20, yPos);
            yPos += 6;
        }
        if (profile.phone) {
            doc.text(`Phone: ${profile.phone}`, 20, yPos);
            yPos += 6;
        }
        if (profile.socialLinks.linkedin) {
            doc.text(`LinkedIn: ${profile.socialLinks.linkedin}`, 20, yPos);
            yPos += 6;
        }
        yPos += 5;

        // Bio
        if (profile.bio) {
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Professional Summary', 20, yPos);
            yPos += 7;
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            const bioLines = doc.splitTextToSize(profile.bio, 170);
            doc.text(bioLines, 20, yPos);
            yPos += bioLines.length * 5 + 5;
        }

        // Skills
        if (profile.skills.length > 0) {
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Skills', 20, yPos);
            yPos += 7;
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(profile.skills.join(', '), 20, yPos, { maxWidth: 170 });
            yPos += 10;
        }

        // Experience
        if (profile.experience.length > 0) {
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Work Experience', 20, yPos);
            yPos += 7;

            profile.experience.forEach((exp, index) => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.setFontSize(11);
                doc.setFont(undefined, 'bold');
                doc.text(exp.role, 20, yPos);
                yPos += 6;
                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');
                doc.text(`${exp.company} | ${exp.duration}`, 20, yPos);
                yPos += 5;
                if (exp.description) {
                    const descLines = doc.splitTextToSize(exp.description, 170);
                    doc.text(descLines, 20, yPos);
                    yPos += descLines.length * 5 + 5;
                }
            });
        }

        // Education
        if (profile.education.length > 0) {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Education', 20, yPos);
            yPos += 7;

            profile.education.forEach((edu) => {
                doc.setFontSize(11);
                doc.setFont(undefined, 'bold');
                doc.text(edu.degree, 20, yPos);
                yPos += 6;
                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');
                doc.text(`${edu.school} | ${edu.year}`, 20, yPos);
                yPos += 8;
            });
        }

        doc.save(`${profile.name || 'resume'}.pdf`);
    };

    return (
        <div className="max-w-5xl mx-auto pb-10">
            {isLoading ? (
                // Loading Skeleton
                <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl p-10 space-y-8 animate-pulse">
                    <div className="h-56 bg-gray-800 rounded-2xl"></div>
                    <div className="space-y-4">
                        <div className="h-8 bg-gray-800 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                        <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-32 bg-gray-800 rounded"></div>
                        <div className="h-32 bg-gray-800 rounded"></div>
                    </div>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative"
                >
                    {/* Hero Header */}
                    <div className="h-56 bg-gradient-to-r from-blue-900/50 via-purple-900/50 to-gray-900/50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        {/* Action Buttons */}
                        <div className="absolute bottom-6 right-10 z-40 flex items-center gap-3">
                            {/* Preview/Edit Toggle */}
                            <button
                                onClick={() => setIsPreviewMode(!isPreviewMode)}
                                className="bg-white/10 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-white/10 hover:bg-white/20 transition-all flex items-center gap-2 shadow-lg"
                            >
                                {isPreviewMode ? <><Edit className="w-5 h-5" /> Edit</> : <><Eye className="w-5 h-5" /> Preview</>}
                            </button>

                            {/* Export PDF */}
                            <button
                                onClick={exportToPDF}
                                className="bg-white/10 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-white/10 hover:bg-white/20 transition-all flex items-center gap-2 shadow-lg"
                            >
                                <FileDown className="w-5 h-5" /> Export PDF
                            </button>

                            {/* Upload Resume */}
                            <div className="relative group">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    disabled={uploading}
                                />
                                <button className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-xl border border-white/10 hover:bg-white/20 transition-all flex items-center gap-2 shadow-lg">
                                    {uploading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Upload className="w-5 h-5" />}
                                    {uploading ? 'Analyzing Resume...' : 'Import from Resume'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Profile Info - Outside gradient to prevent overlap */}
                    <div className="relative -mt-16 px-10 z-30">
                        <div className="flex items-end gap-6">
                            <div className="w-32 h-32 bg-gray-900 rounded-2xl border-4 border-gray-900 flex items-center justify-center shadow-lg">
                                <span className="text-4xl font-bold text-gray-700 select-none">
                                    {profile.name ? profile.name.charAt(0) : <User className="w-12 h-12" />}
                                </span>
                            </div>
                            <div className="mb-4 flex-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-4xl font-bold text-white tracking-tight">{profile.name || 'Your Name'}</h2>
                                        <p className="text-blue-400 font-medium">{profile.jobTitle || 'Software Engineer'}</p>
                                    </div>
                                    {/* Completeness Indicator */}
                                    <div className="text-right">
                                        <div className="text-sm text-gray-400 mb-1">Profile Completeness</div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-48 h-2 bg-gray-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    className={`h-full rounded-full ${calculateCompleteness() === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${calculateCompleteness()}%` }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                            </div>
                                            <span className={`text-lg font-bold ${calculateCompleteness() === 100 ? 'text-green-400' : 'text-blue-400'}`}>
                                                {calculateCompleteness()}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 px-10 pb-10">
                        {isPreviewMode ? (
                            /* Clean Resume View */
                            <div className="max-w-4xl mx-auto bg-white text-gray-900 p-12 rounded-xl shadow-2xl">
                                {/* Header */}
                                <div className="border-b-2 border-gray-900 pb-6 mb-6">
                                    <h1 className="text-5xl font-bold text-gray-900 mb-2">{profile.name || 'Your Name'}</h1>
                                    <p className="text-xl text-blue-600 font-medium mb-4">{profile.jobTitle || 'Software Engineer'}</p>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                                        {profile.email && <span>📧 {profile.email}</span>}
                                        {profile.phone && <span>📱 {profile.phone}</span>}
                                        {profile.socialLinks.linkedin && <span>💼 LinkedIn</span>}
                                        {profile.socialLinks.github && <span>💻 GitHub</span>}
                                    </div>
                                </div>

                                {/* Professional Summary */}
                                {profile.bio && (
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-3 uppercase tracking-wide">Professional Summary</h2>
                                        <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                                    </div>
                                )}

                                {/* Skills */}
                                {profile.skills.length > 0 && (
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-3 uppercase tracking-wide">Skills</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.skills.map((skill, index) => (
                                                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Experience */}
                                {profile.experience.length > 0 && (
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Work Experience</h2>
                                        <div className="space-y-6">
                                            {profile.experience.map((exp, index) => (
                                                <div key={index} className="border-l-4 border-blue-600 pl-4">
                                                    <h3 className="text-xl font-bold text-gray-900">{exp.role}</h3>
                                                    <p className="text-gray-700 font-medium">{exp.company} | {exp.duration}</p>
                                                    <p className="text-gray-600 mt-2">{exp.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Education */}
                                {profile.education.length > 0 && (
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Education</h2>
                                        <div className="space-y-4">
                                            {profile.education.map((edu, index) => (
                                                <div key={index}>
                                                    <h3 className="text-xl font-bold text-gray-900">{edu.degree}</h3>
                                                    <p className="text-gray-700">{edu.school} | {edu.year}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Footer Note */}
                                <div className="mt-12 pt-6 border-t border-gray-300 text-center text-gray-500 text-sm">
                                    Click "Edit" to make changes to your profile
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSave} className={`space-y-12 ${isPreviewMode ? 'pointer-events-none opacity-90' : ''}`}>

                                {/* Section: Personal Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-800 pb-2">Personal Details</h3>
                                        <div className="space-y-4">
                                            <div className="group">
                                                <label className="block text-xs text-gray-500 mb-1 uppercase font-bold group-focus-within:text-blue-500 transition-colors">Full Name</label>
                                                <input
                                                    className={`input-modern w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${isPreviewMode ? 'cursor-not-allowed opacity-70' : ''}`}
                                                    value={profile.name}
                                                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                                                    placeholder="John Doe"
                                                    readOnly={isPreviewMode}
                                                    disabled={isPreviewMode}
                                                />
                                            </div>
                                            <div className="group">
                                                <label className="block text-xs text-gray-500 mb-1 uppercase font-bold group-focus-within:text-blue-500 transition-colors">Job Title</label>
                                                <input
                                                    className="input-modern w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                                    value={profile.jobTitle}
                                                    onChange={e => setProfile({ ...profile, jobTitle: e.target.value })}
                                                    placeholder="Software Engineer"
                                                />
                                            </div>
                                            <div className="group">
                                                <label className="block text-xs text-gray-500 mb-1 uppercase font-bold group-focus-within:text-blue-500 transition-colors">Email</label>
                                                <input
                                                    className={`input-modern w-full bg-gray-800/50 border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 transition-all ${profile.email && !validateEmail(profile.email)
                                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                        : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500'
                                                        }`}
                                                    value={profile.email}
                                                    onChange={e => setProfile({ ...profile, email: e.target.value })}
                                                    placeholder="john@example.com"
                                                />
                                                {profile.email && !validateEmail(profile.email) && (
                                                    <p className="text-red-400 text-xs mt-1">Please enter a valid email address</p>
                                                )}
                                            </div>
                                            <div className="group">
                                                <label className="block text-xs text-gray-500 mb-1 uppercase font-bold group-focus-within:text-blue-500 transition-colors">Phone</label>
                                                <input
                                                    className={`input-modern w-full bg-gray-800/50 border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 transition-all ${profile.phone && !validatePhone(profile.phone)
                                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                        : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500'
                                                        }`}
                                                    value={profile.phone}
                                                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                                    placeholder="+1 234 567 890"
                                                />
                                                {profile.phone && !validatePhone(profile.phone) && (
                                                    <p className="text-red-400 text-xs mt-1">Please enter a valid phone number (min 10 digits)</p>
                                                )}
                                            </div>

                                            {/* Social Links */}
                                            <div className="space-y-4 pt-4 border-t border-gray-800">
                                                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Social Links</h4>
                                                <div className="group">
                                                    <label className="block text-xs text-gray-500 mb-1 uppercase font-bold group-focus-within:text-blue-500 transition-colors">LinkedIn</label>
                                                    <input
                                                        className="input-modern w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                                        value={profile.socialLinks.linkedin}
                                                        onChange={e => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, linkedin: e.target.value } })}
                                                        placeholder="https://linkedin.com/in/username"
                                                    />
                                                </div>
                                                <div className="group">
                                                    <label className="block text-xs text-gray-500 mb-1 uppercase font-bold group-focus-within:text-blue-500 transition-colors">GitHub</label>
                                                    <input
                                                        className="input-modern w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                                        value={profile.socialLinks.github}
                                                        onChange={e => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, github: e.target.value } })}
                                                        placeholder="https://github.com/username"
                                                    />
                                                </div>
                                                <div className="group">
                                                    <label className="block text-xs text-gray-500 mb-1 uppercase font-bold group-focus-within:text-blue-500 transition-colors">Portfolio</label>
                                                    <input
                                                        className="input-modern w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                                        value={profile.socialLinks.portfolio}
                                                        onChange={e => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, portfolio: e.target.value } })}
                                                        placeholder="https://yourportfolio.com"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-800 pb-2">Professional Summary</h3>
                                        <div className="group h-full">
                                            <textarea
                                                className="w-full h-64 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none leading-relaxed"
                                                value={profile.bio || ''}
                                                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                                placeholder="Write a brief bio about yourself..."
                                                maxLength={500}
                                            />
                                            <div className="flex justify-between items-center mt-1 text-xs">
                                                <span className="text-gray-500">Tip: Keep it concise and impactful</span>
                                                <span className={`font-medium ${(profile.bio?.length || 0) > 450 ? 'text-yellow-400' : 'text-gray-500'}`}>
                                                    {profile.bio?.length || 0}/500 characters
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Skills */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-gray-400 uppercase tracking-widest border-b border-gray-800 pb-2">Skills & Expertise</h3>
                                    <div className="bg-gray-800/30 border border-gray-800 rounded-xl p-6">
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <AnimatePresence>
                                                {profile.skills.map(skill => (
                                                    <motion.span
                                                        key={skill}
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0.8, opacity: 0 }}
                                                        className="bg-blue-900/30 text-blue-300 border border-blue-800/50 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 group hover:bg-blue-900/50 transition-colors cursor-default"
                                                    >
                                                        {skill}
                                                        <button type="button" onClick={() => removeSkill(skill)} className="text-blue-400 hover:text-white"><X className="w-3 h-3" /></button>
                                                    </motion.span>
                                                ))}
                                            </AnimatePresence>
                                            <input
                                                className="bg-transparent border-none text-white focus:ring-0 placeholder-gray-600 min-w-[150px]"
                                                value={newSkill}
                                                onChange={e => setNewSkill(e.target.value)}
                                                onKeyDown={addSkill}
                                                placeholder="Type a skill & hit Enter..."
                                            />
                                        </div>
                                        {/* Skill Suggestions */}
                                        {skillSuggestions.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-2 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
                                            >
                                                {skillSuggestions.map((skill, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => {
                                                            setProfile(prev => ({ ...prev, skills: [...prev.skills, skill] }));
                                                            setNewSkill('');
                                                            setSkillSuggestions([]);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-gray-300 hover:bg-blue-600/20 hover:text-blue-400 transition-colors text-sm"
                                                    >
                                                        {skill}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </div>
                                </div>

                                {/* Section: Experience */}
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                                        <h3 className="text-lg font-semibold text-gray-400 uppercase tracking-widest">Work Experience</h3>
                                        <button
                                            type="button"
                                            onClick={addExperience}
                                            className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-blue-600/30"
                                        >
                                            <Plus className="w-4 h-4" /> Add Position
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <AnimatePresence>
                                            {profile.experience.map((exp, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 relative group hover:border-gray-600 transition-colors"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExperience(index)}
                                                        className="absolute top-4 right-4 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <div className="flex items-start gap-4">
                                                        <div className="bg-gray-700/50 p-3 rounded-lg">
                                                            <Briefcase className="w-6 h-6 text-purple-400" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <input
                                                                className="text-xl font-bold text-white bg-transparent border-none focus:outline-none focus:ring-0 w-full mb-1"
                                                                value={exp.role}
                                                                onChange={e => {
                                                                    const newExp = [...profile.experience];
                                                                    newExp[index].role = e.target.value;
                                                                    setProfile({ ...profile, experience: newExp });
                                                                }}
                                                                placeholder="Job Title"
                                                            />
                                                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                                                                <input
                                                                    className="font-medium text-purple-300 bg-transparent border-none focus:outline-none focus:ring-0 w-auto"
                                                                    value={exp.company}
                                                                    onChange={e => {
                                                                        const newExp = [...profile.experience];
                                                                        newExp[index].company = e.target.value;
                                                                        setProfile({ ...profile, experience: newExp });
                                                                    }}
                                                                    placeholder="Company"
                                                                />
                                                                <span>•</span>
                                                                <input
                                                                    className="bg-transparent border-none focus:outline-none focus:ring-0 w-auto text-gray-400"
                                                                    value={exp.duration}
                                                                    onChange={e => {
                                                                        const newExp = [...profile.experience];
                                                                        newExp[index].duration = e.target.value;
                                                                        setProfile({ ...profile, experience: newExp });
                                                                    }}
                                                                    placeholder="Duration"
                                                                />
                                                            </div>
                                                            <textarea
                                                                className="text-gray-400 text-sm leading-relaxed bg-transparent border-none focus:outline-none focus:ring-0 w-full resize-none"
                                                                value={exp.description}
                                                                onChange={e => {
                                                                    const newExp = [...profile.experience];
                                                                    newExp[index].description = e.target.value;
                                                                    setProfile({ ...profile, experience: newExp });
                                                                }}
                                                                placeholder="Job description..."
                                                                rows={2}
                                                            />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        {profile.experience.length === 0 && (
                                            <div className="text-center py-10 border-2 border-dashed border-gray-800 rounded-xl text-gray-500">
                                                No experience added yet. Upload your resume or click "Add Position"!
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Section: Education */}
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                                        <h3 className="text-lg font-semibold text-gray-400 uppercase tracking-widest">Education</h3>
                                        <button
                                            type="button"
                                            onClick={addEducation}
                                            className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-blue-600/30"
                                        >
                                            <Plus className="w-4 h-4" /> Add Education
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <AnimatePresence>
                                            {profile.education.map((edu, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 relative group hover:border-gray-600 transition-colors"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => removeEducation(index)}
                                                        className="absolute top-4 right-4 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <div className="flex items-start gap-4">
                                                        <div className="bg-gray-700/50 p-3 rounded-lg">
                                                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1">
                                                            <input
                                                                className="text-xl font-bold text-white bg-transparent border-none focus:outline-none focus:ring-0 w-full mb-1"
                                                                value={edu.degree}
                                                                onChange={e => {
                                                                    const newEdu = [...profile.education];
                                                                    newEdu[index].degree = e.target.value;
                                                                    setProfile({ ...profile, education: newEdu });
                                                                }}
                                                                placeholder="Degree"
                                                            />
                                                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                                                <input
                                                                    className="font-medium text-green-300 bg-transparent border-none focus:outline-none focus:ring-0 w-auto"
                                                                    value={edu.school}
                                                                    onChange={e => {
                                                                        const newEdu = [...profile.education];
                                                                        newEdu[index].school = e.target.value;
                                                                        setProfile({ ...profile, education: newEdu });
                                                                    }}
                                                                    placeholder="School/University"
                                                                />
                                                                <span>•</span>
                                                                <input
                                                                    className="bg-transparent border-none focus:outline-none focus:ring-0 w-auto text-gray-400"
                                                                    value={edu.year}
                                                                    onChange={e => {
                                                                        const newEdu = [...profile.education];
                                                                        newEdu[index].year = e.target.value;
                                                                        setProfile({ ...profile, education: newEdu });
                                                                    }}
                                                                    placeholder="Year"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        {profile.education.length === 0 && (
                                            <div className="text-center py-10 border-2 border-dashed border-gray-800 rounded-xl text-gray-500">
                                                No education added yet. Upload your resume or click "Add Education"!
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Save Action */}
                                <div className="pt-8 flex items-center justify-between border-t border-gray-800 sticky bottom-0 bg-gray-900/95 backdrop-blur-sm py-4 z-30">
                                    <span className="text-green-400 font-medium flex items-center gap-2 h-6">
                                        {msg && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10, scale: 0.8 }}
                                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                                className="flex items-center gap-2"
                                            >
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: [0, 1.2, 1] }}
                                                    transition={{ duration: 0.4 }}
                                                >
                                                    <Check className="w-4 h-4" />
                                                </motion.div>
                                                {msg}
                                            </motion.div>
                                        )}
                                    </span>
                                    {!isPreviewMode && (
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={handleReset}
                                                className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-6 py-3 rounded-xl font-semibold border border-red-600/30 transition-all flex items-center gap-2"
                                            >
                                                <X className="w-5 h-5" /> Reset Profile
                                            </button>
                                            <button
                                                type="submit"
                                                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2 transform active:scale-95"
                                                disabled={loading}
                                            >
                                                {loading ? 'Saving...' : <><Save className="w-5 h-5" /> Save Changes</>}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Profile;
