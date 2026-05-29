import React, { useState } from "react";
import { motion } from "motion/react";
import { FileText, Sparkles, Download, Copy, Bookmark, Check, Loader2 } from "lucide-react";
import { NotesResponse } from "../types";

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

  const handleCopyNotes = () => {
    if (!notesResult) return;
    let text = `${notesResult.topic} - Exam Notes\n\n${notesResult.introduction}\n\n`;
    notesResult.sections.forEach((sec, idx) => {
      text += `--- ${sec.subHeading} ---\n`;
      sec.keyPoints.forEach(pt => {
        text += `• ${pt}\n`;
      });
      if (sec.formulaOrKeyTerms && sec.formulaOrKeyTerms.length > 0) {
        text += `Key Terms: ${sec.formulaOrKeyTerms.join(", ")}\n`;
      }
      text += `\n`;
    });
    text += `Summary: ${notesResult.quickSummary}\n\nTip: ${notesResult.studyTip}`;
    
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
    // Avoid double-save
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

  return (
    <div className="space-y-6" id="notes-generator-container">
      {/* Intro Header */}
      <div className="border-l-4 border-indigo-600 dark:border-indigo-400 pl-4 py-1">
        <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-indigo-650 dark:text-indigo-400">Step 2 — Textbook Synthesizer</span>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100 font-sans">Exam-Oriented Notes Creator</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Construct high-yield, bulleted revision summaries featuring key dictionary terms and formulas to speed up revision.</p>
      </div>

      {/* Glassmorphic input box */}
      <div className="bg-white/80 dark:bg-slate-850/80 backdrop-blur-lg border border-slate-200/50 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <form onSubmit={onGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-405 mb-2">Study Theme / Topic Name</label>
            <input
              type="text"
              required
              value={notesInput}
              onChange={e => setNotesInput(e.target.value)}
              placeholder="e.g., Mitosis vs Meiosis, Newton's Laws of Motion, Mercantilism Economic Theory..."
              className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-805 dark:text-slate-150 placeholder:text-slate-400"
            />
          </div>
          <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-905 p-2 rounded-xl border border-slate-150/40 dark:border-slate-850/40">
            <span className="text-[11px] font-mono text-slate-400 px-2">Builds beautifully formatted summaries with key vocabulary</span>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-750 hover:to-violet-750 text-white rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Styling Notes...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Exam Notes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Progress indicators */}
      {loading && (
        <div className="flex items-center gap-3 p-4 bg-indigo-50/50 dark:bg-slate-900 border border-indigo-100/50 dark:border-indigo-950/50 rounded-xl">
          <Loader2 className="w-4 h-4 text-indigo-600 stroke-[2.5px] animate-spin" />
          <span className="text-xs font-mono text-indigo-700 dark:text-indigo-400">{statusMsg}</span>
        </div>
      )}

      {/* Bullet note outputs */}
      {notesResult && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-slate-885 border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-2xs transition"
        >
          {/* Header Action Ribbon */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-bold text-slate-850 dark:text-slate-150">Revision Notes: <span className="text-indigo-650 dark:text-indigo-400">{notesResult.topic}</span></h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Reset layout buttons */}
              <button
                onClick={handleCopyNotes}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-655 dark:text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1 transition cursor-pointer"
                title="Copy entire text output"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Notes"}</span>
              </button>

              <button
                onClick={handleSaveNotesOffline}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-655 dark:text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1 transition cursor-pointer"
                title="Save into study drawer for later use"
              >
                {saved ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{saved ? "Saved" : "Save Notes"}</span>
              </button>

              <button
                onClick={downloadPDF}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-3xs"
                title="Save locally as PDF format file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* Notes Sheet Structure */}
          <div className="p-6 space-y-6">
            {/* Intro Header Brief */}
            <div className="bg-slate-50/50 dark:bg-slate-900 border-l-4 border-indigo-500 p-4 rounded-r-xl">
              <p className="text-sm dark:text-slate-300 leading-relaxed italic text-slate-700">
                "{notesResult.introduction}"
              </p>
            </div>

            {/* Logical Sections */}
            <div className="space-y-6">
              {notesResult.sections.map((section, idx) => (
                <div key={idx} className="border-t border-slate-100 dark:border-slate-800/80 pt-5 first:border-0 first:pt-0">
                  <h3 className="text-sm font-extrabold uppercase font-mono tracking-wider text-indigo-650 dark:text-indigo-400 flex items-center gap-2 mb-3">
                    <span className="w-5 h-5 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-750 dark:text-indigo-300 text-[10px] font-bold rounded-full flex items-center justify-center">
                      {idx + 1}
                    </span>
                    {section.subHeading}
                  </h3>

                  {/* Extract bullet notes */}
                  <ul className="space-y-2.5 pl-4 md:pl-7">
                    {section.keyPoints.map((pt, jIdx) => (
                      <li key={jIdx} className="text-sm text-slate-700 dark:text-slate-300 list-disc list-outside leading-relaxed">
                        {pt}
                      </li>
                    ))}
                  </ul>

                  {/* Vocabulary formulas block */}
                  {section.formulaOrKeyTerms && section.formulaOrKeyTerms.length > 0 && (
                    <div className="mt-4 ml-4 md:ml-7 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                      <span className="text-[10px] font-mono uppercase font-black text-slate-400 block mb-2">Section Key Glossary / Formulas</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {section.formulaOrKeyTerms.map((term, tIdx) => (
                          <div key={tIdx} className="text-xs font-mono text-slate-655 dark:text-slate-350 flex items-center gap-1.5">
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

            {/* Quick summary recap bubble */}
            <div className="bg-indigo-50/20 dark:bg-slate-850/40 p-4 rounded-xl border border-indigo-150/20 dark:border-slate-800">
              <h4 className="font-display font-semibold text-xs text-indigo-655 dark:text-indigo-400 uppercase tracking-widest mb-1">Key Takeaway Summary</h4>
              <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                {notesResult.quickSummary}
              </p>
            </div>

            {/* Warning block */}
            <div className="bg-amber-50/40 dark:bg-amber-950/15 border border-amber-100/50 dark:border-amber-900/40 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-amber-705 dark:text-amber-400 uppercase tracking-wider mb-1">💡 Study Strategy Tip</h4>
              <p className="text-xs text-amber-805 dark:text-amber-300 leading-relaxed">
                {notesResult.studyTip}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
