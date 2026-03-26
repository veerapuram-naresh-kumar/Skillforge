
import { motion } from 'framer-motion';

const SkillPill = ({ skill, level = 'intermediate' }) => {
    const colors = {
        beginner: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
        intermediate: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
        expert: 'bg-green-500/20 text-green-300 border-green-500/50',
        missing: 'bg-red-500/20 text-red-300 border-red-500/50',
    };

    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[level]} cursor-pointer backdrop-blur-md transition-all duration-300 hover:scale-110 hover:shadow-[0_0_8px_rgba(255,255,255,0.8)]`}
        >
            {skill}
        </span>
    );
};

export default SkillPill;
