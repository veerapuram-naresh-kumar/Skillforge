import { motion } from 'framer-motion';

const FloatingCard = ({ children, className = '', delay = 0 }) => {
    return (
        <div
            className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${className}`}
        >
            {children}
        </div>
    );
};

export default FloatingCard;
