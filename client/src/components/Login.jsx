import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Demo Users
    const demoUsers = [
        { name: 'Sarah Engineer', email: 'sarah@example.com', password: 'password123', role: 'Frontend Dev' },
        { name: 'Alex Manager', email: 'alex@example.com', password: 'password123', role: 'Product Manager' },
        { name: 'David Backend', email: 'david@example.com', password: 'password123', role: 'Backend Dev' },
        { name: 'Emily Design', email: 'emily@example.com', password: 'password123', role: 'UX Designer' },
        { name: 'Michael Intern', email: 'michael@example.com', password: 'password123', role: 'Intern' },
    ];

    const fillDemoUser = (user) => {
        setFormData({ email: user.email, password: user.password });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.msg || 'Login failed');
                setLoading(false);
                return;
            }

            localStorage.setItem('authToken', data.token);
            // Optionally store basic user info or fetch it on dashboard load
            // localStorage.setItem('userEmail', formData.email); 
            setLoading(false);
            navigate('/');
        } catch (err) {
            console.error(err);
            alert('Server error');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl"
                >
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-blue-500/20 mx-auto mb-4">
                            IH
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-gray-400">Sign in to access your interview dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-gray-950/50 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-medium text-gray-400">Password</label>
                                <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-gray-950/50 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 "
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    Sign In <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-800">
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-4 text-center">Quick Demo Login</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {demoUsers.map((user, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => fillDemoUser(user)}
                                    className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:border-gray-500 text-xs text-gray-300 transition-all flex flex-col items-center min-w-[100px]"
                                >
                                    <span className="font-bold text-white">{user.name.split(' ')[0]}</span>
                                    <span className="text-[10px] opacity-70">{user.role}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 text-center text-gray-500 text-sm">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            Create Account
                        </Link>
                    </div>
                </motion.div>

                <p className="text-center text-gray-600 text-xs mt-6">
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
};

export default Login;
