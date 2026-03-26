const COLOR_MAP = {
    amber: {
        border:   'border-amber-500/40',
        glow:     'from-amber-900/20',
        badge:    'bg-amber-500/20 border-amber-500/40 text-amber-300',
        step:     'bg-amber-900/40 border-amber-500/30 text-amber-300',
        dot:      'bg-amber-400',
        line:     'from-amber-500/50 to-transparent',
        time:     'text-amber-400',
        iconRing: 'border-amber-500/40 bg-amber-900/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
    },
    blue: {
        border:   'border-blue-500/40',
        glow:     'from-blue-900/20',
        badge:    'bg-blue-500/20 border-blue-500/40 text-blue-300',
        step:     'bg-blue-900/40 border-blue-500/30 text-blue-300',
        dot:      'bg-blue-400',
        line:     'from-blue-500/50 to-transparent',
        time:     'text-blue-400',
        iconRing: 'border-blue-500/40 bg-blue-900/50 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.2)]',
    },
    emerald: {
        border:   'border-emerald-500/40',
        glow:     'from-emerald-900/20',
        badge:    'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
        step:     'bg-emerald-900/40 border-emerald-500/30 text-emerald-300',
        dot:      'bg-emerald-400',
        line:     'from-emerald-500/50 to-transparent',
        time:     'text-emerald-400',
        iconRing: 'border-emerald-500/40 bg-emerald-900/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
    },
};

const PhaseCard = ({ phase }) => {
    const c = COLOR_MAP[phase.color] || COLOR_MAP.blue;

    return (
        <div className={`rounded-2xl border ${c.border} bg-gradient-to-br ${c.glow} to-slate-900/50 p-5 flex flex-col gap-4`}
             style={{ backdropFilter: 'blur(8px)' }}>
            {/* Phase Header */}
            <div className="flex items-start justify-between gap-2">
                <div>
                    <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${c.badge} mb-2`}>
                        Phase {phase.phase}
                    </span>
                    <h3 className="text-sm font-bold text-white">{phase.label}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{phase.description}</p>
                </div>
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 font-bold text-sm ${c.iconRing}`}>
                    {phase.phase}
                </div>
            </div>

            {/* Steps */}
            <div className="flex flex-col gap-3 relative">
                {/* Vertical connector line */}
                {phase.steps.length > 1 && (
                    <div className={`absolute left-4 top-8 bottom-4 w-px bg-gradient-to-b ${c.line} pointer-events-none`} />
                )}
                {phase.steps.map((step, i) => (
                    <div key={step.skill} className="flex gap-3 items-start group">
                        {/* Step number bubble */}
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 text-xs font-bold z-10 transition-transform group-hover:scale-110 ${c.step}`}>
                            {i + 1}
                        </div>
                        {/* Step content */}
                        <div className="flex-1 bg-white/3 border border-white/5 rounded-xl p-3 hover:border-white/10 transition-all group-hover:bg-white/5">
                            <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                                <span className="text-xs font-bold text-white capitalize">{step.skill}</span>
                                <span className={`text-[10px] font-mono font-semibold ${c.time} flex items-center gap-1`}>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {step.timeEstimate}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1 text-[10px] text-slate-400">
                                <span className="flex items-center gap-1.5">
                                    <span>🎥</span>
                                    <span className="truncate">{step.topChannel}</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span>📘</span>
                                    <span className="truncate">{step.topCourse}</span>
                                </span>
                            </div>
                            <a
                                href={step.startUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={`mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${c.time} hover:underline underline-offset-2 transition-colors`}
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Start Now →
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SkillRoadmap = ({ roadmap, targetRole, readinessScore, missingSkills, matchedSkills, loading }) => {
    if (loading) {
        return (
            <div className="mt-8 flex items-center gap-3 text-slate-400 text-sm">
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                Building your personalized roadmap...
            </div>
        );
    }

    if (!roadmap || roadmap.length === 0) return null;

    const totalSkills = (missingSkills?.length || 0) + (matchedSkills?.length || 0);
    const totalWeeks = roadmap.flatMap(p => p.steps).reduce((acc, s) => {
        // Extract first number from time string e.g. "3–4 weeks" → 3
        const n = parseInt(s.timeEstimate?.match(/\d+/)?.[0] || '2', 10);
        return acc + n;
    }, 0);

    return (
        <div className="mt-10">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🗺️</span>
                    <div>
                        <h2 className="text-lg font-bold text-white leading-tight">
                            Skill Gap Roadmap
                        </h2>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            Ordered learning path for <span className="text-white font-semibold capitalize">{targetRole}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-[11px] font-mono bg-slate-800/80 border border-white/10 px-3 py-1.5 rounded-lg text-slate-300">
                        ~{totalWeeks} weeks total
                    </span>
                    <span className="text-[11px] font-mono bg-red-900/30 border border-red-500/30 text-red-300 px-3 py-1.5 rounded-lg">
                        {missingSkills?.length || 0} skills to learn
                    </span>
                    <span className="text-[11px] font-mono bg-emerald-900/30 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-lg">
                        {readinessScore}% ready
                    </span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="mb-6 bg-slate-800/60 rounded-full h-2 overflow-hidden border border-white/5">
                <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                    style={{ width: `${readinessScore}%` }}
                />
            </div>

            {/* Matched vs Missing pills */}
            {(matchedSkills?.length > 0 || missingSkills?.length > 0) && (
                <div className="mb-6 p-4 rounded-xl bg-slate-800/40 border border-white/5">
                    <div className="flex flex-wrap gap-2 mb-2">
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold self-center">You Have:</span>
                        {matchedSkills?.map(s => (
                            <span key={s} className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 capitalize">{s}</span>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold self-center">Missing:</span>
                        {missingSkills?.map(s => (
                            <span key={s} className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-red-900/40 border border-red-500/30 text-red-300 capitalize">{s}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Phase Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {roadmap.map(phase => (
                    <PhaseCard key={phase.phase} phase={phase} />
                ))}
            </div>

            <p className="text-[10px] text-slate-600 text-center mt-5 font-mono">
                🎯 Skills are ordered by importance for your role. Complete Phase 1 completely before moving on.
            </p>
        </div>
    );
};

export default SkillRoadmap;
