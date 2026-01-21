const questions = [
    // React
    {
        id: 1,
        topic: 'React',
        difficulty: 'Intermediate',
        question: 'Why is Vite significantly faster than Create React App (CRA)?',
        answer: 'Vite uses native ES Modules (ESM) during development to serve code on demand, bypassing the need to bundle the entire application before starting. CRA uses Webpack, which bundles the entire app first. Vite also uses esbuild (written in Go) for pre-bundling dependencies, which is 10-100x faster than JavaScript-based bundlers.'
    },
    {
        id: 2,
        topic: 'React',
        difficulty: 'Beginner',
        question: 'What is the Virtual DOM and how does it improve performance?',
        answer: 'The Virtual DOM is a lightweight copy of the actual DOM in memory. When state changes, React updates the Virtual DOM first, compares it with the previous version (diffing), and then efficiently updates only the changed elements in the real DOM (reconciliation). This minimizes expensive direct DOM manipulations.'
    },
    {
        id: 3,
        topic: 'React',
        difficulty: 'Advanced',
        question: 'Explain the useEffect dependency array and common pitfalls.',
        answer: 'The dependency array controls when the effect runs. If empty `[]`, it runs once on mount. If omitted, it runs on every render. If it contains values `[prop, state]`, it runs when those values change. A common pitfall is omitting variables used inside the effect, leading to stale closures or missing updates. Another is using objects/arrays without memoization, causing infinite loops.'
    },

    // Node.js
    {
        id: 4,
        topic: 'Node.js',
        difficulty: 'Intermediate',
        question: 'What is the Event Loop in Node.js?',
        answer: 'The Event Loop is the mechanism that allows Node.js to perform non-blocking I/O operations despite being single-threaded. It offloads operations to the system kernel whenever possible. It constantly checks the Call Stack and the Callback Queue. If the Call Stack is empty, it pushes the first event from the Queue to the Stack for execution.'
    },
    {
        id: 5,
        topic: 'Node.js',
        difficulty: 'Beginner',
        question: 'Difference between `process.nextTick()` and `setImmediate()`?',
        answer: '`process.nextTick()` fires immediately on the same phase of the event loop, before the IO-cycle. `setImmediate()` fires on the following iteration or "tick" of the event loop (check phase). Essentially, `nextTick` has higher priority and runs before `setImmediate`.'
    },

    // Express
    {
        id: 6,
        topic: 'Express',
        difficulty: 'Intermediate',
        question: 'What is middleware in Express?',
        answer: 'Middleware functions are functions that have access to the request object (req), the response object (res), and the next middleware function in the application’s request-response cycle. They can execute code, modify req/res objects, end the request-response cycle, or call `next()` to pass control to the next middleware.'
    },

    // MongoDB
    {
        id: 7,
        topic: 'MongoDB',
        difficulty: 'Intermediate',
        question: 'Difference between SQL and NoSQL databases?',
        answer: 'SQL databases are relational, table-based, and have a rigid schema (e.g., MySQL, PostgreSQL). NoSQL databases (like MongoDB) are non-relational, document/key-value/graph-based, and have dynamic schemas. NoSQL is often chosen for flexibility, scalability, and handling large volumes of unstructured data.'
    },
    {
        id: 8,
        topic: 'MongoDB',
        difficulty: 'Advanced',
        question: 'What is Aggregation Pipeline in MongoDB?',
        answer: 'The aggregation pipeline is a framework for data aggregation modeled on the concept of data processing pipelines. Documents enter a multi-stage pipeline that transforms the documents into aggregated results. Common stages include `$match` (filter), `$group` (summarize), `$project` (reshape), and `$sort`.'
    },

    // Behavioral (New Category)
    {
        id: 9,
        topic: 'Behavioral',
        difficulty: 'General',
        question: 'Tell me about a time you failed. What did you learn?',
        answer: 'Focus on a genuine failure, not a disguised strength. Explain the situation clearly, accept responsibility without blaming others, and most importantly, detail the specific lessons learned and how you applied them to future situations to improve.'
    },
    {
        id: 10,
        topic: 'Behavioral',
        difficulty: 'General',
        question: 'How do you handle disagreement with a team member?',
        answer: 'Emphasize communication and empathy. Explain that you would listen actively to understand their perspective, present your viewpoint using data or logic, and look for a compromise that benefits the project. It shows maturity and collaboration skills.'
    }
];

module.exports = questions;
