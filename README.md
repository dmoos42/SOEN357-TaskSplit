# TaskSplit - SOEN 357 Prototype

This repository provides the full-stack prototype for TaskSplit, a mobile-first web application designed to help university students overcome procrastination by automatically decomposing large assignments into structured, actionable checklists. 

Currently, the project architecture is divided into two main environments:

- **Frontend:** A React application using TypeScript, Vite, and Tailwind CSS v4.
- **Backend:** A Node.js and Express server that interfaces natively with the Google Gemini 2.5 Flash API for AI task generation.

## Core Features

TaskSplit is built with Human-Computer Interaction (HCI) principles in mind to reduce mental overload:

- **AI Task Breakdown:** Upload a syllabus (PDF/DOCX/TXT) to automatically generate step-by-step checklists with difficulty and time estimates.
- **Focus Sessions:** Built-in minimalist timer designed to encourage consistent progress.
- **Progress Tracking & Analytics:** A comprehensive dashboard featuring a visual "Focus Garden" that grows as you complete steps. It tracks detailed user metrics including your overall Productivity Score, total hours spent focusing, active day streaks, and a historical log of completed tasks and assignments.
- **Session Persistence:** Uses browser `localStorage` to mock database persistence.

## Environment Setup

The backend requires a free Google Gemini API key to parse documents and generate task lists. If you are setting up this project for development or testing, you must obtain a key and create an environment variable file in the backend directory.

### How to get your free Gemini API Key:
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click on **"Get API key"** in the left navigation menu, find the key and copy it.

Once you have your key, create a file named exactly `.env` inside the `backend` folder and add the following:

```env
# backend/.env
GEMINI_API_KEY=your_actual_api_key_here
PORT=3000
```
## Running the code

Because this is a full-stack application, you need to run the frontend and backend in two separate terminal windows. 

### 1. Start the Backend (AI Engine)
Open your first terminal and navigate to the backend folder:

```bash
cd backend
npm install
npx nodemon server.js
```

### 2. Start the Frontend (UI)
Open a second terminal, navigate to the frontend folder, and start the Vite development server:

```bash
cd frontend
npm install
npm run dev
```

## High-Fidelity UI Design

This codebase implements the High-Fidelity UI Design for our SOEN 357 project. The original wireframes and mockups are available at https://www.figma.com/design/r9ozETzu34K49sVcY9wSZb/High-Fidelity-UI-Design.
