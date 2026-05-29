import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, HelpCircle, FileText, Brain, LayoutDashboard, Search, Sparkles, Sliders, Moon, Sun, Download, Trash2, ArrowRight, CornerDownRight, CheckCircle2, ChevronRight, RefreshCw, AlertCircle, Clock
} from "lucide-react";
import DashboardHome from "./components/DashboardHome";
import { ActiveTab, QuestionsResponse, NotesResponse, SummaryResponse, MindMapResponse } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiHasKey, setApiHasKey] = useState<boolean>(true);

  // Input states for each tool
  const [questionsInput, setQuestionsInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [summaryInput, setSummaryInput] = useState("");
  const [mindmapInput, setMindmapInput] = useState("");

  // Loading states
  const [loading, setLoading] = useState<boolean>(false);
  const [currentStatusMsg, setCurrentStatusMsg] = useState("");

  // Generator outputs
  const [questionsResult, setQuestionsResult] = useState<QuestionsResponse | null>(null);
  const [notesResult, setNotesResult] = useState<NotesResponse | null>(null);
  const [summaryResult, setSummaryResult] = useState<SummaryResponse | null>(null);
  const [mindmapResult, setMindmapResult] = useState<MindMapResponse | null>(null);

  // Study log/history storage for the search bar
  const [searchHistory, setSearchHistory] = useState<Array<{ id: string; tab: ActiveTab; topic: string; date: string }>>([]);

  // Check API availability and load theme + history
  useEffect(() => {
    fetch("/api/status")
      .then(r => r.json())
      .then(data => {
        if (data && typeof data.hasApiKey === "boolean") {
          setApiHasKey(data.hasApiKey);
        }
      })
      .catch(err => console.error("Error reading backend status:", err));

    const savedTheme = localStorage.getItem("student_dark_mode");
    if (savedTheme === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    const savedHistory = localStorage.getItem("student_study_history");
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const nextVal = !darkMode;
    setDarkMode(nextVal);
    if (nextVal) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("student_dark_mode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("student_dark_mode", "false");
    }
  };

  // Helper to add item to history
  const addToHistory = (tab: ActiveTab, topic: string) => {
    const cleanTopic = topic.trim();
    if (!cleanTopic) return;
    const newItem = {
      id: Date.now().toString(),
      tab,
      topic: cleanTopic.length > 40 ? cleanTopic.substring(0, 40) + "..." : cleanTopic,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [newItem, ...searchHistory.slice(0, 19)];
    setSearchHistory(updated);
    localStorage.setItem("student_study_history", JSON.stringify(updated));
  };

  // Clear history
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("student_study_history");
  };

  // 1. Questions API trigger
  const handleGenerateQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionsInput.trim()) return;
    setLoading(true);
    setCurrentStatusMsg("Analyzing high-stress syllabus patterns...");
    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: questionsInput })
      });
      const data = await response.json();
      setQuestionsResult(data);
      addToHistory("questions", questionsInput);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Notes API trigger
  const handleGenerateNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notesInput.trim()) return;
    setLoading(true);
    setCurrentStatusMsg("Synthesizing concise high-yield academic summaries...");
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: notesInput })
      });
      const data = await response.json();
      setNotesResult(data);
      addToHistory("notes", notesInput);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Summarizer API trigger
  const handleGenerateSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summaryInput.trim()) return;
    setLoading(true);
    setCurrentStatusMsg("Condensing dense terminology block into acronyms...");
    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: summaryInput })
      });
      const data = await response.json();
      setSummaryResult(data);
      addToHistory("summarize", summaryInput.substring(0, 25));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 4. Mindmap API trigger
  const handleGenerateMindmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mindmapInput.trim()) return;
    setLoading(true);
    setCurrentStatusMsg("Calculating optimal conceptual connection trees...");
    try {
      const response = await fetch("/api/mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: mindmapInput })
      });
      const data = await response.json();
      setMindmapResult(data);
      addToHistory("mindmap", mindmapInput);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // PDF Download Helper using CSS print context
  const downloadNotesAsPDF = () => {
    if (!notesResult) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download notes as PDF.");
      return;
    }
    
    const printContent = `
      <html>
        <head>
          <title>${notesResult.topic} - Exam Notes</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; color: #1e293b; line-height: 1.6; padding: 40px; background: #fff; }
            .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            .badge { display: inline-block; background: #eff6ff; color: #2563eb; font-weight: 700; font-size: 11px; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 12px; }
            h1 { font-size: 28px; margin: 0 0 10px 0; color: #0f172a; }
            .intro { font-style: italic; font-size: 16px; color: #475569; margin-bottom: 30px; background: #f8fafc; padding: 15px; border-left: 4px solid #2563eb; }
            .section { margin-bottom: 35px; page-break-inside: avoid; }
            h2 { font-size: 18px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.05em; }
            ul { margin: 0 0 15px 0; padding-left: 20px; }
            li { margin-bottom: 8px; font-size: 14px; }
            .term-box { background: #f1f5f9; padding: 12px; border-radius: 8px; margin-top: 10px; }
            .term-box p { margin: 4px 0; font-size: 13px; font-family: monospace; }
            .footer-tip { background: #fffbeb; border: 1px solid #fde68a; padding: 15px; border-radius: 12px; margin-top: 40px; }
            .tip-title { font-weight: bold; color: #b45309; font-size: 14px; margin-bottom: 5px; text-transform: uppercase; }
            .tip-text { font-size: 13px; color: #78350f; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <span class="badge">Student.AI Verified Exam Notes</span>
            <h1>${notesResult.topic}</h1>
            <div class="intro">${notesResult.introduction}</div>
          </div>
          
          ${notesResult.sections.map(sec => `
            <div class="section">
              <h2>${sec.subHeading}</h2>
              <ul>
                ${sec.keyPoints.map(pt => `<li>${pt}</li>`).join("")}
              </ul>
              ${sec.formulaOrKeyTerms && sec.formulaOrKeyTerms.length > 0 ? `
                <div class="term-box">
                  <strong>Key Vocabulary & Formulas:</strong>
                  ${sec.formulaOrKeyTerms.map(term => `<p>📍 ${term}</p>`).join("")}
                </div>
              ` : ""}
            </div>
          `).join("")}

          <div class="section" style="margin-top: 40px; background: #fafafa; padding: 20px; border-radius: 12px; border: 1px dashed #ddd;">
            <h2>Quick Recall Strategy</h2>
            <p style="font-size: 14px; color: #444; margin: 0;">${notesResult.quickSummary}</p>
          </div>

          <div class="footer-tip">
            <div class="tip-title">⚡ High-Value Revision Tip</div>
            <div class="tip-text">${notesResult.studyTip}</div>
          </div>

          <p style="text-align: center; font-size: 11px; color: #94a3b8; margin-top: 60px;">Generated with Student Study Assistant — Geometric Balance Theme. Printed on ${new Date().toLocaleDateString()}</p>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Quick navigation triggers from dashboard
  const handleDashboardNav = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  // Filter history list based on search bar
  const filteredHistory = searchQuery.trim() === "" 
    ? searchHistory 
    : searchHistory.filter(h => h.topic.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"} p-0 md:p-4 lg:p-6`}>
      
      {/* Outer frame matching the 'Geometric Balance' border layout */}
      <div id="geometric-app-frame" className="max-w-7xl mx-auto bg-white dark:bg-slate-900 border-0 md:border-8 border-slate-200 dark:border-slate-850 rounded-none md:rounded-3xl shadow-lg overflow-hidden flex flex-col min-h-[92vh]">
        
        {/* Navigation Bar matching the exact 64px tall Geometric Balance aesthetic */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            {/* Geometric logo square */}
            <div className="w-8 h-8 bg-primary bg-indigo-600 dark:bg-indigo-500 rounded-md flex items-center justify-center text-white font-bold font-display text-sm tracking-tighter">
              S
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight text-slate-900 dark:text-slate-100">
              STUDENT<span className="text-indigo-650 dark:text-indigo-400 font-medium font-sans">.AI</span>
            </span>
          </div>

          {/* Desktop Tab links with minimalist uppercase tracking */}
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setActiveTab("home")}
              className={`text-xs font-semibold uppercase tracking-wider cursor-pointer py-1.5 transition ${
                activeTab === "home" 
                  ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400" 
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-250"
              }`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab("questions")}
              className={`text-xs font-semibold uppercase tracking-wider cursor-pointer py-1.5 transition ${
                activeTab === "questions" 
                  ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400" 
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-250"
              }`}
              id="nav-questions-btn"
            >
              Questions
            </button>
            <button 
              onClick={() => setActiveTab("notes")}
              className={`text-xs font-semibold uppercase tracking-wider cursor-pointer py-1.5 transition ${
                activeTab === "notes" 
                  ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400" 
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-250"
              }`}
              id="nav-notes-btn"
            >
              Notes Generator
            </button>
            <button 
              onClick={() => setActiveTab("summarize")}
              className={`text-xs font-semibold uppercase tracking-wider cursor-pointer py-1.5 transition ${
                activeTab === "summarize" 
                  ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400" 
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-250"
              }`}
            >
              Summarizer
            </button>
            <button 
              onClick={() => setActiveTab("mindmap")}
              className={`text-xs font-semibold uppercase tracking-wider cursor-pointer py-1.5 transition ${
                activeTab === "mindmap" 
                  ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400" 
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-250"
              }`}
            >
              Mindmap
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative hidden lg:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search revision history..."
                className="w-56 h-9 pl-9 pr-4 text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Dark mode button */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Mobile quick tabs */}
        <div className="md:hidden flex overflow-x-auto gap-2 px-4 py-2 border-b border-indigo-50/50 bg-slate-50 dark:bg-slate-885 dark:border-slate-800">
          {[
            { id: "home", label: "Dashboard" },
            { id: "questions", label: "Questions" },
            { id: "notes", label: "Notes" },
            { id: "summarize", label: "Summarizer" },
            { id: "mindmap", label: "Mindmap" }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setActiveTab(m.id as ActiveTab)}
              className={`px-3.5 py-1.5 text-xs font-semibold tracking-wide rounded-lg shrink-0 ${
                activeTab === m.id 
                  ? "bg-indigo-600 text-white" 
                  : "bg-white dark:bg-slate-800 text-slate-650 dark:text-slate-350 border border-slate-100 dark:border-slate-800"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Active search filters dropdown menu notification */}
        {searchQuery.trim() !== "" && (
          <div className="bg-amber-50/60 dark:bg-amber-950/20 px-8 py-2 text-xs border-b border-amber-100 text-amber-800 dark:text-amber-300 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" /> Filtering revision logs by: <strong>"{searchQuery}"</strong> ({filteredHistory.length} matchings found)
            </span>
            <button onClick={() => setSearchQuery("")} className="font-bold underline uppercase tracking-wider text-[10px]">Clear</button>
          </div>
        )}

        {/* Banner if API key fallback is in action */}
        {!apiHasKey && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border-b border-rose-100 dark:border-rose-900/60 px-6 py-2.5 flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              <strong>Note:</strong> GEMINI_API_KEY is not defined. We've loaded the <strong>Aesthetic Study Mode</strong> so the assistant will automatically generate real, top-quality exam mock guides & text mapping charts!
            </span>
          </div>
        )}

        {/* Main Workspace Frame */}
        <main className="flex-1 p-4 md:p-8 space-y-8 overflow-y-auto">
          
          {/* Global Loading overlay */}
          <AnimatePresence>
            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
              >
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-sm w-full shadow-2xl text-center space-y-4">
                  <div className="relative w-12 h-12 mx-auto">
                    <RefreshCw className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-slate-850 dark:text-slate-100">AI Preparation Engine</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{currentStatusMsg}</p>
                  </div>
                  <div className="h-1 bg-slate-100 dark:bg-slate-800 overflow-hidden rounded-full">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 w-2/3 animate-pulse rounded-full"></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Conditional page render */}
          {activeTab === "home" && <DashboardHome onNav={handleDashboardNav} />}

          {/* EXAM QUESTIONS TAB */}
          {activeTab === "questions" && (
            <div className="space-y-6" id="questions-generator-container">
              <div className="border-l-4 border-indigo-600 dark:border-indigo-400 pl-4 py-1">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-indigo-650 dark:text-indigo-400">Step 1 — Topic Selection</span>
                <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100">Important Questions Generator</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Enter your course topic. The system will synthesize mock exam questions with difficulty grades, correct sample strategies, and essential recall markers.</p>
              </div>

              {/* Input Form */}
              <div className="bg-white dark:bg-slate-880 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                <form onSubmit={handleGenerateQuestions} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Subject / Topic Focus Area</label>
                    <input
                      type="text"
                      required
                      value={questionsInput}
                      onChange={e => setQuestionsInput(e.target.value)}
                      placeholder="e.g. Distributed Databases Consensus, Photosynthesis Light Phase, French Revolution Estates..."
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-150"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-mono text-slate-400">Exam preparation format generated in standard cards</span>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-xs font-medium tracking-wide flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Generate Exam Questions
                    </button>
                  </div>
                </form>
              </div>

              {/* Questions Result Cards */}
              {questionsResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-850 pb-2">
                    <div>
                      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Subject: {questionsResult.subject}</span>
                      <h2 className="text-sm font-semibold text-slate-850 dark:text-slate-250">Target Topic: <span className="text-indigo-600 dark:text-indigo-400 font-bold">"{questionsResult.topic}"</span></h2>
                    </div>
                    {questionsResult.isFallback && (
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">Presaved Guideline Mode</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {questionsResult.questions.map((q, idx) => (
                      <div key={q.id || idx} className="bg-white dark:bg-slate-880 border border-slate-205 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-mono text-slate-400">Question #{idx + 1}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider font-mono ${
                              q.difficulty === "Easy" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300" :
                              q.difficulty === "Medium" ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300" :
                              "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-300"
                            }`}>
                              Difficulty: {q.difficulty}
                            </span>
                          </div>

                          <h3 className="font-display font-bold text-base text-slate-905 dark:text-slate-100 mb-4 line-clamp-3 leading-snug">
                            {q.question}
                          </h3>

                          {/* Critical Grading Rubric */}
                          <div className="space-y-2 mb-4 bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-100/80 dark:border-slate-850">
                            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-indigo-650 dark:text-indigo-400 block">Must Cover in Answer (Grading Key):</span>
                            <ul className="space-y-1.5">
                              {q.importantPoints.map((pt, i) => (
                                <li key={i} className="text-xs text-slate-650 dark:text-slate-350 flex items-start gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                                  <span>{pt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Model response helper */}
                        <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-850">
                          <details className="group">
                            <summary className="text-xs font-semibold text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200 cursor-pointer list-none flex items-center justify-between">
                              <span>📚 View Model Outline Guide</span>
                              <ChevronRight className="w-3.5 h-3.5 group-open:rotate-90 transition-transform text-slate-400" />
                            </summary>
                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 bg-indigo-50/30 dark:bg-indigo-950/20 p-2.5 rounded-lg border border-indigo-100/20 leading-relaxed italic">
                              {q.sampleAnswerOutline}
                            </p>
                          </details>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* EXAM NOTES TAB */}
          {activeTab === "notes" && (
            <div className="space-y-6" id="notes-generator-container">
              <div className="border-l-4 border-indigo-600 dark:border-indigo-400 pl-4 py-1">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-indigo-650 dark:text-indigo-400">Step 2 — Handout Synthesis</span>
                <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100">Exam-Oriented Notes Generator</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Enter an overarching topic. Distill key definitions, formulas list, quick conclusions, and get study notes designed for high memory retention.</p>
              </div>

              {/* Input Form */}
              <div className="bg-white dark:bg-slate-880 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                <form onSubmit={handleGenerateNotes} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Target Study Subject / Topic</label>
                    <input
                      type="text"
                      required
                      value={notesInput}
                      onChange={e => setNotesInput(e.target.value)}
                      placeholder="e.g. Dijkstra's Algorithm, Keynesian Economics, Cellular Respiration cycle..."
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-150"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-mono text-slate-400">PDF download enabled after compiling dynamic text</span>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-xs font-medium tracking-wide flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Generate Exam Notes
                    </button>
                  </div>
                </form>
              </div>

              {/* Notes Result Layout */}
              {notesResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden shadow-xs"
                >
                  {/* Top Bar with export triggers */}
                  <div className="bg-slate-50 dark:bg-slate-850 px-6 py-4 border-b border-slate-200 dark:border-slate-805 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-900/50 text-blue-650 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full uppercase">Verified Exam Handout</span>
                      <h2 className="text-lg font-display font-extrabold text-slate-900 dark:text-slate-100 mt-1">{notesResult.topic}</h2>
                    </div>
                    
                    <button
                      onClick={downloadNotesAsPDF}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                      title="Generate beautiful PDF file and print"
                    >
                      <Download className="w-3.5 h-3.5" /> Download notes as PDF
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-6">
                    
                    {/* Introduction box */}
                    <div className="bg-slate-50/50 dark:bg-slate-900 border-l-4 border-indigo-500 p-4 rounded-r-xl">
                      <p className="text-sm dark:text-slate-300 leading-relaxed italic text-slate-700">
                        "{notesResult.introduction}"
                      </p>
                    </div>

                    {/* Section Breakdown Grid */}
                    <div className="space-y-6">
                      {notesResult.sections.map((section, idx) => (
                        <div key={idx} className="border-t border-slate-100 dark:border-slate-800 pt-5 first:border-0 first:pt-0">
                          <h3 className="text-sm font-semibold uppercase font-mono tracking-wider text-indigo-650 dark:text-indigo-400 flex items-center gap-2 mb-3">
                            <span className="w-5 h-5 bg-indigo-100 dark:bg-indigo-900 text-indigo-750 dark:text-indigo-350 text-[10px] font-bold rounded-full flex items-center justify-center">
                              {idx + 1}
                            </span>
                            {section.subHeading}
                          </h3>

                          {/* Bullet points */}
                          <ul className="space-y-2 pl-4 md:pl-7">
                            {section.keyPoints.map((pt, jIdx) => (
                              <li key={jIdx} className="text-sm text-slate-750 dark:text-slate-300 list-disc list-outside leading-relaxed">
                                {pt}
                              </li>
                            ))}
                          </ul>

                          {/* Vocabulary or formulas block if any */}
                          {section.formulaOrKeyTerms && section.formulaOrKeyTerms.length > 0 && (
                            <div className="mt-4 ml-4 md:ml-7 bg-slate-50 dark:bg-slate-905 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-2">Key Vocabulary / Formulas:</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {section.formulaOrKeyTerms.map((term, tIdx) => (
                                  <div key={tIdx} className="text-xs font-mono text-slate-600 dark:text-slate-350 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                    <span>{term}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Quick Wrap synthesis */}
                    <div className="bg-indigo-50/20 dark:bg-slate-850 p-4 rounded-xl border border-indigo-150/20 dark:border-slate-800">
                      <h4 className="font-display font-semibold text-xs text-indigo-650 dark:text-indigo-400 uppercase tracking-widest mb-1.5">Quick Recall Summary</h4>
                      <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed">
                        {notesResult.quickSummary}
                      </p>
                    </div>

                    {/* Study Tip warning block */}
                    <div className="bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/50 p-4 rounded-xl">
                      <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">⚡ Exam Focus Tip:</h4>
                      <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                        {notesResult.studyTip}
                      </p>
                    </div>

                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* TOPIC SUMMARIZER TAB */}
          {activeTab === "summarize" && (
            <div className="space-y-6" id="summary-generator-container">
              <div className="border-l-4 border-indigo-600 dark:border-indigo-400 pl-4 py-1">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-indigo-650 dark:text-indigo-400">Step 3 — Document Distiller</span>
                <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100">Topic Summarizer</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Paste complex textbook paragraphs or lecture transcripts. The summarizer compresses them into core takeaways, term-by-term definitions, and a creative mnemonic acronym.</p>
              </div>

              {/* Input Form */}
              <div className="bg-white dark:bg-slate-880 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                <form onSubmit={handleGenerateSummary} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Paste Course Text / Transcript Excerpt</label>
                    <textarea
                      required
                      rows={5}
                      value={summaryInput}
                      onChange={e => setSummaryInput(e.target.value)}
                      placeholder="Paste textbook definitions, lecture transcripts, or PDF chapters here (up to 3000 characters)..."
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-150"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-mono text-slate-400">{summaryInput.length} characters current</span>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-xs font-medium tracking-wide flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Condense Text & Build Mnemonics
                    </button>
                  </div>
                </form>
              </div>

              {/* Summarizer Result cards layout */}
              {summaryResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Topic Recap text summary card */}
                  <div className="bg-white dark:bg-slate-885 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs">
                    <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-slate-150 uppercase tracking-widest mb-3 text-indigo-600 dark:text-indigo-400">Topic Summary</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-350 leading-relaxed">
                      {summaryResult.topicSummary}
                    </p>
                  </div>

                  {/* Bullet Takeaways Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Left: Key Bullet points */}
                    <div className="bg-white dark:bg-slate-885 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs">
                      <h3 className="font-display font-extrabold text-xs text-slate-400 uppercase tracking-widest mb-4">Core Revision Takeaways</h3>
                      <ul className="space-y-3">
                        {summaryResult.keyTakeaways.map((pt, i) => (
                          <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-slate-150 dark:bg-slate-800 text-[10px] font-bold text-slate-650 dark:text-slate-350 flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right: Acronym mnemonic device */}
                    <div className="bg-gradient-to-br from-indigo-500/10 to-transparent dark:from-slate-800 border border-indigo-150/20 dark:border-slate-800 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full inline-block mb-3">Memory Hook Trigger</span>
                        <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-slate-100 mb-2">Exams Memory Aid</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal mb-4">Use this dynamic mnemonic to recall key parameters during high-pressure timed exams:</p>
                      </div>

                      <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-indigo-100/30">
                        <p className="text-sm font-mono font-semibold text-slate-800 dark:text-slate-200 italic leading-relaxed">
                          {summaryResult.mnemonicDevice}
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Definition Glossary List */}
                  <div className="bg-white dark:bg-slate-880 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs">
                    <h3 className="font-display font-extrabold text-xs text-slate-400 uppercase tracking-widest mb-4">Simplified Jargon Glossary</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {summaryResult.simplifiedPoints.map((pt, i) => (
                        <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-850">
                          <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 block mb-1">📍 {pt.concept}</span>
                          <span className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed block">{pt.explanation}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </motion.div>
              )}
            </div>
          )}

          {/* INTERACTIVE MINDMAP TAB */}
          {activeTab === "mindmap" && (
            <div className="space-y-6" id="mindmap-generator-container">
              <div className="border-l-4 border-indigo-600 dark:border-indigo-400 pl-4 py-1">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-indigo-650 dark:text-indigo-400">Step 4 — Spatial mapping</span>
                <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100">Visual Mind Map Creator</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Map connected terms physically! Enter a topic to generate a text-based hierarchy tree displaying how sub-themes relate.</p>
              </div>

              {/* Input Form */}
              <div className="bg-white dark:bg-slate-880 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                <form onSubmit={handleGenerateMindmap} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Central Node Study Concept</label>
                    <input
                      type="text"
                      required
                      value={mindmapInput}
                      onChange={e => setMindmapInput(e.target.value)}
                      placeholder="e.g. Artificial Intelligence, Mechanical Engineering Gears, Human Immune System..."
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-150"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-mono text-slate-400">Connected branches map rendered instantly below</span>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-xs font-medium tracking-wide flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Generate Balanced Mindmap
                    </button>
                  </div>
                </form>
              </div>

              {/* Connected Topics Interactive Board */}
              {mindmapResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/90 rounded-2xl overflow-hidden p-6 shadow-xs"
                >
                  <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-850">
                    <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full uppercase tracking-wider">Concept Alignment Map</span>
                    <h2 className="text-lg font-display font-extrabold text-slate-900 dark:text-slate-100 mt-1">Study Map: <span className="text-indigo-650 dark:text-indigo-400">{mindmapResult.rootName}</span></h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-0.5">{mindmapResult.description}</p>
                  </div>

                  {/* Beautiful visual hierarchic flow chart using borders */}
                  <div className="relative pt-6 min-h-[400px] overflow-x-auto select-none">
                    
                    {/* Centered Root node */}
                    <div className="flex justify-center mb-10">
                      <div className="bg-indigo-600 text-white border-2 border-indigo-755 dark:border-indigo-400 text-center px-6 py-3.5 rounded-xl block max-w-sm shadow-md">
                        <div className="text-[10px] uppercase font-mono tracking-wider font-semibold text-indigo-200">Central Master Node</div>
                        <span className="text-sm font-display font-extrabold">{mindmapResult.rootName}</span>
                      </div>
                    </div>

                    {/* Sub Branches columns container */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {mindmapResult.children.map((branch, bIdx) => (
                        <div key={bIdx} className="space-y-4 relative bg-slate-50/50 dark:bg-slate-905 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-850">
                          
                          {/* Parent Branch Node */}
                          <div className="border-l-4 border-indigo-500 dark:border-indigo-450 pl-3">
                            <span className="text-[9px] font-mono tracking-widest text-[#94a3b8] dark:text-slate-500 uppercase">Sub-Theme Branch {bIdx + 1}</span>
                            <h3 className="font-display font-semibold text-slate-900 dark:text-slate-150 text-sm">{branch.name}</h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{branch.description}</p>
                          </div>

                          {/* Branch connector visual line */}
                          <div className="border-t border-slate-200 dark:border-slate-800 my-2"></div>

                          {/* Children Leaf Nodes */}
                          <div className="space-y-3 pl-2">
                            {branch.children.map((leaf, lIdx) => (
                              <div key={lIdx} className="bg-white dark:bg-slate-880 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800/80 shadow-3xs hover:border-indigo-200 dark:hover:border-slate-700 transition duration-150">
                                <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-slate-850 dark:text-slate-200">
                                  <CornerDownRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                  <span>{leaf.name}</span>
                                </div>
                                <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-normal pl-5">
                                  {leaf.description}
                                </p>
                              </div>
                            ))}
                          </div>

                        </div>
                      ))}
                    </div>

                  </div>
                </motion.div>
              )}
            </div>
          )}

        </main>

        {/* Dynamic Study Logs Sidebar (only visible on large screens) / History drawer */}
        <footer className="mt-auto border-t border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-905 px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">System Ready: python flask endpoints translated to node server</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="font-mono">Terms of Service</span>
            <span className="font-mono">Help Center</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">v1.2.0-stable</span>
          </div>
        </footer>

      </div>

      {/* Revision Logs Sidebar section underneath main frame */}
      {searchHistory.length > 0 && (
        <div className="max-w-7xl mx-auto mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <h3 className="font-display font-bold text-sm text-slate-850 dark:text-slate-150">Revision Content Logs</h3>
            </div>
            <button
              onClick={clearHistory}
              className="text-[10px] font-mono tracking-wider text-rose-500 dark:text-rose-400 font-bold hover:underline cursor-pointer uppercase"
            >
              Clear Logs
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {filteredHistory.map((h, i) => (
              <div 
                key={h.id || i}
                onClick={() => {
                  setActiveTab(h.tab);
                  if (h.tab === "questions") setQuestionsInput(h.topic);
                  else if (h.tab === "notes") setNotesInput(h.topic);
                  else if (h.tab === "summarize") setSummaryInput(h.topic);
                  else if (h.tab === "mindmap") setMindmapInput(h.topic);
                }}
                className="p-3 bg-slate-50 dark:bg-slate-885 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-indigo-300 dark:hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-mono mb-1">
                  <span>{h.tab}</span>
                  <span>{h.date}</span>
                </div>
                <p className="text-xs font-semibold text-slate-750 dark:text-slate-200 truncate pr-2">
                  {h.topic}
                </p>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold block mt-1 hover:underline">Reload search →</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
