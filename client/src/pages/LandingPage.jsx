
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import FloatingCard from '../components/FloatingCard';
import GlowButton from '../components/GlowButton';
import SkillPill from '../components/SkillPill';

import ParticlesBackground from '../components/ParticlesBackground';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Particles */}
            {/* <ParticlesBackground /> */}

            {/* Grainy Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none"></div>

            {/* Animated Blob Background */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

            <div
                className="text-center z-10 max-w-4xl relative"
            >
                <div className="mb-4 inline-block">
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="px-4 py-1 rounded-full bg-white/10 border border-white/20 text-blue-300 text-sm font-medium backdrop-blur-md"
                    >
                        v2.0 Beta Live
                    </motion.span>
                </div>

                <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-6 drop-shadow-2xl tracking-tight">
                    SKILL FORGE
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-12 font-light tracking-wide max-w-2xl mx-auto">
                    AI-Powered  Skill Intelligence for the Next Gen.
                </p>

                <Link to="/login">
                    <GlowButton className="text-lg px-10 py-5 text-xl">
                        Get Started 🚀
                    </GlowButton>
                </Link>
            </div>

            {/* Floating Elements - Decorative */}
            <div className="absolute top-1/4 left-10 md:left-20 hidden lg:block z-10">
                <FloatingCard delay={0.2} className="w-72 rotate-[-6deg]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">⚠️</div>
                        <h3 className="font-bold text-gray-200">Skill Gap Detected</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <SkillPill skill="React" level="expert" />
                        <SkillPill skill="TypeScript" level="missing" />
                    </div>
                </FloatingCard>
            </div>

            <div className="absolute bottom-1/4 right-10 md:right-20 hidden lg:block z-10">
                <FloatingCard delay={0.4} className="w-72 rotate-[6deg]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">✓</div>
                        <h3 className="font-bold text-gray-200">Readiness Score</h3>
                    </div>
                    <div className="flex items-end gap-2">
                        <div className="text-5xl font-bold text-white tracking-tighter">85%</div>
                        <p className="text-sm text-green-400 mb-1 pb-1 font-medium">+12% this week</p>
                    </div>
                </FloatingCard>
            </div>

        </div>
    );
};

export default LandingPage;
