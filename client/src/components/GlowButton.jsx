
import { motion } from 'framer-motion';

const GlowButton = ({ children, onClick, className = '' }) => {
    return (
        <button
            onClick={onClick}
            className={`relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-bold text-white transition-all duration-300 bg-indigo-600 rounded-lg group focus:outline-none ring-offset-2 focus:ring-2 ring-indigo-400 hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] active:scale-95 ${className}`}
        >
            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
            <span className="relative">{children}</span>
        </button>
    );
};

export default GlowButton;
