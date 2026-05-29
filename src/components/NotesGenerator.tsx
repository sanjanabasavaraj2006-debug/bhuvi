import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, Sparkles, Download, Copy, Bookmark, Check, Loader2,
  HelpCircle, Lightbulb, BookOpen, AlertCircle, GitFork, 
  ChevronRight, Award, Flame, Star, Compass, CheckCircle2,
  ListFilter, Target, Zap, Info, Layers
} from "lucide-react";
import { NotesResponse, TopperConcept, TopperQuestion, TopperNotesSection, TopperStudyBlock } from "../types";

interface NotesGeneratorProps {
  notesInput: string;
  setNotesInput: (val: string) => void;
  notesResult: NotesResponse | null;
  loading: boolean;
  statusMsg: string;
  onGenerate: (e: React.FormEvent) => void;
  downloadPDF: () => void;
}

export default function NotesGenerator({
  notesInput,
  setNotesInput,
  notesResult,
  loading,
  statusMsg,
  onGenerate,
  downloadPDF
}: NotesGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeQuestionTab, setActiveQuestionTab] = useState<string>("All");
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});

  const handleCopyNotes = () => {
    if (!notesResult) return;
    let text = `${notesResult.topic.toUpperCase()} - ACADEMIC STUDY NOTES\n\n`;
    text += `INTRODUCTION & QUIK REVISION SUMMARY:\n${notesResult.introduction}\n\n`;
    
    if (notesResult.foundationalConcepts && notesResult.foundationalConcepts.length > 0) {
      text += `--- FOUNDATIONAL CONCEPTS & GLOSSARY ---\n`;
      notesResult.foundationalConcepts.forEach(c => {
        text += `• ${c.concept}: ${c.definition}\n  Key Terminology: ${c.terminology}\n  Glossary context: ${c.glossary}\n\n`;
      });
    }

    text += `--- DETAILED SYLLABUS DISSECTION ---\n`;
    notesResult.sections.forEach((sec, idx) => {
      text += `${idx + 1}. ${sec.subHeading}\n`;
      sec.keyPoints.forEach(pt => {
        text += `   - ${pt}\n`;
      });
      if (sec.formulaOrKeyTerms && sec.formulaOrKeyTerms.length > 0) {
        text += `   Core Glossary/Term: ${sec.formulaOrKeyTerms.join(", ")}\n`;
      }
      text += `\n`;
    });

    if (notesResult.importantNotesSection && notesResult.importantNotesSection.length > 0) {
      text += `--- TOPPER SECRETS & REPEATED FORMULAS ---\n`;
      notesResult.importantNotesSection.forEach(n => {
        text += `• Highlight Point: ${n.keyPoint}\n  Shortcut Trick: ${n.shortcutTrick}\n  Core Formula: ${n.formula || "N/A"}\n  Diagram Explanation: ${n.diagramExplanation}\n  Exam Frequency warning: ${n.repeatedConcept}\n\n`;
      });
    }

    if (notesResult.smartStudyBlocks && notesResult.smartStudyBlocks.length > 0) {
      text += `--- SMART STUDY BLOCKS & MEMORY HOOKS ---\n`;
      notesResult.smartStudyBlocks.forEach(b => {
        text += `• Topic Pillar: ${b.point}\n  Mnemonic Trick: ${b.memoryTrick}\n  Simplified: ${b.explanation}\n  Concrete Example: ${b.example}\n\n`;
      });
    }

    if (notesResult.examQuestions && notesResult.examQuestions.length > 0) {
      text += `--- EXAM IMPORTANT QUESTIONS & WINNING SCORES ---\n`;
      notesResult.examQuestions.forEach(q => {
        text += `Question [${q.markType}]: ${q.question}\nAnswer: ${q.answer}\n`;
        if (q.options && q.options.length > 0) {
          text += `Options: ${q.options.join(" | ")}\nCorrect: ${q.correctOption}\n`;
        }
        text += `\n`;
      });
    }

    text += `TOPPER STUDY STRATEGY SUMMARY:\n${notesResult.quickSummary}\n\nTip: ${notesResult.studyTip}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNotesOffline = () => {
    if (!notesResult) return;
    const existing = localStorage.getItem("saved_student_notes");
    let arr = [];
    if (existing) {
      try { arr = JSON.parse(existing); } catch (e) { arr = []; }
    }
    if (!arr.some((item: any) => item.topic === notesResult.topic)) {
      arr.push({
        id: Date.now().toString(),
        topic: notesResult.topic,
        data: notesResult,
        savedAt: new Date().toLocaleDateString()
      });
      localStorage.setItem("saved_student_notes", JSON.stringify(arr));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSelectOption = (qId: string, value: string) => {
    setMcqAnswers(prev => ({ ...prev, [qId]: value }));
  };

  // Helper to filter question list based on selected category tab
  const filteredQuestions = notesResult?.examQuestions 
    ? (activeQuestionTab === "All" 
        ? notesResult.examQuestions 
        : notesResult.examQuestions.filter(q => q.markType.toLowerCase().includes(activeQuestionTab.toLowerCase())))
    : [];

  return (
    <div className="space-y-6" id="notes-generator-container">
      {/* Dynamic Intro Frame */}
      <div className="border-l-4 border-indigo-600 dark:border-indigo-400 pl-4 py-1">
        <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-indigo-650 dark:text-indigo-400 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-indigo-500" /> Topper Curriculum Hub
        </span>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100">Gold-Medalist Hand Drawn Study Notes</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Generates incredibly detailed, handwritten-style syllabus material with questions, memory tips, visual explanations, and text mindmaps.</p>
      </div>

      {/* Glassmorphic input panel */}
      <div className="bg-white/80 dark:bg-slate-850/80 backdrop-blur-lg border border-slate-200/50 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <form onSubmit={onGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-405 mb-2">Subject / Exam Topic Name</label>
            <input
              type="text"
              required
              value={notesInput}
              onChange={e => setNotesInput(e.target.value)}
              placeholder="e.g., Backpropagation in Neural Nodes, Mitosis Chromosome Split, Truss Static Balance..."
              className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-805 dark:text-slate-150 placeholder:text-slate-400"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center bg-slate-50/50 dark:bg-slate-905 p-2 rounded-xl border border-slate-150/40 dark:border-slate-850/40">
            <span className="text-[11px] font-mono text-slate-400 px-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-500" /> Comprehensive deep-dive matching topper preparation patterns
            </span>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-705 hover:to-violet-705 text-white rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Compiling Handwritten Notes...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Build Advanced Topper Notes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Loading State Banner */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-8 bg-indigo-50/20 dark:bg-slate-900/40 border border-indigo-100/50 dark:border-indigo-950/50 rounded-2xl space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 stroke-[2.5px] animate-spin" />
          <div className="text-center space-y-1">
            <h4 className="text-xs font-semibold text-indigo-850 dark:text-indigo-400">{statusMsg}</h4>
            <p className="text-[10px] text-slate-400 max-w-sm">Gathering foundational laws, university question papers, model answers, and designing simplified memory tricks...</p>
          </div>
        </div>
      )}

      {/* Notes Sheet Structure */}
      {notesResult && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 print:space-y-4"
        >
          {/* Action Ribbon Panel */}
          <div className="bg-white/90 dark:bg-slate-850/90 border border-slate-205 dark:border-slate-800 rounded-2xl px-6 py-4 flex flex-wrap gap-4 items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-600 dark:text-indigo-400">
                <FileText className="w-4 h-4" />
              </span>
              <div>
                <span className="text-[9.5px] font-mono tracking-widest text-indigo-500 font-bold block uppercase">DOCUMENT COMPILATION READY</span>
                <h2 className="text-sm font-display font-extrabold text-slate-900 dark:text-slate-100">
                  Notes: <span className="text-indigo-650 dark:text-indigo-400">{notesResult.topic}</span>
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyNotes}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-655 dark:text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                title="Copy entire formatted notes"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied Topper Content!" : "Copy Full Notes"}</span>
              </button>

              <button
                onClick={handleSaveNotesOffline}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-655 dark:text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                title="Save notes list"
              >
                {saved ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{saved ? "Saved" : "Save Notes"}</span>
              </button>

              <button
                onClick={downloadPDF}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                title="Download printable study guide"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* 1. Topic Title & Revision summary */}
          <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <Compass className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-mono tracking-widest text-emerald-600 font-extrabold uppercase">Unit Revision Abstract</span>
              </div>
              <h2 className="text-xl font-display font-extrabold text-slate-900 dark:text-slate-100">{notesResult.topic} Revision summary</h2>
            </div>
            
            <p className="text-sm text-slate-705 dark:text-slate-300 leading-relaxed italic border-l-4 border-emerald-500 pl-4 py-1 bg-emerald-50/20 dark:bg-slate-905">
              "{notesResult.introduction}"
            </p>
          </div>

          {/* 2. Foundational Concepts Glossary */}
          {notesResult.foundationalConcepts && notesResult.foundationalConcepts.length > 0 && (
            <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-display font-extrabold text-slate-855 dark:text-slate-100 uppercase tracking-wider">Foundational Concepts & Key Glossary</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notesResult.foundationalConcepts.map((concept, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-display font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full shrink-0"></span>
                        {concept.concept}
                      </h4>
                      <span className="text-[9px] font-mono uppercase bg-indigo-100/40 dark:bg-indigo-950/40 text-indigo-650 px-2 py-0.5 rounded">Core Axiom</span>
                    </div>
                    <p className="text-[11.5px] text-slate-655 dark:text-slate-300 leading-relaxed"><strong className="text-slate-800 dark:text-slate-200">Definition:</strong> {concept.definition}</p>
                    <div className="pt-2 border-t border-slate-100/50 dark:border-slate-800/50 text-[10.5px] font-mono text-slate-505 space-y-1">
                      <div>📖 <span className="font-semibold text-slate-700 dark:text-slate-300">Terminology:</span> {concept.terminology}</div>
                      <div>📌 <span className="font-semibold text-slate-700 dark:text-slate-300">Glossary Mapping:</span> {concept.glossary}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Detailed Syllabus Chapters (Original Note sections) */}
          <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Layers className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-display font-extrabold text-slate-855 dark:text-slate-100 uppercase tracking-wider">Detailed Subject Dissection</h3>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {notesResult.sections.map((section, idx) => (
                <div key={idx} className="py-5 first:pt-0 last:pb-0 space-y-3">
                  <h4 className="text-xs font-mono font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-55 dark:bg-indigo-950/60 text-indigo-655 dark:text-indigo-300 text-[10.5px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    {section.subHeading}
                  </h4>

                  <ul className="space-y-2.5 pl-6 list-disc text-slate-705 dark:text-slate-305 text-xs md:text-sm leading-relaxed">
                    {section.keyPoints.map((point, pIdx) => (
                      <li key={pIdx}>
                        {point}
                      </li>
                    ))}
                  </ul>

                  {section.formulaOrKeyTerms && section.formulaOrKeyTerms.length > 0 && (
                    <div className="mt-3 ml-6 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-xl flex flex-wrap items-center gap-2">
                      <span className="text-[9.5px] font-mono uppercase text-slate-400 font-bold">Sub-chapter formulas/vocabulary:</span>
                      {section.formulaOrKeyTerms.map((term, tIdx) => (
                        <span key={tIdx} className="text-[10.5px] font-mono bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-750 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                          {term}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 4. Important Notes, Formulas & Diagram Explanations */}
          {notesResult.importantNotesSection && notesResult.importantNotesSection.length > 0 && (
            <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Star className="w-4 h-4 text-amber-500 animate-spin-slow" />
                <h3 className="text-sm font-display font-extrabold text-slate-855 dark:text-slate-100 uppercase tracking-wider">Topper Secrets & Important Formulas Section</h3>
              </div>
              <div className="space-y-4">
                {notesResult.importantNotesSection.map((item, idx) => (
                  <div key={idx} className="border-l-4 border-amber-500 pl-4 py-2 bg-amber-50/15 dark:bg-slate-905 rounded-r-xl space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-105">{item.keyPoint}</span>
                      <span className="text-[9.5px] font-mono text-amber-650 bg-amber-500/10 px-2 py-0.5 rounded uppercase font-bold flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-amber-500 stroke-none" /> {item.repeatedConcept}
                      </span>
                    </div>

                    {item.formula && (
                      <div className="bg-white dark:bg-slate-805 p-2.5 rounded-lg border border-slate-150 dark:border-slate-750 max-w-lg">
                        <span className="text-[9px] font-mono text-slate-400 block uppercase mb-1">Mathematical Formula / Mathematical Translation</span>
                        <div className="font-mono text-xs font-semibold text-indigo-650 dark:text-indigo-400">{item.formula}</div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                      <div className="bg-white/60 dark:bg-slate-805/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-805 text-slate-655 dark:text-slate-350">
                        <span className="font-mono text-[9px] uppercase font-bold text-slate-400 block mb-0.5">🚀 Shortcut Trick</span>
                        {item.shortcutTrick}
                      </div>
                      <div className="bg-white/60 dark:bg-slate-805/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850 text-slate-655 dark:text-slate-350">
                        <span className="font-mono text-[9px] uppercase font-bold text-slate-400 block mb-0.5">🖼️ Diagram / Flow Explanation</span>
                        {item.diagramExplanation}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Smart Study Blocks */}
          {notesResult.smartStudyBlocks && notesResult.smartStudyBlocks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notesResult.smartStudyBlocks.map((block, idx) => (
                <div key={idx} className="bg-gradient-to-br from-indigo-50/10 to-violet-50/10 dark:from-indigo-950/10 dark:to-violet-950/10 border border-indigo-200/40 dark:border-indigo-900/30 rounded-2xl p-5 space-y-3 relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/3 w-16 h-16 bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 rounded-full blur-xl"></div>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">
                    <Zap className="w-3.5 h-3.5 animate-pulse" /> Smart Study block: {block.point}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                    {block.explanation}
                  </p>
                  
                  <div className="p-3 bg-white/70 dark:bg-slate-905/70 rounded-xl border border-indigo-100/50 dark:border-slate-800 space-y-1.5 text-[11.5px]">
                    <div className="text-indigo-600 dark:text-indigo-400 font-bold uppercase font-mono tracking-wider text-[9px]">💡 Mnemonic Memory hook</div>
                    <div className="text-slate-800 dark:text-slate-205 py-0.5 border-b border-indigo-100/40 dark:border-slate-850">
                      Trick: <span className="font-mono font-extrabold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">{block.memoryTrick}</span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 pt-1">
                      <strong className="text-slate-700 dark:text-slate-300">Real-world analogy:</strong> {block.example}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 6. Important Exam Questions Section */}
          {notesResult.examQuestions && notesResult.examQuestions.length > 0 && (
            <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-display font-extrabold text-slate-855 dark:text-slate-100 uppercase tracking-wider">Exam Questions & Model Answers</h3>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                  {["All", "1 Mark", "2 Mark", "5 Mark", "Long", "MCQ"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveQuestionTab(tab)}
                      className={`px-3 py-1 text-[11px] font-mono font-bold rounded-lg cursor-pointer transition ${
                        (tab === "All" && activeQuestionTab === "All") || 
                        (tab !== "All" && activeQuestionTab.toLowerCase() === tab.toLowerCase())
                          ? "bg-white dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 shadow-3xs"
                          : "text-slate-405 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 h-[350px] overflow-y-auto pr-2 divide-y divide-slate-100 dark:divide-slate-800/85">
                {filteredQuestions.length === 0 ? (
                  <div className="text-center py-10 font-mono text-xs text-slate-400">
                    No matching questions in this mark category. Try filtering in "All"!
                  </div>
                ) : (
                  filteredQuestions.map((q, idx) => (
                    <div key={q.id} className="pt-4 first:pt-0 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono font-black uppercase text-indigo-655 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                            {q.markType}
                          </span>
                          <h4 className="text-xs md:text-sm font-bold text-slate-850 dark:text-slate-105 flex gap-2">
                            <span>Q{idx + 1}.</span> {q.question}
                          </h4>
                        </div>
                      </div>

                      {/* Interactive MCQ Option Selector */}
                      {q.markType.toLowerCase().includes("mcq") && q.options && q.options.length > 0 ? (
                        <div className="space-y-2 max-w-xl pl-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt, oIdx) => {
                              const isSelected = mcqAnswers[q.id] === opt;
                              const isCorrect = q.correctOption === opt;
                              const hasSubmitted = !!mcqAnswers[q.id];
                              
                              let borderCls = "border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-white dark:bg-slate-900";
                              if (hasSubmitted) {
                                if (isCorrect) borderCls = "border-emerald-500 bg-emerald-50/10 text-emerald-705 dark:text-emerald-400";
                                else if (isSelected) borderCls = "border-rose-500 bg-rose-50/10 text-rose-705 dark:text-rose-450";
                                else borderCls = "border-slate-100 dark:border-slate-850 opacity-60 bg-slate-50";
                              }

                              return (
                                <button
                                  key={oIdx}
                                  onClick={() => handleSelectOption(q.id, opt)}
                                  disabled={hasSubmitted}
                                  className={`p-3 text-left border rounded-xl text-xs cursor-pointer transition flex items-center justify-between ${borderCls}`}
                                >
                                  <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                                  {hasSubmitted && isCorrect && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                          <AnimatePresence>
                            {mcqAnswers[q.id] && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-emerald-50/15 dark:bg-slate-900 border border-emerald-55 dark:border-emerald-950/40 rounded-xl text-[11.5px] text-emerald-805 dark:text-emerald-400 leading-relaxed font-semibold"
                              >
                                🎯 <strong>Topper Hint Answer Code:</strong> Option {q.correctOption}. Concept reasoning: {q.answer}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl leading-relaxed text-slate-700 dark:text-slate-300 text-xs md:text-sm shadow-3xs space-y-2 ml-6">
                          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
                            <Target className="w-3.5 h-3.5 text-indigo-500" /> Gold-Medalist Model Answer Guideline
                          </div>
                          <p>{q.answer}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 7. Key Takeaway Summary */}
          {notesResult.keyTakeawaySummary && notesResult.keyTakeawaySummary.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50/20 to-orange-50/20 dark:from-amber-950/10 dark:to-orange-950/10 border border-amber-200/40 dark:border-amber-900/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-amber-100 dark:border-slate-800 pb-3">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-display font-extrabold text-slate-855 dark:text-slate-100 uppercase tracking-wider">Key Takeaways & Last-Minute Checklist</h3>
              </div>
              <ul className="space-y-3">
                {notesResult.keyTakeawaySummary.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="w-4 h-4 bg-amber-500 text-white font-mono text-[9.5px] rounded-full flex items-center justify-center shrink-0 mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 8. Text-Based Mind Map Connected Trees */}
          {notesResult.mindMapTree && notesResult.mindMapTree.length > 0 && (
            <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <GitFork className="w-4 h-4 text-indigo-500 animate-pulse" />
                <h3 className="text-sm font-display font-extrabold text-slate-855 dark:text-slate-100 uppercase tracking-wider">Syllabus Flow: Text-Based Topic Tree / Mind Map</h3>
              </div>
              <p className="text-xs text-slate-400">Connected schematic layout representing the core study flow and chapters dependencies:</p>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800/80 font-mono text-xs text-slate-655 dark:text-slate-350 space-y-4 overflow-x-auto">
                {/* Root Tree Header */}
                <div className="flex items-center gap-1.5 text-indigo-650 dark:text-indigo-400 font-extrabold">
                  <span>[ROOT SYSTEM]</span> → <span>{notesResult.topic}</span>
                </div>
                
                {/* Loop child leaves */}
                <div className="space-y-2 border-l border-dashed border-slate-300 dark:border-slate-700 pl-4 ml-2">
                  {notesResult.mindMapTree.map((node, nIdx) => (
                    <div key={nIdx} className="space-y-1 py-1">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-slate-400">└─</span>
                        <strong className="text-slate-805 dark:text-slate-105">{node.nodeName}</strong>
                        {node.parentName && <span className="text-[10px] text-slate-400 font-normal italic">(parent: {node.parentName})</span>}
                      </div>
                      <p className="pl-6 text-[11px] text-slate-495 dark:text-slate-407 font-sans leading-relaxed">{node.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Core Warning strategy advice box */}
          <div className="bg-slate-50/50 dark:bg-slate-905 border border-slate-200/50 dark:border-slate-850 p-5 rounded-2xl">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-650 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Compass className="w-4 h-4 text-emerald-500" /> Strategy Pointer
            </h4>
            <p className="text-xs text-slate-505 dark:text-slate-400 leading-relaxed">
              {notesResult.studyTip}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
