# 🤖 AI Interview Helper

An advanced, AI-powered mock interview platform designed to help developers ace technical and behavioral interviews. Featuring a live code sandbox, voice interaction, and real-time AI feedback.

![Project Preview](https://github.com/developer-yasir/Interview-Helper/raw/main/client/public/preview_placeholder.png)

## 🚀 Key Features

- **🧠 AI Technical Interviewer**: A context-aware chatbot that conducts mock interviews, provides feedback, and analyzes your coding logic.
- **💻 Live Code Sandbox**: Integrated side-by-side JavaScript editor with browser-side execution and a mini-console.
- **✨ AI Snippet Integration**: One-click "Apply to Editor" and "Copy" buttons for all code examples provided by the AI.
- **🌊 Voice Interaction**: Real-time voice-to-text with a dynamic, pulsing CSS waveform for immersive feedback.
- **🎴 Zen Mode**: Collapsible editor for a focused, chat-first experience during behavioral rounds.
- **🔒 Secure Workspace**: JWT-based authentication and persistent interview history stored in MongoDB.
- **💎 Premium UI**: A modern, sleek interface built with Tailwind CSS, Framer Motion, and Glassmorphism effects.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Lucide React.
- **Backend**: Node.js, Express.
- **Database**: MongoDB (Mongoose).
- **AI Integration**: Custom prompt engineering with side-by-side context sharing.
- **Tools**: React-Markdown, @tailwindcss/typography.

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/developer-yasir/Interview-Helper.git
cd Interview-Helper
```

### 2. Server Setup
```bash
cd server
npm install
```
- Create a `.env` file in the `server` directory.
- Add your variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```
- Seed the database:
```bash
node seed.js
```
- Start the server:
```bash
npm start # or npx nodemon index.js
```

### 3. Client Setup
```bash
cd ../client
npm install
npm run dev
```

## 📸 Interface Sneak Peek

- **Practice Mode**: 40/60 split between AI chat and technical sandbox.
- **Interview Mastery**: Dashboard for tracking past performances and feedback.
- **Smart Profile**: Personalized experience based on your target role and tech stack.

## 🤝 Contributing

Feel free to fork this project and submit PRs! We're always looking to improve the AI's logic and the sandbox features.

---
Built with ❤️ by [developer-yasir](https://github.com/developer-yasir)
