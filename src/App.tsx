import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RefreshCw, AlertCircle, Clock, Sliders } from "lucide-react";
import Navbar from "./components/Navbar";
import DashboardHome from "./components/DashboardHome";
import QuestionGenerator from "./components/QuestionGenerator";
import NotesGenerator from "./components/NotesGenerator";
import Summarizer from "./components/Summarizer";
import MindMap from "./components/MindMap";
import SubjectSelection from "./components/SubjectSelection";
import { ActiveTab, QuestionsResponse, NotesResponse, SummaryResponse, MindMapResponse } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiHasKey, setApiHasKey] = useState<boolean>(true);

  // Form input holding states
  const [questionsInput, setQuestionsInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [summaryInput, setSummaryInput] = useState("");
  const [mindmapInput, setMindmapInput] = useState("");

  // Global triggers
  const [loading, setLoading] = useState<boolean>(false);
  const [currentStatusMsg, setCurrentStatusMsg] = useState("");

  // API models results
  const [questionsResult, setQuestionsResult] = useState<QuestionsResponse | null>(null);
  const [notesResult, setNotesResult] = useState<NotesResponse | null>(null);
  const [summaryResult, setSummaryResult] = useState<SummaryResponse | null>(null);
  const [mindmapResult, setMindmapResult] = useState<MindMapResponse | null>(null);

  // Search/Revision logs track
  const [searchHistory, setSearchHistory] = useState<Array<{ id: string; tab: ActiveTab; topic: string; date: string }>>([]);

  useEffect(() => {
    // Read backend api status
    fetch("/api/status")
      .then(r => r.json())
      .then(data => {
        if (data && typeof data.hasApiKey === "boolean") {
          setApiHasKey(data.hasApiKey);
        }
      })
      .catch(err => console.error("Error reading backend status:", err));

    // Restore dark mode
    const savedTheme = localStorage.getItem("student_dark_mode");
    if (savedTheme === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    // Restore history log
    const savedHistory = localStorage.getItem("student_study_history");
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Error restoring history:", e);
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

  const addToHistory = (tab: ActiveTab, topic: string) => {
    const cleanTopic = topic.trim();
    if (!cleanTopic) return;
    const newItem = {
      id: Date.now().toString(),
      tab,
      topic: cleanTopic.length > 55 ? cleanTopic.substring(0, 55) + "..." : cleanTopic,
      date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    const updated = [newItem, ...searchHistory.slice(0, 19)];
    setSearchHistory(updated);
    localStorage.setItem("student_study_history", JSON.stringify(updated));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("student_study_history");
  };

  // Direct subject selection click generator dispatch
  const handleSelectSubjectTopic = async (subjectName: string, topicName: string, targetTool: "questions" | "notes" | "mindmap") => {
    const combinedInput = `${topicName}`;
    
    if (targetTool === "questions") {
      setQuestionsInput(combinedInput);
      setActiveTab("questions");
      setLoading(true);
      setCurrentStatusMsg(`Generating exam-important questions on "${topicName}" for ${subjectName}...`);
      try {
        let endpt = "/api/questions";
        const norm = subjectName.toLowerCase();
        if (norm.includes("python")) endpt = "/api/python-questions";
        else if (norm.includes("c pr") || norm.includes("cprogramming")) endpt = "/api/cprogramming-questions";
        else if (norm.includes("artificial") || norm.includes("ai")) endpt = "/api/ai-questions";
        else if (norm.includes("civil")) endpt = "/api/civil-questions";
        else if (norm.includes("physics")) endpt = "/api/physics-questions";
        else if (norm.includes("biology")) endpt = "/api/biology-questions";

        const res = await fetch(endpt, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: combinedInput, subject: subjectName })
        });
        const data = await res.json();
        setQuestionsResult(data);
        addToHistory("questions", `${subjectName}: ${topicName}`);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else if (targetTool === "notes") {
      setNotesInput(combinedInput);
      setActiveTab("notes");
      setLoading(true);
      setCurrentStatusMsg(`Compiling exam notes on "${topicName}" for ${subjectName}...`);
      try {
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: combinedInput, subject: subjectName })
        });
        const data = await res.json();
        setNotesResult(data);
        addToHistory("notes", `${subjectName}: ${topicName}`);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else if (targetTool === "mindmap") {
      setMindmapInput(combinedInput);
      setActiveTab("mindmap");
      setLoading(true);
      setCurrentStatusMsg(`Structuring hierarchical mindmap for "${topicName}" under ${subjectName}...`);
      try {
        const res = await fetch("/api/mindmap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: combinedInput, subject: subjectName })
        });
        const data = await res.json();
        setMindmapResult(data);
        addToHistory("mindmap", `${subjectName}: ${topicName}`);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Questions generator dispatch
  const handleGenerateQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionsInput.trim()) return;
    setLoading(true);
    setCurrentStatusMsg("Analyzing syllabus topics and extracting core concepts...");
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

  // Notes generator dispatch
  const handleGenerateNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notesInput.trim()) return;
    setLoading(true);
    setCurrentStatusMsg("Synthesizing clear textbook terms & exam formulas...");
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

  // Summarizer dispatch
  const handleGenerateSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summaryInput.trim()) return;
    setLoading(true);
    setCurrentStatusMsg("Condensing textbook chapters into bite-sized mnemonics...");
    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: summaryInput })
      });
      const data = await response.json();
      setSummaryResult(data);
      addToHistory("summarize", summaryInput.substring(0, 30));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Mindmap dispatch
  const handleGenerateMindmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mindmapInput.trim()) return;
    setLoading(true);
    setCurrentStatusMsg("Structuring visual connection hierarchy tree...");
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

  // Exporter to PDF using browser-native print frames
  const downloadNotesAsPDF = () => {
    if (!notesResult) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download notes as PDF files.");
      return;
    }
    
    const printContent = `
      <html>
        <head>
          <title>${notesResult.topic} - Student.AI Notes</title>
          <style>
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; line-height: 1.6; padding: 40px; background: #fff; }
            .header { border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
            .badge { display: inline-block; background: #eff6ff; color: #4f46e5; font-weight: 700; font-size: 11px; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 12px; }
            h1 { font-size: 28px; margin: 0 0 10px 0; color: #0f172a; }
            .intro { font-style: italic; font-size: 16px; color: #475569; margin-bottom: 30px; background: #f8fafc; padding: 15px; border-left: 4px solid #4f46e5; border-radius: 0 8px 8px 0; }
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
            <span class="badge">Student.AI Verified Exam Handout</span>
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

          <p style="text-align: center; font-size: 11px; color: #94a3b8; margin-top: 60px;">Generated with Student Study Assistant. Printed on ${new Date().toLocaleDateString()}</p>

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

  const handleDashboardNav = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const filteredHistory = searchQuery.trim() === "" 
    ? searchHistory 
    : searchHistory.filter(h => h.topic.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? "dark bg-slate-950 text-slate-150" : "bg-slate-50 text-slate-800"} p-0 md:p-4 lg:p-6`}>
      
      {/* Structural layout box matching target specifications */}
      <div id="geometric-app-frame" className="max-w-7xl mx-auto bg-white dark:bg-slate-900 border-0 md:border-8 border-slate-200 dark:border-slate-850 rounded-none md:rounded-3xl shadow-lg overflow-hidden flex flex-col min-h-[92vh]">
        
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          apiHasKey={apiHasKey}
        />

        {/* Highlight if filter is active */}
        {searchQuery.trim() !== "" && (
          <div className="bg-amber-50/60 dark:bg-amber-955/20 px-8 py-2 text-xs border-b border-amber-100 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" /> Filtering revision history by: <strong>"{searchQuery}"</strong> ({filteredHistory.length} matches found)
            </span>
            <button onClick={() => setSearchQuery("")} className="font-bold underline uppercase tracking-wider text-[10px] cursor-pointer text-amber-900">Clear filter</button>
          </div>
        )}

        {/* Global Warning banner if key is off */}
        {!apiHasKey && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border-b border-rose-100/50 dark:border-rose-900/40 px-6 py-2.5 flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              <strong>Note:</strong> GEMINI_API_KEY environment variable is not defined. Offline study generator modes are active automatically.
            </span>
          </div>
        )}

        {/* Main Work Area */}
        <main className="flex-1 p-4 md:p-8 space-y-8 overflow-y-auto">
          
          <AnimatePresence>
            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
              >
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-805 max-w-sm w-full shadow-2xl text-center space-y-4">
                  <RefreshCw className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto" />
                  <div className="space-y-1">
                    <h3 className="font-display font-extrabold text-slate-800 dark:text-slate-100">AI Preparation Engine</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{currentStatusMsg}</p>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 overflow-hidden rounded-full">
                    <div className="h-full bg-gradient-to-r from-indigo-505 to-purple-605 w-2/3 animate-pulse rounded-full"></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Router views */}
          {activeTab === "home" && (
            <DashboardHome onNav={handleDashboardNav} />
          )}

          {activeTab === "subjects" && (
            <SubjectSelection onSelectTopic={handleSelectSubjectTopic} />
          )}

          {activeTab === "questions" && (
            <QuestionGenerator
              questionsInput={questionsInput}
              setQuestionsInput={setQuestionsInput}
              questionsResult={questionsResult}
              loading={loading}
              statusMsg={currentStatusMsg}
              onGenerate={handleGenerateQuestions}
            />
          )}

          {activeTab === "notes" && (
            <NotesGenerator
              notesInput={notesInput}
              setNotesInput={setNotesInput}
              notesResult={notesResult}
              loading={loading}
              statusMsg={currentStatusMsg}
              onGenerate={handleGenerateNotes}
              downloadPDF={downloadNotesAsPDF}
            />
          )}

          {activeTab === "summarize" && (
            <Summarizer
              summaryInput={summaryInput}
              setSummaryInput={setSummaryInput}
              summaryResult={summaryResult}
              loading={loading}
              statusMsg={currentStatusMsg}
              onGenerate={handleGenerateSummary}
            />
          )}

          {activeTab === "mindmap" && (
            <MindMap
              mindmapInput={mindmapInput}
              setMindmapInput={setMindmapInput}
              mindmapResult={mindmapResult}
              loading={loading}
              statusMsg={currentStatusMsg}
              onGenerate={handleGenerateMindmap}
            />
          )}

        </main>

        {/* Global Footer Ribbon */}
        <footer className="mt-auto border-t border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-905 px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="font-mono text-[11px] text-slate-550 dark:text-slate-400">System Core Ready: Express backend proxying active.</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span>Privacy Policy</span>
            <span>Terms of Study</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">v1.3.0-stable</span>
          </div>
        </footer>

      </div>

      {/* History Log Drawer */}
      {searchHistory.length > 0 && (
        <div className="max-w-7xl mx-auto mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 md:p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100">Revision Content Logs</h3>
            </div>
            <button
              onClick={clearHistory}
              className="text-[10px] font-mono tracking-wider text-rose-500 dark:text-rose-450 font-bold hover:underline cursor-pointer uppercase"
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
                  window.scrollTo({ top: 300, behavior: "smooth" });
                }}
                className="p-3 bg-slate-50 dark:bg-slate-885 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-indigo-350 dark:hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between text-[9.5px] text-slate-400 uppercase font-mono mb-1">
                  <span>{h.tab}</span>
                  <span>{h.date}</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                  {h.topic}
                </p>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold block mt-1">Reload log query →</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
