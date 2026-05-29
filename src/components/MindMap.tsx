import React from "react";
import { motion } from "motion/react";
import { Brain, Sparkles, CornerDownRight, Loader2 } from "lucide-react";
import { MindMapResponse } from "../types";

interface MindMapProps {
  mindmapInput: string;
  setMindmapInput: (val: string) => void;
  mindmapResult: MindMapResponse | null;
  loading: boolean;
  statusMsg: string;
  onGenerate: (e: React.FormEvent) => void;
}

export default function MindMap({
  mindmapInput,
  setMindmapInput,
  mindmapResult,
  loading,
  statusMsg,
  onGenerate
}: MindMapProps) {
  return (
    <div className="space-y-6" id="mindmap-generator-container">
      {/* Intro Header */}
      <div className="border-l-4 border-indigo-600 dark:border-indigo-400 pl-4 py-1">
        <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-indigo-650 dark:text-indigo-400">Step 4 — Spatial mapping</span>
        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100">Visual Mind Map Creator</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Uncover the architectural connections between topics! Enter a core subject to automatically map child concepts and keywords in a structural layout.</p>
      </div>

      {/* Input panel */}
      <div className="bg-white/80 dark:bg-slate-850/80 backdrop-blur-lg border border-slate-200/50 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <form onSubmit={onGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Central Subject node</label>
            <input
              type="text"
              required
              value={mindmapInput}
              onChange={e => setMindmapInput(e.target.value)}
              placeholder="e.g., Computer Networking, Modern European Wars, Cellular Anatomy..."
              className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-150 placeholder:text-slate-400"
            />
          </div>
          <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-905 p-2 rounded-xl border border-slate-150/40 dark:border-slate-850/40">
            <span className="text-[11px] font-mono text-slate-400 px-2 font-medium">Builds connected concepts structures recursively</span>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-750 hover:to-violet-750 text-white rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Graphing Nodes...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Balanced Mindmap
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Progress tracker */}
      {loading && (
        <div className="flex items-center gap-3 p-4 bg-indigo-50/50 dark:bg-slate-900 border border-indigo-100/50 dark:border-indigo-950/50 rounded-xl">
          <Loader2 className="w-4 h-4 text-indigo-600 stroke-[2.5px] animate-spin" />
          <span className="text-xs font-mono text-indigo-700 dark:text-indigo-400">{statusMsg}</span>
        </div>
      )}

      {/* Structured concept rendering map */}
      {mindmapResult && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850/90 rounded-2xl p-6 shadow-xs"
        >
          {/* Header context */}
          <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-850">
            <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/50 text-indigo-750 dark:text-indigo-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">Concept connectivity map</span>
            <h2 className="text-lg font-display font-extrabold text-slate-905 dark:text-slate-100 mt-1">Study Map: <span className="text-indigo-650 dark:text-indigo-400">{mindmapResult.rootName}</span></h2>
            <p className="text-xs text-slate-455 dark:text-slate-400 italic mt-0.5">{mindmapResult.description}</p>
          </div>

          <div className="relative pt-6 min-h-[400px] overflow-x-auto select-none">
            {/* Master Node */}
            <div className="flex justify-center mb-10">
              <div className="bg-indigo-605 text-white border-2 border-indigo-500/30 text-center px-6 py-3.5 rounded-xl block max-w-sm shadow-md">
                <div className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-indigo-200">Central Master Node</div>
                <span className="text-sm font-display font-black tracking-tight">{mindmapResult.rootName}</span>
              </div>
            </div>

            {/* Tree branches column layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mindmapResult.children.map((branch, bIdx) => (
                <div
                  key={bIdx}
                  className="space-y-4 relative bg-slate-50/50 dark:bg-slate-905 p-4 rounded-2xl border border-slate-150/50 dark:border-slate-850"
                >
                  {/* Branch header title */}
                  <div className="border-l-4 border-indigo-500 dark:border-indigo-400 pl-3">
                    <span className="text-[9px] font-mono tracking-wider text-slate-400 uppercase font-black">Sub-Theme {bIdx + 1}</span>
                    <h3 className="font-display font-bold text-slate-850 dark:text-slate-205 text-sm leading-tight">{branch.name}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{branch.description}</p>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-2"></div>

                  {/* Branch child leaves */}
                  <div className="space-y-3 pl-1">
                    {branch.children.map((leaf, lIdx) => (
                      <div
                        key={lIdx}
                        className="bg-white dark:bg-slate-880 p-2.5 rounded-xl border border-slate-205/70 dark:border-slate-800/80 shadow-3xs hover:border-indigo-200 dark:hover:border-slate-700 transition"
                      >
                        <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                          <CornerDownRight className="w-3.5 h-3.5 text-indigo-505 shrink-0" />
                          <span>{leaf.name}</span>
                        </div>
                        <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-normal pl-5 font-sans">
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
  );
}
