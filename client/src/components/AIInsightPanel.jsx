
import { motion } from 'framer-motion';

const AIInsightPanel = ({ insights }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full flex flex-col shadow-2xl relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>

            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_#4ade80]" />
                <h3 className="text-xl font-bold text-white tracking-wide">AI Analyst</h3>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {insights.length > 0 ? (
                    insights.map((insight, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 * index }}
                            className="bg-white/5 p-4 rounded-xl border-l-4 border-indigo-500 hover:bg-white/10 transition-colors"
                        >
                            <p className="text-sm text-gray-200 leading-relaxed font-light">{insight}</p>
                        </motion.div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 italic">
                        <span className="text-3xl mb-2">🤖</span>
                        <p>Waiting for analysis...</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default AIInsightPanel;
