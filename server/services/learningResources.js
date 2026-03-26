/**
 * Static Learning Resource Mapping
 * Maps normalized skill names to curated YouTube channels, courses, and documentation.
 */

const LEARNING_RESOURCES = {
    // --- Web Frontend ---
    'react': {
        youtube: ['Codevolution', 'freeCodeCamp', 'Traversy Media', 'Jack Herrington'],
        courses: ['React - The Complete Guide (Udemy)', 'Frontend Masters React Path', 'The Odin Project'],
        docs: [{ label: 'react.dev (Official)', url: 'https://react.dev' }],
    },
    'html': {
        youtube: ['Kevin Powell', 'freeCodeCamp', 'Traversy Media'],
        courses: ['The Web Developer Bootcamp (Udemy)', 'HTML & CSS Full Course – freeCodeCamp'],
        docs: [{ label: 'MDN HTML Reference', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' }],
    },
    'css': {
        youtube: ['Kevin Powell', 'freeCodeCamp', 'Traversy Media'],
        courses: ['CSS - The Complete Guide (Udemy)', 'CSS Grid & Flexbox for Responsive Layouts'],
        docs: [{ label: 'MDN CSS Reference', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS' }],
    },
    'javascript': {
        youtube: ['Fireship', 'Traversy Media', 'Akshay Saini', 'freeCodeCamp'],
        courses: ['JavaScript: The Complete Guide (Udemy)', 'JavaScript30 – Wes Bos (Free)', 'Eloquent JavaScript (Free Book)'],
        docs: [{ label: 'MDN JavaScript Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' }],
    },
    'typescript': {
        youtube: ['Matt Pocock', 'Fireship', 'Traversy Media'],
        courses: ['Understanding TypeScript (Udemy)', 'TypeScript Full Course – freeCodeCamp'],
        docs: [{ label: 'TypeScript Official Docs', url: 'https://www.typescriptlang.org/docs/' }],
    },
    'redux': {
        youtube: ['Codevolution', 'Traversy Media'],
        courses: ['React + Redux Mastery (Udemy)'],
        docs: [{ label: 'Redux Official Docs', url: 'https://redux.js.org/' }],
    },
    'next.js': {
        youtube: ['Traversy Media', 'Lee Robinson', 'Fireship'],
        courses: ['Next.js 14 Full Course (Udemy)', 'Next.js Docs Tutorial'],
        docs: [{ label: 'Next.js Official Docs', url: 'https://nextjs.org/docs' }],
    },
    'tailwindcss': {
        youtube: ['Traversy Media', 'Kevin Powell', 'freeCodeCamp'],
        courses: ['Tailwind CSS Full Course – freeCodeCamp'],
        docs: [{ label: 'Tailwind CSS Docs', url: 'https://tailwindcss.com/docs' }],
    },
    'graphql': {
        youtube: ['Traversy Media', 'Academind'],
        courses: ['GraphQL - The Complete Guide (Udemy)'],
        docs: [{ label: 'GraphQL Official Docs', url: 'https://graphql.org/learn/' }],
    },

    // --- Backend ---
    'node': {
        youtube: ['Net Ninja', 'Academind', 'Traversy Media'],
        courses: ['Node.js - The Complete Guide (Udemy)', 'The Complete Node Bootcamp'],
        docs: [{ label: 'Node.js Official Docs', url: 'https://nodejs.org/en/docs' }],
    },
    'express': {
        youtube: ['Net Ninja', 'Traversy Media', 'Academind'],
        courses: ['Node.js with Express - Complete Course (Udemy)'],
        docs: [{ label: 'Express.js Official Docs', url: 'https://expressjs.com/' }],
    },
    'java': {
        youtube: ['Telusko', 'Kunal Kushwaha', 'freeCodeCamp'],
        courses: ['Java Masterclass (Udemy)', 'NPTEL Java Programming'],
        docs: [{ label: 'Oracle Java Docs', url: 'https://docs.oracle.com/en/java/' }],
    },
    'spring boot': {
        youtube: ['Amigoscode', 'Daily Code Buffer', 'Java Brains'],
        courses: ['Spring Boot & Spring Framework – Chad Darby (Udemy)', 'Spring Boot Full Course – freeCodeCamp'],
        docs: [{ label: 'Spring Boot Official Docs', url: 'https://docs.spring.io/spring-boot/docs/current/reference/html/' }],
    },
    'python': {
        youtube: ['Corey Schafer', 'Tech With Tim', 'freeCodeCamp'],
        courses: ['100 Days of Code: Python (Udemy)', 'Python for Everybody – Coursera'],
        docs: [{ label: 'Python Official Docs', url: 'https://docs.python.org/3/' }],
    },
    'rest api': {
        youtube: ['Traversy Media', 'Academind', 'freeCodeCamp'],
        courses: ['REST API Design - Udemy', 'APIs and Web Services – Coursera'],
        docs: [{ label: 'REST API Best Practices – MDN', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Introduction' }],
    },

    // --- Databases ---
    'mongodb': {
        youtube: ['Net Ninja', 'Traversy Media', 'freeCodeCamp'],
        courses: ['MongoDB - The Complete Developer Guide (Udemy)'],
        docs: [{ label: 'MongoDB Official Docs', url: 'https://www.mongodb.com/docs/' }],
    },
    'sql': {
        youtube: ['Kudvenkat', 'freeCodeCamp', 'Tech TFQ'],
        courses: ['The Complete SQL Bootcamp (Udemy)', 'SQL for Data Science – Coursera'],
        docs: [{ label: 'W3Schools SQL', url: 'https://www.w3schools.com/sql/' }],
    },
    'mysql': {
        youtube: ['Traversy Media', 'freeCodeCamp', 'Kudvenkat'],
        courses: ['MySQL Bootcamp (Udemy)'],
        docs: [{ label: 'MySQL Official Docs', url: 'https://dev.mysql.com/doc/' }],
    },
    'postgresql': {
        youtube: ['freeCodeCamp', 'Amigoscode'],
        courses: ['PostgreSQL Full Course – freeCodeCamp'],
        docs: [{ label: 'PostgreSQL Official Docs', url: 'https://www.postgresql.org/docs/' }],
    },
    'hibernate': {
        youtube: ['Java Brains', 'Telusko'],
        courses: ['Hibernate & JPA Fundamentals (Udemy)'],
        docs: [{ label: 'Hibernate ORM Docs', url: 'https://hibernate.org/orm/documentation/' }],
    },

    // --- DevOps & Cloud ---
    'docker': {
        youtube: ['TechWorld with Nana', 'Fireship', 'freeCodeCamp'],
        courses: ['Docker & Kubernetes: The Practical Guide (Udemy)', 'Docker for Beginners – freeCodeCamp'],
        docs: [{ label: 'Docker Official Docs', url: 'https://docs.docker.com/' }],
    },
    'kubernetes': {
        youtube: ['TechWorld with Nana', 'freeCodeCamp', 'Mumshad Mannambeth'],
        courses: ['Kubernetes Certified (Udemy – KodeKloud)', 'Kubernetes Fundamentals – edX'],
        docs: [{ label: 'Kubernetes Official Docs', url: 'https://kubernetes.io/docs/' }],
    },
    'aws': {
        youtube: ['TechWorld with Nana', 'freeCodeCamp', 'Stephane Maarek'],
        courses: ['AWS Certified Solutions Architect (Udemy)', 'Cloud Practitioner Essentials – AWS Training (Free)'],
        docs: [{ label: 'AWS Official Docs', url: 'https://docs.aws.amazon.com/' }],
    },
    'azure': {
        youtube: ['Adam Marczak', 'freeCodeCamp'],
        courses: ['Azure Fundamentals AZ-900 (Udemy)', 'Microsoft Learn – Azure (Free)'],
        docs: [{ label: 'Microsoft Azure Docs', url: 'https://learn.microsoft.com/en-us/azure/' }],
    },
    'linux': {
        youtube: ['NetworkChuck', 'LearnLinuxTV', 'freeCodeCamp'],
        courses: ['Linux Command Line Bootcamp (Udemy)', 'Linux for Beginners – freeCodeCamp'],
        docs: [{ label: 'Linux Man Pages', url: 'https://man7.org/linux/man-pages/' }],
    },
    'bash': {
        youtube: ['NetworkChuck', 'freeCodeCamp'],
        courses: ['Shell Scripting Masterclass (Udemy)'],
        docs: [{ label: 'GNU Bash Manual', url: 'https://www.gnu.org/software/bash/manual/' }],
    },

    // --- Data Science & ML ---
    'machine learning': {
        youtube: ['StatQuest', 'Sentdex', 'freeCodeCamp', 'Andrej Karpathy'],
        courses: ['Machine Learning Specialization – Coursera (Andrew Ng)', 'Fast.ai Practical Deep Learning (Free)'],
        docs: [{ label: 'Scikit-Learn Docs', url: 'https://scikit-learn.org/stable/documentation.html' }],
    },
    'artificial intelligence': {
        youtube: ['Two Minute Papers', 'Yannic Kilcher', 'freeCodeCamp'],
        courses: ['AI For Everyone – Coursera (Andrew Ng)', 'Deep Learning Specialization – Coursera'],
        docs: [{ label: 'TensorFlow Docs', url: 'https://www.tensorflow.org/guide' }],
    },
    'data visualization': {
        youtube: ['freeCodeCamp', 'Corey Schafer'],
        courses: ['Data Visualization with Python (Udemy)', 'D3.js Full Course – freeCodeCamp'],
        docs: [{ label: 'Matplotlib Docs', url: 'https://matplotlib.org/stable/contents.html' }],
    },
    'pandas': {
        youtube: ['Corey Schafer', 'freeCodeCamp'],
        courses: ['Python Pandas Tutorial (YouTube – freeCodeCamp)', 'Data Analysis with Pandas (Udemy)'],
        docs: [{ label: 'Pandas Official Docs', url: 'https://pandas.pydata.org/docs/' }],
    },

    // --- Misc ---
    'git': {
        youtube: ['freeCodeCamp', 'Traversy Media', 'The Coding Train'],
        courses: ['Git & GitHub Crash Course (Udemy)', 'Git + GitHub Full Course – freeCodeCamp'],
        docs: [{ label: 'Official Git Reference', url: 'https://git-scm.com/docs' }],
    },
    'firebase': {
        youtube: ['Fireship', 'Net Ninja'],
        courses: ['Firebase Full Course (YouTube – freeCodeCamp)'],
        docs: [{ label: 'Firebase Official Docs', url: 'https://firebase.google.com/docs' }],
    },
    'flutter': {
        youtube: ['The Net Ninja', 'Mitch Koko', 'freeCodeCamp'],
        courses: ['Flutter & Dart – The Complete Guide (Udemy)'],
        docs: [{ label: 'Flutter Official Docs', url: 'https://docs.flutter.dev/' }],
    },
    'kotlin': {
        youtube: ['Stevdza-San', 'freeCodeCamp'],
        courses: ['Kotlin for Android Developers (Udemy)', 'Kotlin Bootcamp – Google Codelabs (Free)'],
        docs: [{ label: 'Kotlin Official Docs', url: 'https://kotlinlang.org/docs/' }],
    },
    'swift': {
        youtube: ['Sean Allen', 'freeCodeCamp'],
        courses: ['iOS & Swift – The Complete iOS App Development Bootcamp (Udemy)'],
        docs: [{ label: 'Apple Swift Docs', url: 'https://www.swift.org/documentation/' }],
    },
    'dsa': {
        youtube: ['Striver (takeUforward)', 'Kunal Kushwaha', 'Abdul Bari', 'NeetCode'],
        courses: ['DSA Masterclass (Udemy)', 'NeetCode 150 (Free – YouTube)'],
        docs: [{ label: 'LeetCode Explore', url: 'https://leetcode.com/explore/' }],
    },
    'c++': {
        youtube: ['The Cherno', 'freeCodeCamp', 'Striver'],
        courses: ['Beginning C++ Programming (Udemy)', 'C++ Full Course – freeCodeCamp'],
        docs: [{ label: 'cppreference.com', url: 'https://en.cppreference.com/w/' }],
    },
    'csharp': {
        youtube: ['IAmTimCorey', 'freeCodeCamp'],
        courses: ['C# Masterclass (Udemy)', 'Microsoft C# Docs (Free)'],
        docs: [{ label: 'Microsoft C# Docs', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/' }],
    },
};

// Generic fallback when skill not found in mapping
const GENERIC_FALLBACK = (skill) => ({
    youtube: ['freeCodeCamp'],
    courses: [`Search "${skill} full course" on Udemy or Coursera`],
    docs: [{ label: `Google: ${skill} documentation`, url: `https://www.google.com/search?q=${encodeURIComponent(skill + ' official documentation')}` }],
});

/**
 * Given an array of missing skill strings (normalized lowercase),
 * returns an array of { skill, youtube, courses, docs } objects.
 */
const getRecommendations = (missingSkills = []) => {
    return missingSkills.map((skill) => {
        const normalizedSkill = skill.toLowerCase().trim();
        const resources = LEARNING_RESOURCES[normalizedSkill] || GENERIC_FALLBACK(normalizedSkill);
        return {
            skill: normalizedSkill,
            youtube: resources.youtube,
            courses: resources.courses,
            docs: resources.docs,
        };
    });
};


/**
 * Role-based learning priority order.
 * Skills listed first should be learned first (foundational → advanced).
 */
const ROLE_SKILL_ORDER = {
    'mern developer':       ['javascript', 'html', 'css', 'react', 'node', 'express', 'mongodb'],
    'java backend':         ['java', 'sql', 'rest api', 'spring boot', 'hibernate'],
    'data scientist':       ['python', 'sql', 'pandas', 'data visualization', 'machine learning'],
    'frontend developer':   ['html', 'css', 'javascript', 'react'],
    'full stack developer': ['html', 'css', 'javascript', 'react', 'node', 'sql'],
    'cloud engineer':       ['linux', 'bash', 'docker', 'kubernetes', 'aws'],
};

/**
 * Phase labels per role.
 */
const PHASE_LABELS = {
    0: { label: 'Phase 1 — Foundation', color: 'amber',   desc: 'Core building blocks you must master first' },
    1: { label: 'Phase 2 — Core Skills', color: 'blue',   desc: 'Role-specific skills that define the job' },
    2: { label: 'Phase 3 — Advanced',    color: 'emerald', desc: 'Specialization skills that make you stand out' },
};

const SKILL_TIME_ESTIMATE = {
    'html': '1 week', 'css': '1–2 weeks', 'javascript': '4–6 weeks', 'typescript': '2–3 weeks',
    'react': '3–4 weeks', 'redux': '1–2 weeks', 'next.js': '2–3 weeks', 'tailwindcss': '1 week',
    'node': '3–4 weeks', 'express': '2 weeks', 'graphql': '2 weeks',
    'java': '6–8 weeks', 'spring boot': '4–6 weeks', 'rest api': '2 weeks', 'hibernate': '2–3 weeks',
    'python': '4–6 weeks', 'pandas': '2–3 weeks', 'data visualization': '2 weeks', 'machine learning': '8–12 weeks',
    'mongodb': '2–3 weeks', 'sql': '3–4 weeks', 'mysql': '2 weeks', 'postgresql': '2 weeks',
    'docker': '2–3 weeks', 'kubernetes': '3–4 weeks', 'aws': '4–6 weeks', 'linux': '2–3 weeks', 'bash': '1–2 weeks',
    'git': '1 week', 'firebase': '1–2 weeks',
};

/**
 * Generate an ordered, phase-based roadmap for missing skills.
 * @param {string[]} missingSkills - normalized lowercase missing skill names
 * @param {string} targetRole - the student's target job role (lowercase)
 * @returns {Array} roadmap phases with steps
 */
const getRoadmap = (missingSkills = [], targetRole = '') => {
    if (missingSkills.length === 0) return [];

    const normalizedRole = targetRole.toLowerCase();
    const priorityOrder = ROLE_SKILL_ORDER[normalizedRole] || [];

    // Sort missingSkills by priority; unlisted skills go last
    const sorted = [...missingSkills].sort((a, b) => {
        const ai = priorityOrder.indexOf(a.toLowerCase());
        const bi = priorityOrder.indexOf(b.toLowerCase());
        const aIdx = ai === -1 ? 999 : ai;
        const bIdx = bi === -1 ? 999 : bi;
        return aIdx - bIdx;
    });

    // Split into 3 phases
    const total = sorted.length;
    const phase1End = Math.ceil(total / 3);
    const phase2End = Math.ceil((2 * total) / 3);

    const phases = [
        sorted.slice(0, phase1End),
        sorted.slice(phase1End, phase2End),
        sorted.slice(phase2End),
    ].filter(p => p.length > 0);

    return phases.map((skills, phaseIdx) => {
        const meta = PHASE_LABELS[phaseIdx] || PHASE_LABELS[2];
        return {
            phase: phaseIdx + 1,
            label: meta.label,
            color: meta.color,
            description: meta.desc,
            steps: skills.map((skill, stepIdx) => {
                const res = LEARNING_RESOURCES[skill] || GENERIC_FALLBACK(skill);
                return {
                    step: stepIdx + 1,
                    skill,
                    timeEstimate: SKILL_TIME_ESTIMATE[skill] || '2–4 weeks',
                    startUrl: res.docs?.[0]?.url || `https://www.google.com/search?q=${encodeURIComponent(skill + ' tutorial')}`,
                    topChannel: res.youtube?.[0] || 'freeCodeCamp',
                    topCourse: res.courses?.[0] || `Search "${skill} course" on Udemy`,
                };
            }),
        };
    });
};

module.exports = { getRecommendations, getRoadmap };

