const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const auth = require('../middleware/auth');
const InterviewSession = require('../models/InterviewSession');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// @route   POST api/interview/chat
// @desc    Generate AI response for chat session
// @access  Private
router.post('/chat', auth, async (req, res) => {
    try {
        const { messages, userProfile, config } = req.body;

        let systemPrompt = '';

        if (config?.mode === 'job' && config?.selectedJob) {
            // JOB INTERVIEW PROMPT
            const job = config.selectedJob;
            systemPrompt = `
                You are the Hiring Manager at **${job.company}** interviewing a candidate for the **${job.position}** role.
                Your goal is to assess if the candidate is a good fit for this specific position.

                Job Context:
                Company: ${job.company}
                Position: ${job.position}
                Job Notes/Description: ${job.notes || 'N/A'}

                Candidate Context:
                Name: ${userProfile?.name || 'Candidate'}
                Current Role: ${userProfile?.jobTitle || 'Software Engineer'}
                Skills: ${userProfile?.skills?.join(', ') || 'N/A'}
                Experience: ${JSON.stringify(userProfile?.experience || [])}

                Guidelines:
                1. Act strictly as the Hiring Manager for ${job.company}. Be professional but conversational.
                2. Focus questions on the requirements for a ${job.position}.
                3. Ask about their experience and how it relates to this role.
                4. Keep responses concise (under 150 words).
                5. Do NOT mention you are an AI. You are a real person at ${job.company}.
                6. Start by introducing yourself and asking them to introduce themselves.
            `;
        } else {
            // MOCK INTERVIEW PROMPT
            const currentCode = req.body.config?.currentCode;

            systemPrompt = `
                You are an expert ${config?.type || 'Technical'} Interviewer. 
                Your goal is to conduct a professional mock interview with the candidate.

                Candidate Context:
                Name: ${userProfile?.name || 'Candidate'}
                Role: ${userProfile?.jobTitle || 'Software Engineer'}
                Skills: ${userProfile?.skills?.join(', ') || 'General'}
                Experience: ${JSON.stringify(userProfile?.experience || [])}

                Interview Configuration:
                Type: ${config?.type || 'Technical'}
                Difficulty: ${config?.difficulty || 'Medium'}

                ${config?.type === 'Technical' ? `
                TECHNICAL MODE GUIDELINES:
                1. You have access to a side-by-side code editor context. Use it but do NOT repeat the entire code block back to the user unless showing a specific fix.
                2. START by asking what topic/stack they want to practice.
                3. Once a topic is chosen, PROVIDE a clear coding problem.
                4. CONTEXT ONLY (Do not repeat this verbatim): 
                   Candidate's code: ${currentCode || '// Empty'}
                5. Formatting: Use proper Markdown with newlines. Code blocks should be on new lines.
                6. Evaluation: Analyze logic and Time/Space complexity ($O(n)$).
                7. Interaction: Be concise. If the candidate is stuck, provide a small hint.
                ` : `
                GENERAL MODE GUIDELINES:
                1. Ask one relevant question at a time.
                2. Use Markdown for formatting.
                3. If the user answers, evaluate it briefly and then ask the follow-up.
                4. INITIAL SETUP: Ask for their target Role/Stack if not known.
                `}

                CRITICAL: Use proper Markdown with line breaks for readability. Do not output the "Current state of the editor" as a heading.
            `;
        }

        const conversation = [
            { role: 'system', content: systemPrompt },
            ...messages
        ];

        const completion = await groq.chat.completions.create({
            messages: conversation,
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 1024
        });

        const aiResponse = completion.choices[0].message.content;
        res.json({ message: aiResponse });

    } catch (error) {
        console.error("Error in interview chat:", error);
        res.status(500).json({ message: 'Failed to generate response', error: error.message });
    }
});

// @route   POST api/interview/suggest
// @desc    Generate real-time answer suggestions
// @access  Private
router.post('/suggest', auth, async (req, res) => {
    try {
        const { transcript } = req.body;

        const systemPrompt = `
            You are an expert Interview Coach providing real-time assistance.
            The candidate is in a live interview and needs quick, short, concise answer suggestions based on what is being discussed.
            
            Current Transcript: "${transcript}"
            
            Task:
            Provide 3 distinct short answer suggestions.
            
            Output Format (JSON strictly):
            {
                "neutral": "A balanced, safe answer...",
                "confident": "A strong, results-oriented answer...",
                "technical": "A deep, detailed technical answer..."
            }
            
            Keep answers under 2 sentences. Return ONLY valid JSON.
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: "Generate suggestions." }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.6,
            max_tokens: 500,
            response_format: { type: "json_object" }
        });

        const suggestions = JSON.parse(completion.choices[0].message.content);
        res.json(suggestions);

    } catch (error) {
        console.error("Error generating suggestions:", error);
        res.status(500).json({
            neutral: "Could not generate suggestions.",
            confident: "Please check connection.",
            technical: "Error: " + error.message
        });
    }
});

// @route   POST api/interview/save
// @desc    Save an interview session with feedback and score
// @access  Private
router.post('/save', auth, async (req, res) => {
    try {
        const { type, difficulty, messages } = req.body;

        if (!messages || messages.length < 2) {
            return res.status(400).json({ message: "Not enough conversation to evaluate." });
        }

        // Use AI to generate feedback and score
        const evaluationPrompt = `
            You are an expert Interview Coach. Analyze the following interview transcript and provide a brief summary of performance, areas for improvement, and a numerical score (0-100).
            
            Transcript:
            ${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}
            
            Output Format (JSON strictly):
            {
                "feedback": "Concise summary and tips...",
                "score": 85
            }
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'system', content: evaluationPrompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 500,
            response_format: { type: "json_object" }
        });

        const evaluation = JSON.parse(completion.choices[0].message.content);

        const newSession = new InterviewSession({
            user: req.user.id,
            type,
            difficulty,
            messages,
            feedback: evaluation.feedback,
            score: evaluation.score
        });

        const savedSession = await newSession.save();
        res.json(savedSession);

    } catch (error) {
        console.error("Error saving interview session:", error);
        res.status(500).json({ message: 'Server error while saving session' });
    }
});

// @route   GET api/interview/sessions
// @desc    Get all interview sessions for the logged in user
// @access  Private
router.get('/sessions', auth, async (req, res) => {
    try {
        const sessions = await InterviewSession.find({ user: req.user.id }).sort({ date: -1 });
        res.json(sessions);
    } catch (error) {
        console.error("Error fetching sessions:", error);
        res.status(500).json({ message: 'Server error while fetching sessions' });
    }
});

module.exports = router;
