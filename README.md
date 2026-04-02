# TaskSplit - SOEN 357

TaskSplit is a mobile-first web app that helps students avoid procrastination by automatically breaking large assignments into smaller, actionable steps.

---

## 🔗 Live Prototype

**Try it here:** https://bundle-cable-81591012.figma.site/

⚠️ The prototype is mobile-first. If you're on desktop:
1. Right-click anywhere and look for inspect.
2. Then **Ctrl + Shift + M**
3. View it in mobile mode

---

## 🏗️ Architecture

TaskSplit has two parts:

**Frontend**
- React, TypeScript, Vite, Tailwind CSS v4

**Backend**
- Node.js, Express, Google Gemini 2.5 Flash API (task generation)

---

## ✨ Main Features

TaskSplit is designed using HCI principles to reduce mental overload.

- **AI Task Breakdown:** Upload a syllabus or assignment file (PDF) to generate a step-by-step checklist with time and difficulty estimates.
- **Focus Sessions:** Minimal timer to help users stay consistent while working.
- **Progress Tracking:** Dashboard includes a productivity score, total focus hours, active streak, assignment progress timeline, and a Focus Garden visualization.
- **Session Persistence:** Uses browser `localStorage` (mock database).

---

## 🧪 How to Test the App

### Phase 1 - Generate Tasks
1. Go to **New Task**
2. Enter assignment name and Select due date
4. Upload any PDF
5. Click **Generate Action Plan**
6. Edit steps if needed (remove, delete, etc)
7. Click **Save & Start Working**

### Phase 2 - Focus Session
8. Go to the Dashboard
9. Click **Start Focus Session** under "Up Next"
10. Test the timer: Start, Pause, Stop
11. Click **Done** to simulate completion

### Phase 3 - Workspace Management
12. Open your assignment under "Ongoing Assignments"
13. View the timeline and progress
14. Try editing the title or due date
15. Try deleting the assignment

### Phase 4 - Analytics & Reflection
16. Navigate to the Analytics tab at the bottom of the screen
17. Look at the Overview tab to see your plant grow in the Focus Garden
18. Check your daily stats: Productivity Score, Total Focus time, and Day Streak as well as your recent wins
19. Switch to the History tab to see a record of your fully completed assignments

---

## ⚠️ Known Limitations

- State is saved using `localStorage`. Opening the app in multiple tabs will not sync data automatically.
- Dragging a file outside the drop zone might trigger the browser to open the PDF instead of uploading it.

---

## 💻 Local Setup

The backend requires a **Google Gemini API key**.

### 1. Get API Key
1. Go to: https://aistudio.google.com/
2. Login with Google
3. Click **Get API key** and copy it

### 2. Create `.env` file
Inside the `backend/` folder, create a file named exactly `.env` and add:

```env
GEMINI_API_KEY=your_actual_api_key_here
PORT=3000
```
---

## ▶️ Run the Project

You must run backend and frontend separately


### Start Backend

```
cd backend
npm install
npx nodemon server.js
```


### Start Frontend

```
cd frontend
npm install
npm run dev
```
