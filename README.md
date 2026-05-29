# Student.AI - Fullstack AI-Powered Student Study Assistant

Welcome to **Student.AI**, a professional, highly polished academic preparation platform designed to help school and university students ace local exams, master difficult topics, and build robust long-term revision habits.

This project delivers a **fullstack architecture** following premium visual guidelines:

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, and Framer Motion animations.
- **Node.js/Express Backend:** Native workspace proxy handler to run secure Google Gemini queries.
- **Python Flask Backend:** High-fidelity, student-friendly Flask API designed for direct local running or exports!

---

## 📂 Project Structure

```text
student-study-assistant/
│
├── frontend/               # React + TypeScript + Vite Interface
│   ├── src/
│   │   ├── components/     # Modular, reusable visual modules
│   │   │   ├── DashboardHome.tsx      # Goals tracker, streak metrics & Pomodoro study timer
│   │   │   ├── Navbar.tsx             # Responsive glassmorphism menu bar & toggles
│   │   │   ├── QuestionGenerator.tsx  # Interactive syllabus card builder
│   │   │   ├── NotesGenerator.tsx     # PDF notes generator with key vocabulary
│   │   │   ├── Summarizer.tsx         # Mnemonics acronym builder & textbook condenser
│   │   │   └── MindMap.tsx            # Tree-based conceptual connection graph mapper
│   │   ├── types.ts                   # Unified type validation indexes
│   │   ├── App.tsx                    # Main reactive orchestrator component
│   │   ├── main.tsx                   # DOM container mount point
│   │   └── index.css                  # Tailwinds CSS global directives
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                # Python Flask Backend Codebase
│   ├── app.py              # Flask server and CORS controller app
│   ├── requirements.txt    # Standard Python PIP requirements manifests
│   └── routes/             # Blueprint registers
```

---

## 🚀 Getting Started

### Method A: Running Locally with Python Flask Backend

#### 1. Setup the Python Flask Backend
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a fast virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```
3. Install standard requirements:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the Python API server:
   ```bash
   python app.py
   ```
   *The Flask backend is now active at `http://localhost:5000` !*

#### 2. Run the React Frontend
1. Return to the root folder (or moving into the frontend folder):
   ```bash
   npm install
   ```
2. Start the Vite development workspace:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:3000` to interact with your local Student.AI app!*

---

## ✨ Features Mastered

1. **Important Exam Questions Generator**: Creates realistic syllabus reviews graded by difficulty ("Easy", "Medium", "Hard") with visual checkbox lists of core concepts to cross off and expandable scoring matrices containing structure outlines.
2. **Textbook Summarizer & Memory Hook Creator**: Condenses high-density reading excerpts into actionable bullet points, terminology lookups, and auto-generates catchy mnemonic acronym memory devices.
3. **Exam-Oriented Notes Generator**: Automatically extracts formula guidelines, structural summaries, and warns the student about common professor traps. Supports **direct PDF and Print downloads**!
4. **Visual Mind Map Creator**: Spatial concepts alignment chart showing visual connection trees.
5. **Motivational Dashboard & Productivity Section**: Features daily quote rotators, active streak registers, trophy alerts, goal checklist managers with persistent local storage, and a **Pomodoro timer with Audio alerts**!

---

## 📝 Technologies Utilized

- **Frontend:** React 18, Vite, Type-safe TypeScript descriptors, Tailwind CSS (Utility classes), Far-sighted Framer Motion animations, Lucide Icons.
- **Backend Options:** Express server (active Dev Workspace layer proxying Gemini AI queries securely) + Python Flask microservices layer.
