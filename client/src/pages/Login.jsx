import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GlowButton from '../components/GlowButton';
import ParticlesBackground from '../components/ParticlesBackground';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const { email, password } = formData;

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        const result = await login(email, password);

        if (result.success) {
            toast.success('Login Successful!');
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } else {
            toast.error(result.message || 'Login Failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
            {/* <ParticlesBackground /> */}

            <div
                className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-96 border border-white/20 z-10"
            >
                <h2 className="text-3xl font-bold text-center text-white mb-6">Welcome Back</h2>

                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <GlowButton className="w-full py-3 mt-4">
                        Login
                    </GlowButton>
                </form>

                <p className="mt-6 text-center text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold">
                        Register
                    </Link>
                </p>
            </div>
            <ToastContainer position="bottom-right" theme="dark" />
        </div>
    );
};

export default Login;
