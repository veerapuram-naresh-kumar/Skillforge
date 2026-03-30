/**
 * Frontend mirror of backend learningResources.js
 * Used for instant client-side recommendations when switching roles.
 */

const LEARNING_RESOURCES = {
    'react': {
        youtube: ['Codevolution', 'freeCodeCamp', 'Traversy Media', 'Jack Herrington'],
        courses: ['React - The Complete Guide (Udemy)', 'Frontend Masters React Path', 'The Odin Project'],
        docs: [{ label: 'react.dev (Official)', url: 'https://react.dev' }],
        revisionTopics: ['Functional Components & Hooks', 'State Management (Redux/Context)', 'Props & Proptypes', 'React Router', 'Component Life-cycle', 'Virtual DOM & Reconciliation'],
        practiceProjects: [
            { title: 'Task Manager Dashboard', desc: 'Build a CRUD app with state management, filtering, and local storage.' },
            { title: 'Movie Browser API Wrapper', desc: 'Use TMDB API to search and view movie details with infinite scroll.' }
        ]
    },
    'html': {
        youtube: ['Kevin Powell', 'freeCodeCamp', 'Traversy Media'],
        courses: ['The Web Developer Bootcamp (Udemy)', 'HTML & CSS Full Course – freeCodeCamp'],
        docs: [{ label: 'MDN HTML Reference', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' }],
        revisionTopics: ['Semantic HTML5 Tags', 'Forms & Validations', 'Head Metadata', 'Audio & Video Media', 'SVG & Canvas Essentials'],
        practiceProjects: [{ title: 'Personal Portfolio Page', desc: 'A semantic-rich documentation of your skills.' }]
    },
    'css': {
        youtube: ['Kevin Powell', 'freeCodeCamp', 'Traversy Media'],
        courses: ['CSS - The Complete Guide (Udemy)', 'CSS Grid & Flexbox for Responsive Layouts'],
        docs: [{ label: 'MDN CSS Reference', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS' }],
        revisionTopics: ['Box Model & Positioning', 'Flexbox & CSS Grid', 'Responsive Design (Media Queries)', 'CSS Variables & Themes', 'Transitions & Keyframe Animations'],
        practiceProjects: [{ title: 'Layout Templates', desc: 'Build a complex multi-column dashboard layout using CSS Grid.' }]
    },
    'javascript': {
        youtube: ['Fireship', 'Traversy Media', 'Akshay Saini', 'freeCodeCamp'],
        courses: ['JavaScript: The Complete Guide (Udemy)', 'JavaScript30 – Wes Bos (Free)', 'Eloquent JavaScript (Free Book)'],
        docs: [{ label: 'MDN JavaScript Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' }],
        revisionTopics: ['ES6+ Features (Arrow Functions, Destructuring)', 'Closures & Scope', 'Asynchronous JS (Promises, Async/Await)', 'DOM Manipulation', 'Event Loop & Concurrency', 'Prototypes & Classes'],
        practiceProjects: [
            { title: 'Interactive Weather Bot', desc: 'Fetch API and update the DOM in real-time with fetch/axios.' },
            { title: 'Memory Game Logic', desc: 'Implement game state and logic using closures.' }
        ]
    },
    'node': {
        youtube: ['Net Ninja', 'Academind', 'Traversy Media'],
        courses: ['Node.js - The Complete Guide (Udemy)', 'The Complete Node Bootcamp'],
        docs: [{ label: 'Node.js Official Docs', url: 'https://nodejs.org/en/docs' }],
        revisionTopics: ['Modules & Require System', 'File System Operations', 'Streams & Buffers', 'Event Emitters', 'Child Processes', 'Global Objects & Process'],
        practiceProjects: [{ title: 'CLI Notes Taker', desc: 'Build a tool that works in terminal to save/read snippets.' }]
    },
    'express': {
        youtube: ['Net Ninja', 'Traversy Media', 'Academind'],
        courses: ['Node.js with Express - Complete Course (Udemy)'],
        docs: [{ label: 'Express.js Official Docs', url: 'https://expressjs.com/' }],
        revisionTopics: ['Routing & Parameters', 'Middleware Functions', 'Error Handling Middleware', 'View Engines (EJS/Pug)', 'Express Router Structure', 'Request/Response Objects'],
        practiceProjects: [{ title: 'RESTful E-commerce Backend', desc: 'A server with category and product endpoints.' }]
    },
    'java': {
        youtube: ['Telusko', 'Kunal Kushwaha', 'freeCodeCamp'],
        courses: ['Java Masterclass (Udemy)', 'NPTEL Java Programming'],
        docs: [{ label: 'Oracle Java Docs', url: 'https://docs.oracle.com/en/java/' }],
        revisionTopics: ['OOP Concepts (Inheritance, Polymorphism)', 'Exception Handling', 'Collections Framework', 'Multithreading & Concurrency', 'Lambda Expressions & Streams', 'JDBC & DB Connectivity'],
        practiceProjects: [{ title: 'Library Management System', desc: 'Implement collections for storing/searching users and books.' }]
    },
    'spring boot': {
        youtube: ['Amigoscode', 'Daily Code Buffer', 'Java Brains'],
        courses: ['Spring Boot & Spring Framework – Chad Darby (Udemy)', 'Spring Boot Full Course – freeCodeCamp'],
        docs: [{ label: 'Spring Boot Official Docs', url: 'https://docs.spring.io/spring-boot/docs/current/reference/html/' }],
        revisionTopics: ['Inversion of Control (IoC) & DI', 'Spring Initializr & Starters', 'Spring MVC & REST Controllers', 'Spring Data JPA', 'Spring Security Fundamentals', 'Actuator & Monitoring'],
        practiceProjects: [{ title: 'Inventory API', desc: 'PostgreSQL integrated RESTful service with JWT auth.' }]
    },
    'python': {
        youtube: ['Corey Schafer', 'Tech With Tim', 'freeCodeCamp'],
        courses: ['100 Days of Code: Python (Udemy)', 'Python for Everybody – Coursera'],
        docs: [{ label: 'Python Official Docs', url: 'https://docs.python.org/3/' }],
        revisionTopics: ['List Comprehensions & Tuples', 'Decorators & Generators', 'Object Oriented Python', 'File I/O & Exception Handling', 'Virtual Environments (venv/pip)', 'Standard Libraries'],
        practiceProjects: [{ title: 'Data Scraper', desc: 'Scrape stock prices and save to various formats.' }]
    },
    'rest api': {
        youtube: ['Traversy Media', 'Academind', 'freeCodeCamp'],
        courses: ['REST API Design - Udemy', 'APIs and Web Services – Coursera'],
        docs: [{ label: 'REST API Best Practices – MDN', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Introduction' }],
        revisionTopics: ['HTTP Methods (GET, POST, etc.)', 'Status Codes & Meaning', 'JWT & OAuth Authentication', 'CORS & Security', 'Pagination & Filtering Systems', 'Documentation with Swagger/OpenAPI'],
        practiceProjects: [{ title: 'Blogging API', desc: 'Secure API with multi-user permissions.' }]
    },
    'mongodb': {
        youtube: ['Net Ninja', 'Traversy Media', 'freeCodeCamp'],
        courses: ['MongoDB - The Complete Developer Guide (Udemy)'],
        docs: [{ label: 'MongoDB Official Docs', url: 'https://www.mongodb.com/docs/' }],
        revisionTopics: ['BSON Document Structure', 'CRUD Operations', 'Aggregation Pipeline', 'Indexes & Performance', 'Data Modeling (Embedded vs Reference)', 'Atlas Cloud Setup'],
        practiceProjects: [{ title: 'NoSQL Data Model for Chat App', desc: 'Design the schema for rooms/messages/users.' }]
    },
    'sql': {
        youtube: ['Kudvenkat', 'freeCodeCamp', 'Tech TFQ'],
        courses: ['The Complete SQL Bootcamp (Udemy)', 'SQL for Data Science – Coursera'],
        docs: [{ label: 'W3Schools SQL', url: 'https://www.w3schools.com/sql/' }],
        revisionTopics: ['Select & Joins (Inner, Left, etc.)', 'Group By & Aggregations', 'Subqueries & CTEs', 'Stored Procedures & Functions', 'Database Normalization', 'Transactions & ACID Properties'],
        practiceProjects: [{ title: 'Sales Analytics DB', desc: 'Writing complex queries to find year-over-year revenue.' }]
    },
    'dsa': {
        youtube: ['Striver (takeUforward)', 'Kunal Kushwaha', 'Abdul Bari', 'NeetCode'],
        courses: ['DSA Masterclass (Udemy)', 'NeetCode 150 (Free – YouTube)'],
        docs: [{ label: 'LeetCode Explore', url: 'https://leetcode.com/explore/' }],
        revisionTopics: ['Arrays, Strings & Linked Lists', 'Stacks, Queues & Hashing', 'Trees & Graph Algorithms', 'Dynamic Programming (DP)', 'Sort & Search Algorithms', 'Recursion & Backtracking Patterns'],
        practiceProjects: [{ title: 'LeetCode Path', desc: 'Solve the top 50 interviewed questions on LeetCode/GFG.' }]
    },
};

const GENERIC_FALLBACK = (skill) => ({
    youtube: ['freeCodeCamp'],
    courses: [`Search "${skill} full course" on Udemy or Coursera`],
    docs: [{ label: `Google: ${skill} documentation`, url: `https://www.google.com/search?q=${encodeURIComponent(skill + ' official documentation')}` }],
    revisionTopics: [`Core Concepts of ${skill}`, `Best Practices in ${skill}`, `Advanced Use-cases`, `Standard libraries of ${skill}`],
    practiceProjects: [{ title: `${skill} Foundation Project`, desc: `Build a small application that uses at least 3 core features of ${skill}.` }]
});


const ROLE_SKILL_ORDER = {
    'mern developer':       ['javascript', 'html', 'css', 'react', 'node', 'express', 'mongodb'],
    'java backend':         ['java', 'sql', 'rest api', 'spring boot', 'hibernate'],
    'data scientist':       ['python', 'sql', 'pandas', 'data visualization', 'machine learning'],
    'frontend developer':   ['html', 'css', 'javascript', 'react'],
    'full stack developer': ['html', 'css', 'javascript', 'react', 'node', 'sql'],
    'cloud engineer':       ['linux', 'bash', 'docker', 'kubernetes', 'aws'],
};

const SKILL_TIME_ESTIMATE = {
    'html': '1 week', 'css': '1–2 weeks', 'javascript': '4–6 weeks', 'typescript': '2–3 weeks',
    'react': '3–4 weeks', 'node': '3–4 weeks', 'express': '2 weeks',
    'java': '6–8 weeks', 'spring boot': '4–6 weeks', 'rest api': '2 weeks', 'hibernate': '2–3 weeks',
    'python': '4–6 weeks', 'pandas': '2–3 weeks', 'data visualization': '2 weeks', 'machine learning': '8–12 weeks',
    'mongodb': '2–3 weeks', 'sql': '3–4 weeks',
    'docker': '2–3 weeks', 'kubernetes': '3–4 weeks', 'aws': '4–6 weeks', 'linux': '2–3 weeks', 'bash': '1–2 weeks',
};

const PHASE_LABELS = {
    0: { label: 'Phase 1 — Foundation', color: 'amber',   desc: 'Core building blocks you must master first' },
    1: { label: 'Phase 2 — Core Skills', color: 'blue',   desc: 'Role-specific skills that define the job' },
    2: { label: 'Phase 3 — Advanced',    color: 'emerald', desc: 'Specialization skills that make you stand out' },
};

export const getRecommendations = (missingSkills = []) => {
    return missingSkills.map((skill) => {
        const n = skill.toLowerCase().trim();
        const res = LEARNING_RESOURCES[n] || GENERIC_FALLBACK(n);
        return { 
            skill: n, 
            youtube: res.youtube, 
            courses: res.courses, 
            docs: res.docs,
            revisionTopics: res.revisionTopics,
            practiceProjects: res.practiceProjects
        };
    });
};

export const getRoadmap = (missingSkills = [], targetRole = '') => {
    if (missingSkills.length === 0) return [];

    const normalizedRole = targetRole.toLowerCase();
    const priorityOrder = ROLE_SKILL_ORDER[normalizedRole] || [];

    const sorted = [...missingSkills].sort((a, b) => {
        const ai = priorityOrder.indexOf(a.toLowerCase());
        const bi = priorityOrder.indexOf(b.toLowerCase());
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });

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

export const getSingleSkillRoadmap = (skill) => {
    const s = skill.toLowerCase().trim();
    // If it is a role, use getRoadmap
    if (ROLE_SKILL_ORDER[s]) return getRoadmap(ROLE_SKILL_ORDER[s], s);
    
    // Otherwise it is a single skill
    const res = LEARNING_RESOURCES[s] || GENERIC_FALLBACK(s);
    return [{
        phase: 1,
        label: `${s.toUpperCase()} Specialization`,
        color: 'indigo',
        description: `Complete end-to-end mastery of ${s}`,
        steps: [{
            step: 1,
            skill: s,
            timeEstimate: SKILL_TIME_ESTIMATE[s] || '3–4 weeks',
            startUrl: res.docs?.[0]?.url || `https://www.google.com/search?q=${encodeURIComponent(s + ' tutorial')}`,
            topChannel: res.youtube?.[0] || 'freeCodeCamp',
            topCourse: res.courses?.[0] || `Search "${s} course" on Udemy`,
        }]
    }];
};
