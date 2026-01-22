# 🧠 AI Interview Copilot

> **Your real-time, AI-powered wingman for technical interviews.**  
> Ace your coding rounds and behavioral questions with live speech analysis, smart suggestions, and vision capabilities.

![Status](https://img.shields.io/badge/Status-Active-success)
![Stack](https://img.shields.io/badge/Stack-MERN-blue?logo=react)
![AI](https://img.shields.io/badge/AI-Llama%203-purple)

## 🚀 Overview

**AI Interview Copilot** is a sophisticated web application designed to assist candidates during live technical and behavioral interviews. By leveraging the **Web Speech API** for real-time transcription and **Groq's Llama 3** for ultra-fast inference, the application provides instant, context-aware "talk tracks" to help you answer questions confidently.

It goes beyond simple transcription with advanced features like **Holographic Visualization**, **Pacing Audits**, **Emergency Pivot Strategies**, and **Vision Support** for coding challenges.

---

## ✨ Key Features

### 🎙️ Live Assistant Mode
The core of the application, designed to run invisibly alongside your interview call.
-   **Real-time Transcription**: Instantly converts speech to text.
-   **Smart Suggestions**: Generates 3 types of answers in real-time:
    -   *Neutral*: Balanced and direct.
    -   *Confident*: Assertive and leadership-focused.
    -   *Technical*: Deep-dive engineering concepts.
-   **Holographic Visualizer**: Beautiful, non-distracting audio feedback to let you know the AI is listening.

### 🛡️ Advanced "Stealth" Tools
-   **🆘 The Pivot Button**: Stuck on a topic? Click specific "Pivot" options to gracefully change the subject with professional transition sentences.
-   **📸 Vision Analyzer**: Encounter a visual LeetCode problem? Take a screenshot, click the **Vision** button (pastes from clipboard), and get an instant algorithm breakdown.
-   **📜 Resume Teleprompter**: A context-aware side panel that highlights specific projects and skills from your resume as they become relevant to the conversation.
-   **⏱️ Pacing Auditor**: Monitors your speaking speed (WPM) and warns you if you are talking too fast (Orange) or too slow (Red).

### 📊 Post-Interview Analytics
-   **"Game Tape" Summary**: After the session, get a detailed breakdown of your performance.
-   **Stats**: Duration, Word Count, Average Pace.
-   **PDF Export**: Download a transcript and summary of the interview for review.

### ⚡ Mode Switching
-   **Focus Mode**: Collapses the entire UI into a tiny, unobtrusive "Mini Player" that sits on top of your windows, showing only essential cues.
-   **Mock Interview**: A separate mode to practice with an AI interviewer before the real deal.

---

## 🛠️ Technology Stack

**Frontend**
-   **React 18** (Vite)
-   **Tailwind CSS** (Styling & Glassmorphism)
-   **Framer Motion** (Animations & Transitions)
-   **Lucide React** (Icons)
-   **jsPDF** (Report Generation)

**Backend**
-   **Node.js & Express**
-   **Groq SDK** (Inference Engine) (Models: `llama-3.3-70b-versatile`, `llama-3.2-11b-vision-preview`)
-   **MongoDB** (User Data & History persistence)
-   **Multer** (File Handling)

---

## 🚀 Getting Started

### Prerequisites
-   Node.js (v18+)
-   MongoDB (Local or Atlas)
-   Groq API Key (for LLM inference)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/interview-helper.git
    cd interview-helper
    ```

2.  **Server Setup**
    ```bash
    cd server
    npm install
    ```
    Create a `.env` file in the `server` directory:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    GROQ_API_KEY=your_groq_api_key
    ```
    Start the server:
    ```bash
    npm run dev
    ```

3.  **Client Setup**
    Open a new terminal:
    ```bash
    cd client
    npm install
    npm run dev
    ```

4.  **Access the App**
    Open `http://localhost:5173` in your browser (Chrome/Edge recommended for Web Speech API support).

---

## 📖 Usage Guide

1.  **Dashboard**: Upload your Resume (PDF) and Job Description to tailor the AI's context.
2.  **Live Assist**:
    -   Click the **Microphone** to start listening.
    -   Watch suggestions appear in the cards on the right.
    -   Use **Tags** (Neutral/Confident/Technical) to switch answer styles.
    -   **Focus Mode**: Click the expand/collapse icon in the header to minimize the window.
    -   **Vision**: Take a screenshot of a coding problem -> Click the Pink **Vision** button.
    -   **Pivot**: Click the Orange Lifebuoy icon for emergency transitions.
    -   **Resume**: Click the Book icon to open the dynamic resume reference.
3.  **End Session**: Click "End Session" to view your summary and export the PDF.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
