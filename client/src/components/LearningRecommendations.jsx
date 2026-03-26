import { useState } from 'react';

const SkillCard = ({ item, index }) => {
    const [expanded, setExpanded] = useState(true);

    // Pick a unique accent color per card based on index
    const accents = [
        { border: 'border-violet-500/40', glow: 'from-violet-900/30', tag: 'bg-violet-500/20 text-violet-300', badge: 'bg-violet-500/20 border-violet-500/40 text-violet-300' },
        { border: 'border-cyan-500/40',   glow: 'from-cyan-900/30',   tag: 'bg-cyan-500/20 text-cyan-300',   badge: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'   },
        { border: 'border-amber-500/40',  glow: 'from-amber-900/30',  tag: 'bg-amber-500/20 text-amber-300', badge: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
        { border: 'border-emerald-500/40',glow: 'from-emerald-900/30',tag: 'bg-emerald-500/20 text-emerald-300', badge: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' },
        { border: 'border-pink-500/40',   glow: 'from-pink-900/30',   tag: 'bg-pink-500/20 text-pink-300',   badge: 'bg-pink-500/20 border-pink-500/40 text-pink-300'   },
        { border: 'border-orange-500/40', glow: 'from-orange-900/30', tag: 'bg-orange-500/20 text-orange-300', badge: 'bg-orange-500/20 border-orange-500/40 text-orange-300' },
    ];
    const accent = accents[index % accents.length];

    const primaryDoc = item.docs?.[0];

    return (
        <div
            className={`rounded-2xl border ${accent.border} bg-gradient-to-br ${accent.glow} to-slate-900/50 overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl`}
            style={{ backdropFilter: 'blur(8px)' }}
        >
            {/* Card Header */}
            <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer select-none"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest font-mono ${accent.badge} border`}>
                        {item.skill}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {primaryDoc && (
                        <a
                            href={primaryDoc.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors group"
                            title="Open Docs"
                        >
                            <svg className="w-3.5 h-3.5 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Docs
                        </a>
                    )}
                    <button className={`w-6 h-6 flex items-center justify-center rounded-full transition-all text-slate-400 hover:text-white bg-white/5 hover:bg-white/10`}>
                        <svg
                            className={`w-3.5 h-3.5 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Expandable Body */}
            {expanded && (
                <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                    {/* YouTube */}
                    {item.youtube?.length > 0 && (
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                                <span>🎥</span> YouTube Channels
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {item.youtube.map((ch, i) => (
                                    <a
                                        key={i}
                                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ch + ' ' + item.skill + ' tutorial')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-900/30 border border-red-500/20 text-red-300 text-xs font-semibold hover:bg-red-900/50 hover:border-red-500/40 transition-all active:scale-95"
                                    >
                                        <svg className="w-3 h-3 text-red-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                        </svg>
                                        {ch}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Courses */}
                    {item.courses?.length > 0 && (
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                                <span>📘</span> Recommended Courses
                            </p>
                            <ul className="space-y-2">
                                {item.courses.map((course, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                        <a
                                            href={`https://www.google.com/search?q=${encodeURIComponent(course)}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-slate-300 hover:text-white transition-colors underline underline-offset-2 decoration-dotted"
                                        >
                                            {course}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Docs */}
                    {item.docs?.length > 0 && (
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                                <span>📄</span> Official Documentation
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {item.docs.map((doc, i) => (
                                    <a
                                        key={i}
                                        href={doc.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900/30 border border-blue-500/20 text-blue-300 text-xs font-semibold hover:bg-blue-900/50 hover:border-blue-500/40 transition-all active:scale-95"
                                    >
                                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        {doc.label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Start Learning CTA */}
                    {primaryDoc && (
                        <a
                            href={primaryDoc.url}
                            target="_blank"
                            rel="noreferrer"
                            className={`mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 ${accent.tag} border ${accent.border} hover:opacity-90`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Start Learning
                        </a>
                    )}
                </div>
            )}
        </div>
    );
};

const LearningRecommendations = ({ recommendations, jobReady, loading }) => {
    if (loading) {
        return (
            <div className="mt-8">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">📚</span>
                    <h2 className="text-lg font-bold text-white">Learning Recommendations</h2>
                </div>
                <div className="flex items-center gap-3 text-slate-400 text-sm">
                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    Fetching personalized learning resources...
                </div>
            </div>
        );
    }

    if (jobReady) {
        return (
            <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">📚</span>
                    <h2 className="text-lg font-bold text-white">Learning Recommendations</h2>
                </div>
                <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/30 to-slate-900/50 p-8 text-center">
                    <div className="text-5xl mb-4">🎉</div>
                    <h3 className="text-xl font-bold text-emerald-400 mb-2">You are Job Ready!</h3>
                    <p className="text-slate-400 text-sm">No missing skills detected for your target role. Keep building projects and stay sharp!</p>
                </div>
            </div>
        );
    }

    if (!recommendations || recommendations.length === 0) return null;

    return (
        <div className="mt-8">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">📚</span>
                    <div>
                        <h2 className="text-lg font-bold text-white leading-tight">Learning Recommendations</h2>
                        <p className="text-[11px] text-slate-500 mt-0.5">Personalized resources for every missing skill</p>
                    </div>
                </div>
                <span className="bg-indigo-500/20 text-indigo-300 text-xs px-3 py-1.5 rounded-lg border border-indigo-500/30 font-bold font-mono">
                    {recommendations.length} skill{recommendations.length !== 1 ? 's' : ''} to master
                </span>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {recommendations.map((item, i) => (
                    <SkillCard key={item.skill} item={item} index={i} />
                ))}
            </div>

            <p className="text-[10px] text-slate-600 text-center mt-4 font-mono">
                ✨ All resources are curated & verified. No external APIs — 100% static, fast &amp; reliable.
            </p>
        </div>
    );
};

export default LearningRecommendations;
