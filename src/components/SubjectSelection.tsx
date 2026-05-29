import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Code, Terminal, Brain, Sparkles, Landmark, Ruler, Orbit, 
  Dna, ArrowRight, HelpCircle, BookOpen, GitFork, 
  CheckCircle2, AlertTriangle, BookMarked, Zap, Lightbulb
} from "lucide-react";

interface SubjectSelectionProps {
  onSelectTopic: (subjectName: string, topicName: string, targetTool: "questions" | "notes" | "mindmap") => void;
}

interface SubjectDetail {
  id: string;
  name: string;
  shortDesc: string;
  icon: any;
  color: string;
  accentBg: string;
  textColor: string;
  syllabusOverview: string;
  examTrap: string;
  importantTopics: Array<{
    title: string;
    description: string;
  }>;
  quickFact: string;
}

const ACADEMIC_SUBJECTS: SubjectDetail[] = [
  {
    id: "python",
    name: "Python Programming",
    shortDesc: "Object-oriented structures, GIL bottlenecks, bytecode compiler loops, and comprehensions.",
    icon: Code,
    color: "from-blue-500 to-cyan-500",
    accentBg: "bg-blue-50 dark:bg-blue-950/20",
    textColor: "text-blue-700 dark:text-blue-400",
    syllabusOverview: "Covers Python reference counting models, object mutability scopes, decorator patterns, generator lazy evaluations, and dictionary hashing efficiencies.",
    examTrap: "Mutable defaults default: Never declare a function with a mutable list parameter (e.g. def foo(b=[])). Python compiles the reference once and persists it across calling scopes.",
    importantTopics: [
      { title: "Object Mutability & References", description: "How variables point to memory cells and when values update in-place." },
      { title: "Comprehensions vs Standard Loops", description: "Evaluating performance overhead differences inside the Python compiler." },
      { title: "Generators & Streaming Memory", description: "Leveraging yield functions to stream big files without RAM crashes." },
      { title: "Decorator Wrapper Functions", description: "Syntactic sugar wrapper scopes used for logger pipelines or parameter validation." }
    ],
    quickFact: "Python uses double-layer reference collections tracking and cyclical garbage collectors to clean dynamic heap RAM pointers."
  },
  {
    id: "c_programming",
    name: "C Programming",
    shortDesc: "Hardware boundaries, pointers dereferencing, heap malloc buffers, and structs alignment.",
    icon: Terminal,
    color: "from-slate-650 to-indigo-600",
    accentBg: "bg-slate-50 dark:bg-slate-900/30",
    textColor: "text-slate-700 dark:text-slate-300",
    syllabusOverview: "Grasp hardware-level variable addresses, dynamic allocation routines, buffer protections, structures contiguity patterns, and compiling linker targets.",
    examTrap: "Dangling pointer reference: Using pointers indices after free() has been executed. Always null-out freed memory pointers immediately (p = NULL) to block security leakage.",
    importantTopics: [
      { title: "Pointers & Dereferencing Addresses", description: "Using & and * operators to query physical cellular units in C memory." },
      { title: "Dynamic Malloc Heap allocation", description: "Defining variable ranges on heaps and manual cleanup guards to stop leakages." },
      { title: "Contiguous Memory Structs", description: "Geometrical variables bundling in C memory and byte boundaries padding rules." },
      { title: "Pointer Arithmetic Bounds", description: "How indexing arrays changes addresses based on core type sizeof multipliers." }
    ],
    quickFact: "Unlike garbage-collected runtimes, C runs compiling code directly onto virtual machines layouts without checking array index bounds."
  },
  {
    id: "ai",
    name: "Artificial Intelligence",
    shortDesc: "Supervised classifiers, backprop error calculus, weights biases multipliers, and layers.",
    icon: Brain,
    color: "from-purple-500 to-pink-500",
    accentBg: "bg-purple-50 dark:bg-purple-950/20",
    textColor: "text-purple-700 dark:text-purple-400",
    syllabusOverview: "Focuses on neural node backpropagation algorithms, loss optimization math, activation function shapes, training cycles, and regularization constraints.",
    examTrap: "Vanishing gradient limits: High-frequency sigmoidal compression models reduce error backpropagation values close to zero. Use ReLU activations in intermediate layers.",
    importantTopics: [
      { title: "Backpropagation Calculus Loops", description: "Using partial derivative chain rules to trace loss gradients reverse-wise." },
      { title: "Activations & Matrix Math", description: "Why non-linear functions (ReLU, Sigmoid, GeLU) allow networks to fit complex data limits." },
      { title: "Regularization & Overfitting", description: "Using dropout and weights penalties (L1/L2) to prevent noise memorization." },
      { title: "Supervised vs Reinforcement Learning", description: "Comparing class data regressions with physical environments reward loop states." }
    ],
    quickFact: "Deep learning computes forward loss predictions and optimizes weights parameters down steep statistical gradients."
  },
  {
    id: "civil",
    name: "Civil Engineering",
    shortDesc: "Solid truss joints, support forces reactions, Shear (SFD), bending stress profile (BMD).",
    icon: Landmark,
    color: "from-amber-600 to-orange-500",
    accentBg: "bg-amber-50 dark:bg-amber-950/15",
    textColor: "text-amber-700 dark:text-amber-400",
    syllabusOverview: "Study rigid mechanics static balances, sectional truss load calculations, horizontal beams bending profile integrals, and structural column buckling safety formulas.",
    examTrap: "Zero-force truss members: Do not overlook these structure links during truss load balance calculations. They support load stability under fluctuating wind paths.",
    importantTopics: [
      { title: "Static Equilibrium Reactions", description: "Balancing support pivots so net translational loads and angular moments equal zero." },
      { title: "Method of Joints & Sections", description: "Comparing local joint load vectors splits with structural sectional moment balances." },
      { title: "Shear & Bending Diagrams (SFD/BMD)", description: "Mapping shear profiles and max bending stresses under uniform loads (UDL)." },
      { title: "Zero Force Truss Members", description: "Locating support components that hold tension only during directional wind load spikes." }
    ],
    quickFact: "Rigid truss layouts assume load connectors behave as frictionless pins, directing force stresses entirely down component axial paths."
  },
  {
    id: "physics",
    name: "Physics (Mechanics)",
    shortDesc: "Incline planes gravity decomposition, friction coefficients limits, energy conservation.",
    icon: Orbit,
    color: "from-emerald-500 to-teal-500",
    accentBg: "bg-emerald-50 dark:bg-emerald-950/20",
    textColor: "text-emerald-700 dark:text-emerald-400",
    syllabusOverview: "Analyze kinetic vectors along sloped coordinate bounds, static/dynamic friction balance equations, conservative system work-energy theorem, and kinematics.",
    examTrap: "斜 Incline normal component: Incline normal surface reaction balances slope loading (Normal = mg cos θ). Do not simplify normal force to standard mg weight.",
    importantTopics: [
      { title: "Inclined plane Vector Splits", description: "Breaking down gravitational pull vectors into parallel sliding loads and normal forces." },
      { title: "Static vs Kinetic Friction limits", description: "Calculating dynamic coefficient resistance thresholds vs static lock forces." },
      { title: "Conservation of Mechanical Energy", description: "Tracing potential energy storage transfers into speed kinetic curves." },
      { title: "Newton's laws of Acceleration", description: "Solving multiple masses string pull acceleration rates using free-body FBD charts." }
    ],
    quickFact: "Mechanical energy translates Potential energy (mgh) to Kinetic speed (0.5mv²) when dissipative friction forces are zero."
  },
  {
    id: "biology",
    name: "Biology (Genetics & Cells)",
    shortDesc: "Chromatin PMAT division cycles, homologous chromosomes crossover, zygote diploids.",
    icon: Dna,
    color: "from-rose-500 to-red-500",
    accentBg: "bg-rose-50 dark:bg-rose-950/15",
    textColor: "text-rose-700 dark:text-rose-450",
    syllabusOverview: "Investigate mitosis chromosomal sequence, spindle microtubule divisions, meiosis crossing-over mechanisms, chromatid breaks, and somatic diploid copies variances.",
    examTrap: "Chromatid splitting differences: Mitosis separates sister chromatids cleanly, whereas Meiosis I separates maternal and paternal homologous chromosome pairs.",
    importantTopics: [
      { title: "Mitosis PMAT Chromosomes sequence", description: "Differentiating chromatin updates during Prophase, Metaphase, Anaphase, Telophase." },
      { title: "Meiosis Crossover & Diversity", description: "How Prophase I gene swaps yield high-scoring biological chromosome recombination variances." },
      { title: "Diploids clones vs Haploid gametes", description: "Mitosis somatic twin reproduction versus meiosis four genetic sperm/eggs." },
      { title: "Spindle Microtubules Pull Split", description: "How centromeric protein anchors pull chromatin fragments to opposite cell caps." }
    ],
    quickFact: "Cytokinesis finishes mitosis processes by pinching cytoplasmic membranes to isolate identical dual somatic clone nuclei cells."
  }
];

export default function SubjectSelection({ onSelectTopic }: SubjectSelectionProps) {
  const [selectedSub, setSelectedSub] = useState<SubjectDetail | null>(null);

  return (
    <div className="space-y-6" id="subjects-selection-container">
      {/* Dynamic Grid / Details View */}
      <AnimatePresence mode="wait">
        {!selectedSub ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Subject Select Header */}
            <div className="border-l-4 border-indigo-600 dark:border-indigo-400 pl-4 py-1">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-indigo-650 dark:text-indigo-400">Curriculum Mapping</span>
              <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100">Core Subject Syllabus Pages</h1>
              <p className="text-xs text-slate-505 dark:text-slate-400">Choose an academic subject area below to explore pre-loaded syllabus topics, and generate interactive exam preparation files immediately.</p>
            </div>

            {/* Dynamic cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {ACADEMIC_SUBJECTS.map((sub, index) => {
                const IconComponent = sub.icon;
                return (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedSub(sub)}
                    className="group bg-white/85 dark:bg-slate-850/85 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs hover:border-indigo-305 dark:hover:border-slate-700 transition duration-300 cursor-pointer flex flex-col justify-between hover:shadow-md h-[255px]"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${sub.color} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition`}>
                          <IconComponent className="w-5 h-5 stroke-[2px]" />
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-100/60 dark:bg-slate-800/60 px-2 py-0.5 rounded-md">Syllabus</span>
                      </div>

                      <div className="space-y-1">
                        <h2 className="text-sm font-display font-extrabold text-slate-900 dark:text-slate-105 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition">{sub.name}</h2>
                        <p className="text-[11.5px] leading-relaxed text-slate-500 dark:text-slate-400 pr-1">{sub.shortDesc}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      <span className="font-mono text-[10.5px]">4 Critical Exam Chapters</span>
                      <span className="flex items-center gap-1 group-hover:translate-x-1.5 transition">Explore page <ArrowRight className="w-3.5 h-3.5" /></span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="details"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            {/* Back to list button */}
            <button
              onClick={() => setSelectedSub(null)}
              className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer flex items-center gap-1.5 hover:-translate-x-1 transition"
            >
              ← Back to Subject Curriculum List
            </button>

            {/* Subject Banner Frame */}
            <div className={`bg-gradient-to-r ${selectedSub.color} p-6 md:p-8 rounded-2xl text-white shadow-xs space-y-4 relative overflow-hidden`}>
              <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-15 text-white">
                {React.createElement(selectedSub.icon, { className: "w-52 h-52 stroke-[1.5px]" })}
              </div>

              <div className="max-w-2xl space-y-2 relative z-10">
                <span className="text-[10px] font-mono tracking-widest uppercase bg-white/20 px-2.5 py-1 rounded-full font-bold">Academic Subject Dashboard</span>
                <h1 className="text-3xl font-display font-extrabold tracking-tight">{selectedSub.name}</h1>
                <p className="text-xs text-white/90 leading-relaxed font-medium">{selectedSub.shortDesc}</p>
              </div>

              <div className="flex flex-wrap gap-4 pt-2 relative z-10">
                <div className="bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-xl text-[11px] font-mono">
                  🔑 Key Exam Areas: <strong>{selectedSub.importantTopics.length} Units</strong>
                </div>
                <div className="bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-xl text-[11px] font-mono">
                  ⚡ Interactive Generators API: <strong>Active</strong>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Detailed Chapters column */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white/90 dark:bg-slate-850/90 backdrop-blur-md border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <BookMarked className="w-4 h-4 text-indigo-500" />
                    <h2 className="text-sm font-display font-bold text-slate-800 dark:text-slate-100">Syllabus Topic Explorer & Generation Hooks</h2>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Choose a critical exam-oriented chapter below. Clicking target utilities instantly configures study filters and returns pre-loaded formatted structures tailored to your selection.
                  </p>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedSub.importantTopics.map((topic, i) => (
                      <div key={i} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1 max-w-md">
                          <h3 className="text-xs font-display font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                            {topic.title}
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{topic.description}</p>
                        </div>

                        {/* Action buttons list */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => onSelectTopic(selectedSub.name, topic.title, "questions")}
                            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-slate-700 text-[10px] font-mono rounded-lg hover:text-indigo-650 dark:hover:text-indigo-400 text-slate-655 dark:text-slate-350 flex items-center gap-1 cursor-pointer transition"
                            title="Generate exam questions"
                          >
                            <HelpCircle className="w-3 h-3 text-indigo-500" />
                            + Exam Questions
                          </button>
                          <button
                            onClick={() => onSelectTopic(selectedSub.name, topic.title, "notes")}
                            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 hover:border-violet-405 dark:hover:border-slate-700 text-[10px] font-mono rounded-lg hover:text-violet-650 dark:hover:text-violet-400 text-slate-655 dark:text-slate-350 flex items-center gap-1 cursor-pointer transition"
                            title="Generate detailed study notes"
                          >
                            <BookOpen className="w-3 h-3 text-violet-500" />
                            + Revision Notes
                          </button>
                          <button
                            onClick={() => onSelectTopic(selectedSub.name, topic.title, "mindmap")}
                            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 hover:border-pink-355 dark:hover:border-slate-700 text-[10px] font-mono rounded-lg hover:text-pink-650 dark:hover:text-pink-400 text-slate-655 dark:text-slate-350 flex items-center gap-1 cursor-pointer transition"
                            title="Sketch visual mindmap"
                          >
                            <GitFork className="w-3 h-3 text-pink-500 animate-pulse" />
                            + Mind Map
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sub Heading description paragraph */}
                <div className="p-4 bg-slate-50/50 dark:bg-slate-905 border border-slate-200/50 dark:border-slate-850 rounded-xl flex items-start gap-3">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-[11.5px] font-mono font-bold uppercase tracking-wider text-slate-650 dark:text-slate-300">Quick Curriculum Insights</h4>
                    <p className="text-[11px] leading-relaxed text-slate-505 dark:text-slate-400">{selectedSub.quickFact}</p>
                  </div>
                </div>
              </div>

              {/* Side Column with Tips & Traps */}
              <div className="lg:col-span-4 space-y-6">
                {/* Professor's exam trap */}
                <div className="bg-rose-50/55 dark:bg-rose-950/10 border border-rose-200/40 dark:border-rose-900/35 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-rose-200/20 dark:border-rose-900/20 pb-3 text-rose-700 dark:text-rose-455 font-display font-extrabold text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>University Exam Traps</span>
                  </div>
                  <p className="text-[11.5px] leading-relaxed text-rose-800 dark:text-rose-350 font-medium">
                    {selectedSub.examTrap}
                  </p>
                  <div className="text-[9.5px] font-mono uppercase tracking-wider bg-rose-100/40 dark:bg-rose-955/20 px-2.5 py-1 inline-block rounded text-rose-700">
                    Avoid standard syllabus bugs
                  </div>
                </div>

                {/* Summary Outline Box */}
                <div className="bg-white dark:bg-slate-850 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-505 block">Syllabus Focus</span>
                  <h4 className="font-display font-bold text-xs text-slate-800 dark:text-slate-100">Weekly Target Focus</h4>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                    {selectedSub.syllabusOverview}
                  </p>
                  <div className="pt-2 flex items-center gap-1.5 text-[10.5px] text-indigo-600 font-semibold cursor-pointer" onClick={() => onSelectTopic(selectedSub.name, "General Foundations", "notes")}>
                    Fast-track foundations note compile <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
