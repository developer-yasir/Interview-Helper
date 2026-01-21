const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const Groq = require('groq-sdk');

const upload = multer({ dest: 'uploads/' });

// Initialize Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

router.post('/cv', upload.single('cv'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdfParse(dataBuffer);
        const text = data.text;

        // Construct the prompt for AI
        const prompt = `
            You are an expert resume parser. Your task is to extract structured data from the resume text provided below.
            
            CRITICAL INSTRUCTIONS:
            1. **Full Name**: Look for the name at the very top of the document.
            2. **Job Title**: Extract the current job title or desired position (often near the name or in summary).
            3. **Email & Phone**: Extract standard formats.
            4. **Social Links**: Extract LinkedIn, GitHub, and Portfolio URLs if present.
            5. **Bio**: If a "Summary" or "Objective" section exists, use that. IF NOT, generate a 2-3 sentence professional summary.
            6. **Skills**: specific technical skills. Return as array of strings.
            7. **Experience**: Extract job history.
            8. **Education**: Extract Degree, School/University, and Year.
            
            Return ONLY valid JSON in the following format:
            {
                "name": "string",
                "jobTitle": "string",
                "email": "string",
                "phone": "string",
                "socialLinks": {
                    "linkedin": "string",
                    "github": "string",
                    "portfolio": "string"
                },
                "bio": "string",
                "skills": ["skill1", "skill2"],
                "experience": [
                    { "role": "string", "company": "string", "duration": "string", "description": "string" }
                ],
                "education": [
                    { "degree": "string", "school": "string", "year": "string" }
                ]
            }

            Resume Text:
            ${text.substring(0, 15000)} 
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that extracts structured data from resumes in JSON format."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const jsonResponse = JSON.parse(completion.choices[0].message.content);

        // Clean up
        fs.unlinkSync(req.file.path);

        res.json(jsonResponse);

    } catch (error) {
        console.error("Error parsing resume:", error);
        // Clean up file if error occurs
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Failed to parse PDF using AI', error: error.message });
    }
});

module.exports = router;
