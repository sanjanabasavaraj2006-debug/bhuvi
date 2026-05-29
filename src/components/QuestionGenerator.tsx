import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, Sparkles, CheckCircle2, ChevronRight, CornerDownRight, Copy, Check, Loader2 } from "lucide-react";
import { QuestionsResponse } from "../types";

interface QuestionGeneratorProps {
  questionsInput: string;
  setQuestionsInput: (val: string) => void;
  questionsResult: QuestionsResponse | null;
  loading: boolean;
  statusMsg: string;
  onGenerate: (e: React.FormEvent) => void;
}

export default function QuestionGenerator({
  questionsInput,
  setQuestionsInput,
  questionsResult,
  loading,
  statusMsg,
  onGenerate
}: QuestionGeneratorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "easy":
        return "bg-teal-50 dark:bg-emerald-950/30 text-teal-700 dark:text-emerald-400 border-teal-200/50 dark:border-emerald-900/50";
      case "medium":
        return "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/40";
      case "hard":
        return "bg-rose-50 dark:bg-rose-950/25 text-rose-700 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/45";
      default:
        return "bg-slate-50 dark:bg-slate-800 text-slate-750 dark:text-slate-300 border-slate-200";
    }
  };

  const handleCopyQuestion = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6" id="question-generator-container">
      {/* Intro header */}
      <div className="border-l-4 border-indigo-600 dark:border-indigo-400 pl-4 py-1">
        <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-indigo-650 dark:text-indigo-400">Step 1 — Study Analyzer</span>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100">Exam Question Generator</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Identify crucial high-frequency exam questions, structured points to cover, and perfect scoring guides.</p>
      </div>

      {/* Input section with glassmorphism design */}
      <div className="bg-white/80 dark:bg-slate-850/80 backdrop-blur-lg border border-slate-200/50 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition duration-200">
        <form onSubmit={onGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Subject / Exam Topic</label>
            <div className="relative">
              <input
                type="text"
                required
                value={questionsInput}
                onChange={e => setQuestionsInput(e.target.value)}
                placeholder="e.g., Photosynthesis light-dependent reactions, OS Process Scheduling, Cryptography RSA Algorithm..."
                className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-150 placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-905 p-2 rounded-xl border border-slate-150/40 dark:border-slate-850/40">
            <span className="text-[11px] font-mono text-slate-450 dark:text-slate-500 px-2">Creates 3-5 exam-tier analysis cases</span>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-750 hover:to-violet-750 text-white rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Formulate Exam Questions
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Dynamic Status Loading Box */}
      {loading && (
        <div className="flex items-center gap-3 p-4 bg-indigo-50/50 dark:bg-slate-900 border border-indigo-100/50 dark:border-indigo-950/50 rounded-xl">
          <Loader2 className="w-4 h-4 text-indigo-600 stroke-[2.5px] animate-spin" />
          <span className="text-xs font-mono text-indigo-700 dark:text-indigo-400">{statusMsg}</span>
        </div>
      )}

      {/* Results Display */}
      {questionsResult && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-5"
        >
          {questionsResult.errorMessage && (
            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 text-xs text-amber-700 dark:text-amber-400 rounded-xl border border-amber-200/50 dark:border-amber-900/50">
              Note: Connected under fallback mode due to local api state. Beautiful preview generation remains active.
            </div>
          )}

          {/* Heading summary ribbon */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850/80 rounded-xl">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#94a3b8] block uppercase">Syllabus Class Topic</span>
              <span className="text-xs font-bold text-slate-805 dark:text-slate-200">{questionsResult.subject || "General Analysis"} • {questionsResult.topic}</span>
            </div>
            <span className="text-[10px] px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-full font-bold font-mono uppercase">
              {questionsResult.questions.length} Items Evaluated
            </span>
          </div>

          {/* Questions Stack */}
          <div className="space-y-4">
            {questionsResult.questions.map((item, index) => {
              const isExpanded = expandedId === item.id;
              const isCopied = copiedId === item.id;
              return (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-slate-885 border rounded-2xl transition-all duration-300 shadow-3xs hover:shadow-2xs ${
                    isExpanded 
                      ? "border-indigo-200 dark:border-indigo-900/60 ring-1 ring-indigo-50/50 dark:ring-indigo-950/20" 
                      : "border-slate-200/60 dark:border-slate-800/80"
                  }`}
                >
                  {/* Card Header Area */}
                  <div 
                    className="p-5 flex items-start gap-4 cursor-pointer select-none"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-350 flex items-center justify-center font-display font-extrabold text-sm shrink-0 border border-slate-200/50 dark:border-slate-700/50">
                      {index + 1}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold font-mono uppercase tracking-wider ${getDifficultyColor(item.difficulty)}`}>
                          {item.difficulty}
                        </span>
                        <span className="text-[10.5px] font-mono text-slate-400">Exam Priority High</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-850 dark:text-slate-150 leading-relaxed">
                        {item.question}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleCopyQuestion(item.id, `${item.question}\nOutline:\n${item.sampleAnswerOutline}`)}
                        className="p-1 px-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-550 dark:text-slate-350 rounded-lg text-[10.5px] flex items-center gap-1 transition cursor-pointer"
                        title="Copy question text and scoring guide"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Expandable scoring components */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/10"
                      >
                        <div className="p-5 space-y-4 text-xs">
                          {/* Mandatory syllabus checkpoints */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-mono uppercase tracking-wide font-bold text-slate-405 block mb-1">Mandatory Concepts to Cover:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {item.importantPoints.map((pt, pIdx) => (
                                <div key={pIdx} className="flex items-start gap-2 bg-white dark:bg-slate-855/55 p-2 rounded-xl border border-slate-200/50 dark:border-slate-800/60 transition">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                                  <span className="text-slate-700 dark:text-slate-300 leading-normal font-medium">{pt}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Suggested structuring outline */}
                          <div className="bg-white/80 dark:bg-slate-855/40 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800/80 space-y-1.5">
                            <span className="text-[10px] font-mono uppercase tracking-wide font-bold text-slate-400 block mb-1.5">Structure Outline (scoring guide):</span>
                            <div className="flex gap-2 text-slate-650 dark:text-slate-350 leading-relaxed font-sans text-xs">
                              <CornerDownRight className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                              <p className="italic">{item.sampleAnswerOutline}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
