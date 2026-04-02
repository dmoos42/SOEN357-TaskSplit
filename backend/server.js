const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Keep uploaded files in RAM instead of saving them to disk 
const upload = multer({ storage: multer.memoryStorage() });

// Set up Gemini with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/generate-plan', upload.single('file'), async (req, res) => {
    try {
        const { taskName } = req.body;
        
        // Tell the AI exactly how we want the data formatted
       let promptParts = [
            `You are the backend engine for "TaskSplit", an app designed to help university students overcome procrastination by breaking down large assignments.
            
            Assignment Name: ${taskName}
            
            Create an actionable, step-by-step plan based on the attached document (if any) or the assignment name. Return ONLY a JSON array of objects. 
            Each object MUST have exactly these four keys:
            - "name": A clear, concise action step (string).
            - "difficulty": Must be exactly "Easy", "Medium", or "Hard".
            - "estimatedMinutes": A realistic time estimate in minutes (number, e.g., 15, 30, 45).
            - "microSteps": An array of 3 to 4 short strings. These should be bite-sized, concrete actions that break this specific step down even further.
            
            Keep steps small to build momentum (Hick's Law). Total steps should be between 4 and 8.`
        ];

        // If user uploads a pdf, convert it so Gemini can read it
        if (req.file) {
            promptParts.push({
                inlineData: {
                    data: req.file.buffer.toString("base64"),
                    mimeType: req.file.mimetype 
                }
            });
        }

        // Force Gemini to reply in strict JSON format so our frontend doesn't break
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        // Make the request
        const result = await model.generateContent(promptParts);
        const responseText = result.response.text();
        
        // Turn the JSON string into a JS object and send it to the frontend
        const subTasks = JSON.parse(responseText);
        res.json(subTasks);

    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ error: "Failed to generate action plan. Please try again." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TaskSplit Backend running on http://localhost:${PORT}`));