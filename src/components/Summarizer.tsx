import React, { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Copy, Check, Info, Loader2 } from "lucide-react";
import { SummaryResponse } from "../types";

interface SummarizerProps {
  summaryInput: string;
  setSummaryInput: (val: string) => void;
  summaryResult: SummaryResponse | null;
  loading: boolean;
  statusMsg: string;
  onGenerate: (e: React.FormEvent) => void;
}

export default function Summarizer({
  summaryInput,
  setSummaryInput,
  summaryResult,
  loading,
  statusMsg,
  onGenerate
}: SummarizerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopySummary = () => {
    if (!summaryResult) return;
    let text = `Summary:\n${summaryResult.topicSummary}\n\n`;
    text += `Takeaways:\n`;
    summaryResult.keyTakeaways.forEach((pt, i) => {
      text += `${i + 1}. ${pt}\n`;
    });
    text += `\nMnemonic Hook:\n${summaryResult.mnemonicDevice}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6" id="summary-generator-container">
      {/* Intro Header */}
      <div className="border-l-4 border-indigo-600 dark:border-indigo-400 pl-4 py-1">
        <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-indigo-650 dark:text-indigo-400">Step 3 — Document Distiller</span>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100">Topic Summarizer</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Transform complex, verbose reading booklets or transcripts into bullet points, core concepts, and high-retention mnemonic device words.</p>
      </div>

      {/* Input container */}
      <div className="bg-white/80 dark:bg-slate-850/80 backdrop-blur-lg border border-slate-200/50 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <form onSubmit={onGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Paste Course Text / Essay Paragraph</label>
            <textarea
              required
              rows={5}
              value={summaryInput}
              onChange={e => setSummaryInput(e.target.value)}
              placeholder="Paste definition paragraphs, lecture details, system documentation or book excerpts here (up to 3,000 characters)..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-150 leading-relaxed placeholder:text-slate-400"
            />
          </div>
          <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-905 p-2 rounded-xl border border-slate-150/40 dark:border-slate-850/40">
            <span className="text-[11px] font-mono text-slate-450 dark:text-slate-500 px-2">{summaryInput.length} chars text length</span>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-750 hover:to-violet-750 text-white rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Distilling Facts...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Condense & Create Mnemonics
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Progress tracking */}
      {loading && (
        <div className="flex items-center gap-3 p-4 bg-indigo-50/50 dark:bg-slate-900 border border-indigo-100/50 dark:border-indigo-950/50 rounded-xl">
          <Loader2 className="w-4 h-4 text-indigo-600 stroke-[2.5px] animate-spin" />
          <span className="text-xs font-mono text-indigo-700 dark:text-indigo-400">{statusMsg}</span>
        </div>
      )}

      {/* Output boards */}
      {summaryResult && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Main paragraphs summarize card */}
          <div className="bg-white dark:bg-slate-885 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-3xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-extrabold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Concept Abstract summary</h3>
              <button
                onClick={handleCopySummary}
                className="p-1 px-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-550 dark:text-slate-305 rounded-lg text-xs flex items-center gap-1 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Pack"}</span>
              </button>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              {summaryResult.topicSummary}
            </p>
          </div>

          {/* Breakdown cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Takeaways left panel */}
            <div className="bg-white dark:bg-slate-885 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-3xs">
              <h3 className="font-display font-extrabold text-xs text-slate-400 uppercase tracking-widest mb-4">Core Takeaways Pack</h3>
              <ul className="space-y-3">
                {summaryResult.keyTakeaways.map((pt, i) => (
                  <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3 leading-relaxed">
                    <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-655 dark:text-slate-350 flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mnemonic acronym right panel */}
            <div className="bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent dark:from-indigo-950/20 dark:to-transparent border border-indigo-150/25 dark:border-slate-800 rounded-2xl p-6 shadow-3xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full inline-block mb-3">Memory hook trigger</span>
                <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-slate-100 mb-2">Diagnostic Exam Mnemonic</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal mb-4">Use this dynamic educational mental anchor to remember complex pathways during high-stress exam trials:</p>
              </div>

              <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-indigo-100/35">
                <p className="text-sm font-mono font-semibold text-slate-800 dark:text-slate-200 italic leading-relaxed">
                  {summaryResult.mnemonicDevice}
                </p>
              </div>
            </div>
          </div>

          {/* Definition term glossary panel */}
          <div className="bg-white dark:bg-slate-880 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-3xs">
            <h3 className="font-display font-bold text-xs text-slate-455 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-500" />
              Simplified Concepts Glossary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {summaryResult.simplifiedPoints.map((pt, i) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-850/70 transition">
                  <span className="font-mono text-xs font-bold text-indigo-605 dark:text-indigo-400 block mb-1">📍 {pt.concept}</span>
                  <span className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed block">{pt.explanation}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
