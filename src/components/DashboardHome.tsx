import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Sparkles, Flame, Clock, Brain, HelpCircle, FileText, LayoutDashboard, CheckSquare, Plus, Trash2, Trophy, Play, Pause, RotateCcw, BookOpen
} from "lucide-react";
import { ActiveTab } from "../types";

interface DashboardHomeProps {
  onNav: (tab: ActiveTab) => void;
}

const MOTIVATIONAL_QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Don't let what you cannot do interfere with what you can do.", author: "John Wooden" },
  { text: "There are no secrets to success. It is the result of preparation, hard work, and learning from failure.", author: "Colin Powell" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" }
];

export default function DashboardHome({ onNav }: DashboardHomeProps) {
  // Quote selector
  const [quoteIndex, setQuoteIndex] = useState(0);
  
  // Pomodoro / Study Timer state
  const [timerMode, setTimerMode] = useState<"Focus" | "Short Break">("Focus");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  
  // Streak & Study Goals (localStorage)
  const [streak, setStreak] = useState(3);
  const [completedGoalsCount, setCompletedGoalsCount] = useState(0);
  const [goals, setGoals] = useState<{ id: string; text: string; done: boolean }[]>([]);
  const [newGoalText, setNewGoalText] = useState("");

  // Rotate quotes
  useEffect(() => {
    const r = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    setQuoteIndex(r);
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsRunning(false);
      // Play a simple synthesized alert audio beep
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } catch (e) {
        console.warn("Audio warning:", e);
      }
      
      // Toggle mode
      if (timerMode === "Focus") {
        setTimerMode("Short Break");
        setSecondsLeft(5 * 60);
        setStreak(prev => prev + 1);
        localStorage.setItem("student_streak", String(streak + 1));
      } else {
        setTimerMode("Focus");
        setSecondsLeft(25 * 60);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft, timerMode, streak]);

  // Load localStorage data
  useEffect(() => {
    const savedGoals = localStorage.getItem("student_goals");
    if (savedGoals) {
      try {
        const parsed = JSON.parse(savedGoals);
        setGoals(parsed);
        setCompletedGoalsCount(parsed.filter((g: any) => g.done).length);
      } catch (e) {
        console.error(e);
      }
    } else {
      const defaultGoals = [
        { id: "1", text: "Generate notes for midterm topics", done: false },
        { id: "2", text: "Review 5 complex flash questions", done: false },
        { id: "3", text: "Visualize concept relationships on MindMap", done: false }
      ];
      setGoals(defaultGoals);
      localStorage.setItem("student_goals", JSON.stringify(defaultGoals));
    }

    const savedStreak = localStorage.getItem("student_streak");
    if (savedStreak) {
      setStreak(parseInt(savedStreak, 10));
    } else {
      localStorage.setItem("student_streak", "3");
    }
  }, []);

  // Helper to sync goals
  const updateGoalsState = (newGoals: typeof goals) => {
    setGoals(newGoals);
    setCompletedGoalsCount(newGoals.filter(g => g.done).length);
    localStorage.setItem("student_goals", JSON.stringify(newGoals));
  };

  const handleToggleGoal = (id: string) => {
    const updated = goals.map(g => g.id === id ? { ...g, done: !g.done } : g);
    updateGoalsState(updated);
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    const item = {
      id: Date.now().toString(),
      text: newGoalText.trim(),
      done: false
    };
    updateGoalsState([...goals, item]);
    setNewGoalText("");
  };

  const handleDeleteGoal = (id: string) => {
    updateGoalsState(goals.filter(g => g.id !== id));
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(timerMode === "Focus" ? 25 * 60 : 5 * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8" id="dashboard-home">
      {/* Welcome Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Welcome message & Quote */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-slate-800/40 dark:to-slate-900/40 border border-indigo-100/40 dark:border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            <span className="px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-900/50 rounded-full inline-block">
              Exam Preparation Hub
            </span>
            <h1 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-slate-800 dark:text-slate-100">
              Transform Your <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Study Session</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300 max-w-xl text-sm leading-relaxed">
              Accelerate your learning using custom exam-focused revision content. Craft professional questions, short revision notes, and visually connected mental trees in seconds.
            </p>
          </div>
          
          <div className="mt-8 border-t border-indigo-100 dark:border-slate-800 pt-6">
            <span className="text-xs font-mono uppercase text-indigo-500 tracking-wider block mb-2">Today's Motivation</span>
            <blockquote className="space-y-1">
              <p className="text-base italic font-medium text-slate-700 dark:text-slate-200">
                "{MOTIVATIONAL_QUOTES[quoteIndex].text}"
              </p>
              <footer className="text-xs text-slate-500 dark:text-slate-400">
                — {MOTIVATIONAL_QUOTES[quoteIndex].author}
              </footer>
            </blockquote>
          </div>
        </div>

        {/* Streak & Timer Widgets */}
        <div className="flex flex-col gap-6">
          
          {/* Active study streak */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl">
                <Flame className="w-7 h-7 text-amber-500 fill-amber-500/30 animate-pulse" />
              </div>
              <div>
                <dt className="text-xs text-slate-400 font-mono tracking-wider uppercase">Active Streak</dt>
                <dd className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100">
                  {streak} Days Study
                </dd>
              </div>
            </div>
            <div className="p-2 bg-indigo-50 dark:bg-slate-800 rounded-xl text-center">
              <Trophy className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mx-auto" />
              <span className="text-[10px] font-mono text-indigo-700 dark:text-indigo-300 font-medium">{streak >= 3 ? "Superb!" : "Focus"}</span>
            </div>
          </div>

          {/* Pomodoro Timer */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-xs flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300">Pomodoro Timer</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono ${
                timerMode === "Focus" 
                  ? "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-300"
                  : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300"
              }`}>
                {timerMode}
              </span>
            </div>

            <div className="text-center py-4">
              <span className="text-4xl font-mono font-bold tracking-tight text-slate-800 dark:text-slate-100">
                {formatTime(secondsLeft)}
              </span>
            </div>

            <div className="flex gap-2 items-center justify-center">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200 ${
                  isRunning 
                    ? "bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                    : "bg-indigo-650 hover:bg-indigo-700 text-white shadow-xs"
                }`}
              >
                {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isRunning ? "Pause" : "Start Focus"}
              </button>
              
              <button
                onClick={resetTimer}
                className="p-2 border border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 text-slate-500 rounded-xl cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Gateways & Live Study-to-do */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Gateway Action Boxes */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-display font-semibold text-slate-800 dark:text-slate-250">
            Study Assistant Tools
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Tool 1 */}
            <motion.div 
              whileHover={{ scale: 1.015 }}
              onClick={() => onNav("questions")}
              className="bg-white dark:bg-slate-900 border border-slate-100 hover:border-indigo-100 dark:border-slate-800/80 dark:hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition-all shadow-2xs group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 rounded-xl group-hover:scale-110 transition-transform">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-medium text-slate-850 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    Important Questions
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Generates subject-topic exam questions with outline evaluations.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Tool 2 */}
            <motion.div 
              whileHover={{ scale: 1.015 }}
              onClick={() => onNav("notes")}
              className="bg-white dark:bg-slate-900 border border-slate-100 hover:border-indigo-100 dark:border-slate-800/80 dark:hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition-all shadow-2xs group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-medium text-slate-850 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    Exam Notes Generator
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Creates simplified exam-focused lecture handouts and formulas list.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Tool 3 */}
            <motion.div 
              whileHover={{ scale: 1.015 }}
              onClick={() => onNav("summarize")}
              className="bg-white dark:bg-slate-900 border border-slate-100 hover:border-indigo-100 dark:border-slate-800/80 dark:hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition-all shadow-2xs group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-50 dark:bg-teal-950/40 text-teal-500 dark:text-teal-400 rounded-xl group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-medium text-slate-850 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    Topic Summarizer
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Distills lecture scripts or long textbooks into acronym mnemonics.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Tool 4 */}
            <motion.div 
              whileHover={{ scale: 1.015 }}
              onClick={() => onNav("mindmap")}
              className="bg-white dark:bg-slate-900 border border-slate-100 hover:border-indigo-100 dark:border-slate-800/80 dark:hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition-all shadow-2xs group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-violet-50 dark:bg-violet-950/40 text-violet-500 dark:text-violet-400 rounded-xl group-hover:scale-110 transition-transform">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-medium text-slate-850 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    Interactive Mindmap
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Organizes concept trees visually with clickable nodes diagram.
                  </p>
                </div>
              </div>
            </motion.div>

          </div>

          <div className="bg-indigo-950 text-indigo-200 border border-indigo-900 rounded-2xl p-5 flex items-center/start gap-4">
            <Sparkles className="w-8 h-8 text-indigo-400 shrink-0" />
            <div>
              <h4 className="font-semibold text-slate-100 text-sm">Powered by Gemini AI</h4>
              <p className="text-xs text-indigo-300 mt-1 leading-normal">
                Every tool produces highly context-aware contents generated in real-time. If you haven't supplied your API key in Settings &gt; Secrets, the tools will elegantly showcase offline structured frameworks so you can still study!
              </p>
            </div>
          </div>
        </div>

        {/* Local Checklist planner */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-500" />
                <h3 className="font-display font-semibold text-slate-850 dark:text-slate-150">Study Checklist</h3>
              </div>
              <span className="text-[10px] font-mono bg-indigo-550 text-white dark:bg-indigo-650 px-2 py-0.5 rounded-full">
                {completedGoalsCount}/{goals.length} Done
              </span>
            </div>

            <form onSubmit={handleAddGoal} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Add a system or topic..."
                value={newGoalText}
                onChange={e => setNewGoalText(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800/90 border border-slate-200 dark:border-slate-850 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none rounded-xl dark:text-slate-200 transition"
              />
              <button 
                type="submit"
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <ul className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {goals.map(g => (
                <li 
                  key={g.id} 
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition duration-150 ${
                    g.done 
                    ? "bg-slate-50/80 dark:bg-slate-805 border-slate-100 dark:border-slate-800 text-slate-400 line-through" 
                    : "bg-white dark:bg-slate-880 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-350"
                  }`}
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={g.done}
                      onChange={() => handleToggleGoal(g.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="truncate max-w-[160px]">{g.text}</span>
                  </label>
                  
                  <button 
                    onClick={() => handleDeleteGoal(g.id)}
                    className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </li>
              ))}
              {goals.length === 0 && (
                <p className="text-xs text-center text-slate-400 py-6">Checklist is empty. Plan some study goals!</p>
              )}
            </ul>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/80 mt-4 pt-3 text-center">
            <span className="text-[10px] font-mono text-slate-400 block">STUDENT SUCCESS TOOL</span>
          </div>
        </div>

      </div>
    </div>
  );
}
