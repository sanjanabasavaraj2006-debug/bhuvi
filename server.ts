import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client
let aiInstance: GoogleGenAI | null = null;
function getGeminiAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Helper to wrap a promise in a timeout to prevent infinite blocking on network issues
function withTimeout<T>(promise: Promise<T>, ms: number = 8000, contextName: string = "Gemini API Call"): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${contextName} timed out after ${ms}ms due to network environment constraints.`));
    }, ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

// Check api availability status
app.get("/api/status", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({ status: "ok", hasApiKey: hasKey });
});

// Smart, subject-aware mock generator helpers for our 6 core subjects
function getSubjectMockQuestions(subject: string, topic: string) {
  const normSub = (subject || "General").toLowerCase();
  const tTitle = topic || "Foundations";
  
  if (normSub.includes("python")) {
    return {
      subject: "Python Programming",
      topic: tTitle,
      questions: [
        {
          id: "py1",
          question: `Explain how to implement and use ${tTitle} in Python (e.g. wrapper decorators). Write a clean example showing wrappers or syntactic sugar.`,
          difficulty: "Medium",
          importantPoints: [
            "Using the @ decorator syntax as clean syntactic sugar.",
            "Defining nested wrapper functions accepting *args and **kwargs for generic param sizing.",
            "Returning the nested function from the outer decorator function."
          ],
          sampleAnswerOutline: "Explain that a decorator is a function taking another function as an argument and extending its behavior. Provide code: def my_decorator(func): def wrapper(*args, ...): return func(*args, ...) return wrapper."
        },
        {
          id: "py2",
          question: `Under what circumstances is list comprehension preferred in Python over traditional for-loops, and how does it affect memory?`,
          difficulty: "Easy",
          importantPoints: [
            "Concise, readable single-line syntax for generating lists.",
            "Avoids the overhead of invoking .append() repeatedly in Python bytecode loops.",
            "Use of generator expressions with parentheses to activate lazy evaluation."
          ],
          sampleAnswerOutline: "Construct a comparison table. Traditional loops take multiple lines, whereas comprehensions do it in one: [x*x for x in data if x > 0]. For larger inputs, highlight how changing brackets to parentheses activates memory-efficient generator objects."
        },
        {
          id: "py3",
          question: `How does Python's Global Interpreter Lock (GIL) affect multithreading vs multiprocessing architectures?`,
          difficulty: "Hard",
          importantPoints: [
            "GIL prevents multiple native CPU threads from executing bytecodes concurrently.",
            "CPU-bound tasks do not benefit from standard multithreading and require multiprocessing pools.",
            "I/O-bound tasks benefit from multithreading since the GIL is released during network wait states."
          ],
          sampleAnswerOutline: "Acknowledge the thread execution lock mechanism. Showcase that multithreading runs on a single core for CPU intensive bounds. Suggest using the `multiprocessing` library to spawn distinct OS processes."
        }
      ]
    };
  } else if (normSub.includes("c pr") || normSub === "c" || normSub.includes("cprogramming")) {
    return {
      subject: "C Programming",
      topic: tTitle,
      questions: [
        {
          id: "c1",
          question: `Explain pointers and dynamic memory allocation routines in C as they apply to ${tTitle}.`,
          difficulty: "Hard",
          importantPoints: [
            "Retrieving variables RAM addresses with operator (&) and dereferencing pointers with (*).",
            "Allocating physical heaps with malloc() / calloc() and cleaning resources by calling free().",
            "Handling dangerous dangling references by resetting freed pointers to NULL."
          ],
          sampleAnswerOutline: "Declare pointer syntax: int *ptr. Show dynamic heap allocation: ptr = (int*)malloc(sizeof(int) * 10). Write safety checks to verify ptr != NULL before assigning values. Call free(ptr) at the end."
        },
        {
          id: "c2",
          question: `Compare Passing by Value vs Passing by Reference (using pointers) in C parameters.`,
          difficulty: "Medium",
          importantPoints: [
            "Passing by value copies variables, leaving original argument contents in the caller untouched.",
            "Passing by reference passes pointer addresses, enabling direct modifications of caller storage cells.",
            "Passing by reference is significantly faster and uses less CPU stack space for bulky structs."
          ],
          sampleAnswerOutline: "Produce two clear function blocks: void modify_val(int x) and void modify_ref(int *ptr). Perform value alterations inside each and trace output logs sequentially."
        },
        {
          id: "c3",
          question: `What are Structs in C and how are they contiguous in memory?`,
          difficulty: "Easy",
          importantPoints: [
            "Using the 'struct' keyword to hold collections of heterogeneous data variables.",
            "Understanding contiguous spacing in RAM and structural alignment padding.",
            "Using member access selectors (dot operator vs arrow selector for pointers)."
          ],
          sampleAnswerOutline: "Define structural format: struct Student { int id; float gpa; }. Showcase that variables are packed next to each other. Point out accessing member fields."
        }
      ]
    };
  } else if (normSub.includes("artificial") || normSub.includes("ai")) {
    return {
      subject: "Artificial Intelligence",
      topic: tTitle,
      questions: [
        {
          id: "ai1",
          question: `Describe the role of backpropagation and loss optimization under ${tTitle} algorithms.`,
          difficulty: "Hard",
          importantPoints: [
            "Backward pass calculation of error derivatives using the mathematical Chain Rule.",
            "Adjusting biases and weights using Gradient Descent: W = W - learning_rate * dW.",
            "Preventing weights explosion using L1, L2 regularization or dropout nodes."
          ],
          sampleAnswerOutline: "Sequence training steps: Step 1: Forward propagation to predict outputs. Step 2: Calculate target loss (Cross-Entropy). Step 3: Compute gradients from output back to input. Step 4: Subtract learning rates ratios."
        },
        {
          id: "ai2",
          question: `Compare supervised, unsupervised, and reinforcement learning paradigms in AI.`,
          difficulty: "Easy",
          importantPoints: [
            "Supervised models require labeled inputs and outputs (mapping X to Y).",
            "Unsupervised models seek natural group clusters in unlabeled databases.",
            "Reinforcement learning operates on reward feedback loops to optimize agent policy paths."
          ],
          sampleAnswerOutline: "Provide clear summaries for each model type. Give classic instances: Spam email sorting for supervised, customer demographics group splits for unsupervised, and gameplay chess agents for reinforcement."
        }
      ]
    };
  } else if (normSub.includes("civil")) {
    return {
      subject: "Civil Engineering",
      topic: tTitle,
      questions: [
        {
          id: "cv1",
          question: `What are static equilibrium equations and how do they apply to structural structures loaded with ${tTitle}?`,
          difficulty: "Medium",
          importantPoints: [
            "Satisfying rigid conditions: Sum of vertical forces, horizontal forces, and pivots moments must equal zero.",
            "Dividing load evaluations: Method of Joints vs Method of Sections.",
            "Distinguishing tension forces (pulling fibers apart) from compression stresses (squeezing fibers)."
          ],
          sampleAnswerOutline: "Isolate structural load forces. Step 1: Formulate supports reaction coefficients using entire rigid body moments balancing. Step 2: Resolve joints values or section cuts to isolate desired internal beam forces."
        },
        {
          id: "cv2",
          question: `Describe Shear Force Diagrams (SFD) and Bending Moment Diagrams (BMD) for cantilever beams.`,
          difficulty: "Hard",
          importantPoints: [
            "Computing internal shear loads at any section coordinate across horizontal spans.",
            "Evaluating moments profile where bending stresses reach maximum thresholds under uniform loads.",
            "Locating points of contraflexure where internal bending moments switch signs."
          ],
          sampleAnswerOutline: "Construct load expressions. Integrate shear formulas to obtain bending profile curves. Plot the diagrams aligning coordinates under the physical cantilever structure."
        }
      ]
    };
  } else if (normSub.includes("physics")) {
    return {
      subject: "Physics",
      topic: tTitle,
      questions: [
        {
          id: "ph1",
          question: `State Newton's laws of motion and describe gravity coordinate splits under ${tTitle} plane gravity.`,
          difficulty: "Medium",
          importantPoints: [
            "Splitting uniform weight load downward: Parallel (mg sin θ) and perpendicular (mg cos θ).",
            "Frictional forces behavior: Static threshold (f_s <= μ_s * Normal) vs sliding kinetic friction (f_k = μ_k * Normal).",
            "Setting up dynamic Newton equations: Force Net = Mass * Acceleration."
          ],
          sampleAnswerOutline: "Draw a clean free body vector diagram. Isolate vertical vector coordinates to find the surface Normal Force reaction. Construct parallel expressions substituting the resolved friction coefficients."
        },
        {
          id: "ph2",
          question: `Explain the Law of Conservation of Energy and apply it to kinetic/potential transformations.`,
          difficulty: "Easy",
          importantPoints: [
            "Conservative systems maintain constant total mechanical energy (Potential Energy + Kinetic Energy).",
            "Potential energy expression: PE = m * g * h, and Kinetic Energy expression: KE = 0.5 * m * v².",
            "Dissipative forces (like air resistance or slide friction) convert macro energy into heat fields."
          ],
          sampleAnswerOutline: "Write total energizing equation: E_initial = E_final. Replace states at peaks (pure PE) and base valleys (pure KE) to solve for drop terminal speeds."
        }
      ]
    };
  } else if (normSub.includes("biology")) {
    return {
      subject: "Biology",
      topic: tTitle,
      questions: [
        {
          id: "bi1",
          question: `Trace cell chromosomes alignment and movement during the four sub stages of Mitosis under ${tTitle}.`,
          difficulty: "Easy",
          importantPoints: [
            "Prophase dissolves nuclear barriers and condenses chromatin coils into distinct chromosomes.",
            "Metaphase aligns chromatids along the equatorial plane via spindle threads.",
            "Anaphase pulls sisters apart, and Telophase reforms cell nucleus guards."
          ],
          sampleAnswerOutline: "Format the explanation chronologically. Devote one structured section to each acronym phase of PMAT, explaining chromosomes actions, centromeres attachments, and cytokinesis onset."
        },
        {
          id: "bi2",
          question: `Compare Mitosis cell division with Meiosis in terms of diploid counts and gametes diversity.`,
          difficulty: "Medium",
          importantPoints: [
            "Mitosis yields 2 identical somatic clones with diploid sets (2n).",
            "Meiosis produces 4 genetically diverse gametes containing haploid sets (n).",
            "Meiosis introduces biological genetic diversity through homologous chromosomes crossing-over."
          ],
          sampleAnswerOutline: "Produce a comparative matrix. Highlight chromosome alignment styles. Pinpoint Meiosis I and II as distinct stages yielding gene recombined haploid gametes."
        }
      ]
    };
  }
  
  // Standard generic backup
  return {
    subject: subject || "Academic Review",
    topic: tTitle,
    questions: [
      {
        id: "gen1",
        question: `What are the core foundational pillars and parameters of ${tTitle} inside ${subject}?`,
        difficulty: "Medium",
        importantPoints: [
          "Understanding exact glossary definitions and formulas variables.",
          "Describing underlying structural architectures.",
          "Applying concepts to solve standard syllabus tasks cleanly."
        ],
        sampleAnswerOutline: "Outline the definition accurately. Enumerate 3 key attributes. Illustrate with a clear conceptual block diagram."
      }
    ]
  };
}

function getSubjectMockNotes(subject: string, topic: string) {
  const normSub = (subject || "General").toLowerCase();
  const tTitle = topic || "Syllabus Review";

  if (normSub.includes("python")) {
    return {
      topic: tTitle,
      introduction: "Python programming is a readable, dynamic, high-level language utilizing automatic object model referencing and clean scripts scaling loops.",
      sections: [
        {
          subHeading: "Memory References & Mutable Structures",
          keyPoints: [
            "All variables in Python acts as pointers targeting dynamic objects located on runtime piles.",
            "Mutable objects (lists, dicts, sets) can be altered directly in-place, risking unintended mutations across function references.",
            "Immutable types (tuples, strings, freeze integers) block altering, allocating new addresses on modify operations."
          ],
          formulaOrKeyTerms: [
            "Mutable: Variable containers mutable in physical memory post-declaration.",
            "Ref Counting GC: Automated Garbage Collector using object reference tallies."
          ]
        },
        {
          subHeading: "轻量 Efficiency structures (Comprehensions)",
          keyPoints: [
            "Comprehensions allocate arrays using direct underlying C implementations, bypassing loop bytecodes.",
            "Generator expressions with brackets perform lazy evaluations, loading stream nodes iteratively to prevent memory exhaustion."
          ],
          formulaOrKeyTerms: [
            "List Comprehension: Syntax [x for x in source if condition].",
            "Generator: Iterative structure using the 'yield' keyword to load streams."
          ]
        }
      ],
      quickSummary: "To master Python Programming, understand references mutability safeguards, exploit native list comprehensions, and leverage generators to keep your scripts memory footprints highly efficient.",
      studyTip: "Syllabus Tip: Exams love testing mutable defaults trap. Never write def add_item(itm, lst=[]). Use lst=None instead, and check inside!"
    };
  } else if (normSub.includes("c pr") || normSub === "c" || normSub.includes("cprogramming")) {
    return {
      topic: tTitle,
      introduction: "C language is a direct hardware interface deliverable compiling scripts into raw binary commands. It is prized for total performance speeds and low memory footprint control.",
      sections: [
        {
          subHeading: "Pointer Addresses & Dereferencing Operations",
          keyPoints: [
            "Pointers are structured variables containing actual 64-bit hardware memory addresses.",
            "Dereferencing reads directly from the RAM address, making values changes inside functions immediately globally visible.",
            "Uninitialized wild pointers reference random cells, resulting in Segmentation Fault bounds crashes at runtime."
          ],
          formulaOrKeyTerms: [
            "Address-of operator (&): Extracts physical RAM address values from local variables.",
            "Dereferencing pointer (*): Accesses the pointed-to bytes immediately."
          ]
        },
        {
          subHeading: "Heap Allocation Management (Malloc & Free)",
          keyPoints: [
            "Allocates specific sizes on dynamic stacks: int *p = (int*)malloc(10 * sizeof(int)).",
            "Freeing storage ensures heap spaces are returned, eliminating slow leaks that degrade runtime stability."
          ],
          formulaOrKeyTerms: [
            "Dynamic Malloc: Allocates contiguous bytes of memory on heap space.",
            "Memory Leak: Failing to call free() before losing pointers indices references."
          ]
        }
      ],
      quickSummary: "C Programming demands strict hardware and memory tracing. Plan pointer initialization paths defensively, null-validate malloc bounds, and always free() unused memory pointers.",
      studyTip: "Exam Warning: Always check if malloc returned NULL before saving values. Examiners regularly slash grades for omitting pointer null checking boundaries."
    };
  } else if (normSub.includes("artificial") || normSub.includes("ai")) {
    return {
      topic: tTitle,
      introduction: "Artificial Intelligence mimics cognitive functions using statistical matrices. Its modern focus is deep learning, modeling data shapes through neural structures.",
      sections: [
        {
          subHeading: "Neural Weights & Layers Activations",
          keyPoints: [
            "Deep layers use mathematical nodes applying weighted sums and offsets: Y = W * X + b.",
            "Incorporate activation parameters (ReLU, Sigmoid) to introduce non-linear modeling bounds to the network.",
            "Computes model performance differentials using custom penalty indexes like Cross Entropy loss."
          ],
          formulaOrKeyTerms: [
            "ReLU Function: f(x) = max(0, x), preventing vanishing gradients on positive inputs.",
            "Loss Score: Penalty indexes measuring predictions offset margins during backpropagation."
          ]
        },
        {
          subHeading: "Backpropagation Gradient Loop Steps",
          keyPoints: [
            "Uses calculus chain rules starting from loss outputs to calculate model weights partial derivatives.",
            "Adjusts parameters using learning rate vectors: Weight = Weight - alpha * delta_weight."
          ],
          formulaOrKeyTerms: [
            "Chain Rule: Computing continuous derivatives down layer graphs.",
            "Gradient Descent: Iteratively stepping weights down the loss slopes."
          ]
        }
      ],
      quickSummary: "AI training uses forward passes to predict outputs and backward gradient iterations to trace errors backwards. Use dropouts and regularizations to protect models from overfitting.",
      studyTip: "Revision Focus: Examiners expect you to outline Backpropagation precisely. Always describe it as calculating parameters gradients from the output nodes reverse toward inputs."
    };
  } else if (normSub.includes("civil")) {
    return {
      topic: tTitle,
      introduction: "Civil Engineering maps loads distributions down structural joints, verifying static balances to ensure steel frames, bridges, and works stay stable under wind or seismic actions.",
      sections: [
        {
          subHeading: "Static Equilibrium & Joint Balances",
          keyPoints: [
            "Rigid structural mechanics demand Net Force Sums and Net Moments equal zero on all planes.",
            " axial trusses are solved joints-by-joints under isolated coordinates constraints.",
            "Compressive forces squeeze load bearing columns; tensile loads pull steel cables apart."
          ],
          formulaOrKeyTerms: [
            "Static Equilibrium: Sum(Forces) = 0 and Sum(Moments) = 0.",
            "Axial Force: Load pulling or pushing directly down member centers."
          ]
        },
        {
          subHeading: "Shear Forces & Bending Stress in Horizontal Beams",
          keyPoints: [
            "Shear forces change dynamically based on load placement and supports reactions.",
            "Bending streses reachสูงสุด borders along outer flanges, calculated through geometrical section profiles moments."
          ],
          formulaOrKeyTerms: [
            "Flexure Formula: Stress = M * y / I.",
            "UDL (Uniformly Distributed Load): Load spread evenly along beam spaces."
          ]
        }
      ],
      quickSummary: "Civil structural engineering centers on load equilibrium patterns. Isolate reacts moments early, select optimal cross-sections configurations, and track tension-compression bounds.",
      studyTip: "Core Exam Trap: Zero force members in truss structures are not useless. They prevent buckling collapse under severe wind speeds. Don't label them as 'unnecessary'!"
    };
  } else if (normSub.includes("physics")) {
    return {
      topic: tTitle,
      introduction: "Physics formalizes experimental interactions into algebraic models. It provides mathematical tools for calculating velocities, kinematics, forces, and thermodynamics values.",
      sections: [
        {
          subHeading: "Classical Mechanics & Coordinate Force Splits",
          keyPoints: [
            "Weight loads down inclined planes decompose to: Parallel mg sin(θ) and perpendicular mg cos(θ).",
            "Frictional coefficient bounds restrict motion: static thresholds exceed kinetic motion drag bounds.",
            "Free body coordinate alignment keeps gravity equations simple."
          ],
          formulaOrKeyTerms: [
            "Inclined Weight Parallel: F_p = m * g * sin(θ) dragging mass down slopes.",
            "Static Friction Bounds: F_friction <= mu_s * Normal Reaction."
          ]
        },
        {
          subHeading: "Mechanical Energy Conservation",
          keyPoints: [
            "Total mechanical energy (PE + KE) remains perfectly constant under purely conservative fields.",
            "Dissipative thermal losses occur when friction or air resistance dampens sliding tracks."
          ],
          formulaOrKeyTerms: [
            "PE Limit: m * g * h, representing height potential storage.",
            "KE Limit: 1/2 * m * v², representing kinetic velocity storage."
          ]
        }
      ],
      quickSummary: "Mastering Classical Mechanics requires sketching complete vector diagrams, splitting load coordinates, and matching initial energies with output energy formulations.",
      studyTip: "Incline Normal Tip: Surface reaction Normal on inclined plane balances weight: N = mg cos(θ). Never simplify it to basic mg unless inclined angle is exactly horizontal!"
    };
  } else if (normSub.includes("biology")) {
    return {
      topic: tTitle,
      introduction: "Biology analyzes biological cellular systems, with a core focus on molecular division sequences (Mitosis & Meiosis) that propagate identical dna clone cells.",
      sections: [
        {
          subHeading: "The Chromosomal Stages of Mitosis (PMAT)",
          keyPoints: [
            "Prophase condenses loose chromosomes strands and forms spindle microtubule centrioles.",
            "Metaphase aligns chromatids along the cell's center plate.",
            "Anaphase pulls sister chromatids to poles, and Telophase spawns twin nucleus barriers."
          ],
          formulaOrKeyTerms: [
            "Sister Chromatids: Duplicated genetic strands joined at centromeres.",
            "Mitotic Spindles: Protein threads that pull chromatids to cellular poles."
          ]
        },
        {
          subHeading: "Mitosis vs Meiosis Cell Divisions",
          keyPoints: [
            "Mitosis yields 2 identical somatic diploids (2n) for growth or tissue repairs.",
            "Meiosis divides twice to produce 4 genetically unique haploid gamete eggs/sperm (n).",
            "Crossovers in Meiosis Prophase I generate high genetic variety."
          ],
          formulaOrKeyTerms: [
            "Diploid Count (2n): Possessing pairs of chromosomal groups.",
            "Haploid Count (n): Single sets of genetic chromatin material."
          ]
        }
      ],
      quickSummary: "Biologic division is structured using PMAT chronological cycles. Mitosis tracks somatic clones growth, while Meiosis handles haploid gamete variations for sexual replication.",
      studyTip: "High Score Tip: Do not mix chromatids splitting with chromosomes splitting. Mitosis separates chromatids, whereas Meiosis I separates homologous chromosomes pairs!"
    };
  }

  // General backup notes
  return {
    topic: tTitle,
    introduction: `Exam notes for ${tTitle} within ${subject || "general study themes"}, condensed down into clear, high-scoring checkpoints.`,
    sections: [
      {
        subHeading: "Foundational Glossary & Core Concepts",
        keyPoints: [
          "Understanding exact syllabus definitions is key to securing solid marks.",
          "Identify critical variables, constants, and parameters during initial study reads."
        ],
        formulaOrKeyTerms: [
          "Primary Axis: Ground coordinate lines for loads measurements.",
          "Standard Ratio: Structural scale comparison coefficients."
        ]
      }
    ],
    quickSummary: `To master ${tTitle}, focus on how its individual components interact, avoid mixing up unit coefficients, and practice active revision checklists regularly.`,
    studyTip: "General Revision Tip: Highlight the core formulas in yellow and recall them once per day; studies show repetition inside 24-hour cycles spikes memory storage."
  };
}

function getSubjectMockSummary(subject: string, text: string) {
  const normSub = (subject || "General").toLowerCase();
  const brief = text.length > 80 ? text.substring(0, 80) + "..." : text;
  
  if (normSub.includes("python")) {
    return {
      topicSummary: `Structured summary of Python reading: "${brief}". Summarizes variable bounds, clean coding practices, mutable object operations, code readability, and optimization techniques.`,
      keyTakeaways: [
        "Python leverages list/dictionary comprehensions to deliver clean, optimized runtime execution.",
        "Variables in Python act as object references; mutable types (list, dict) change in-place and can cause side effects across function parameters.",
        "Writing Pythonic code means prioritizing readability, using built-in iterators, and leveraging generators."
      ],
      simplifiedPoints: [
        {
          concept: "Pythonic Code",
          explanation: "Incorporate native idioms (like list comprehensions) to make code concise and highly performant."
        },
        {
          concept: "Garbage Collection",
          explanation: "Automated heap clean up based on reference counting and cyclical reference scanners."
        }
      ],
      mnemonicDevice: "P-Y-T-H-O-N: Parameterize inputs, Yield generators, Type check, Use Hashing, Optimize complexity, and Nest clean closures."
    };
  } else if (normSub.includes("c pr") || normSub === "c" || normSub.includes("cprogramming")) {
    return {
      topicSummary: `Condensed abstract of C code/text: "${brief}". Targets physical pointer references, safety constraints on dynamic allocation buffers, compile rules, and register bindings.`,
      keyTakeaways: [
        "Pointers are the core of C; they direct CPU execution immediately to memory addresses, guaranteeing unmatched speeds.",
        "Dynamic allocation via malloc() and safety validations keeps heap utilization efficient under small device bounds.",
        "Buffer overflows occur when arrays are written past their set physical limitations, representing prime security risks."
      ],
      simplifiedPoints: [
        {
          concept: "Dangling Pointer",
          explanation: "A pointer that points to a memory location that has already been deallocated using free()."
        },
        {
          concept: "Segmentation Fault",
          explanation: "A runtime error caused when a program tries to access a restricted or unallocated space in RAM."
        }
      ],
      mnemonicDevice: "P-O-I-N-T: Pointer allocation, Memory Optimization, Initialize pointers, Null-check guards, and Terminate leaks."
    };
  } else if (normSub.includes("artificial") || normSub.includes("ai")) {
    return {
      topicSummary: `Condensed abstract of AI concept text: "${brief}". Evaluates deep layers parameters learning, weights bias backpropagation steps, activation selections, and validation sets.`,
      keyTakeaways: [
        "Deep learning leverages continuous gradient updates to minimize loss functions across linear matrices.",
        "Activation layers introduce non-linear mapping bounds to help networks model highly complex decision boundaries.",
        "Sufficient validation bounds prevent overfitting where models memorize noise vectors instead of learning core patterns."
      ],
      simplifiedPoints: [
        {
          concept: "Backpropagation",
          explanation: "The calculus mechanism where error derivatives are fed backwards to compute partial derivatives for weights updates."
        },
        {
          concept: "Regularization",
          explanation: "Techniques (L1, L2, Dropout) added to penalize complex parameters, mitigating memorization risks."
        }
      ],
      mnemonicDevice: "N-E-U-R-A-L: Nest nodes, Evaluate loss, Update weights, ReLU activation, Analyze bias, and Learn continuously."
    };
  } else if (normSub.includes("civil")) {
    return {
      topicSummary: `Engineering summary of solids analysis text: "${brief}". Identifies rigid body balance requirements, truss loading limits, tension-compression ratios, and beams stress distributions.`,
      keyTakeaways: [
        "Static load balances ensure structural bodies satisfy Net Sum Zero equations across all translational axes and moments.",
        "Tensile forces pull member filaments apart; compressive stresses squeeze member molecules together.",
        "Structural engineering analyzes Shear Force (SFD) and Bending Moment Diagrams (BMD) to select optimal beam profiles."
      ],
      simplifiedPoints: [
        {
          concept: "Moment of Inertia",
          explanation: "A structural measure of a beam section's geometric layout resistance to bending stresses."
        },
        {
          concept: "Centroid",
          explanation: "The physical geometric center of an irregular area where static balance resolves."
        }
      ],
      mnemonicDevice: "L-O-A-D: Limit stresses, Organize reactions, Analyze joints, and Design supports."
    };
  } else if (normSub.includes("physics")) {
    return {
      topicSummary: `Quantitative abstract of physics reading: "${brief}". Outlines force equations, frictionless plane angles decomposition, conservation laws, and kinetic-potential energy transformations.`,
      keyTakeaways: [
        "Newton's laws compose classical mechanics: forces are vector quantities requiring coordinate decomposition.",
        "Conservative forces (like gravity or spring tensions) conserve total mechanical energy throughout sliding trajectories.",
        "Normal forces represent hardware reactions perpendicular to the slope, decreasing as inclined angles grow."
      ],
      simplifiedPoints: [
        {
          concept: "Free-Body Diagram",
          explanation: "A simplified sketch illustrating all external vector forces acting concurrently on a system."
        },
        {
          concept: "Work-Energy Theorem",
          explanation: "The physical rule state that net work performed by system forces equals the overall change in kinetic energy."
        }
      ],
      mnemonicDevice: "F-O-R-C-E: Find coordinate axis, Outline vector loads, Resolve component bounds, Calculate net loads, and Evaluate acceleration."
    };
  } else if (normSub.includes("biology")) {
    return {
      topicSummary: `Structured summary of biological processes: "${brief}". Explores zygote growth, diploid cell replication sequences, chromosomes alignments, and genetic transfers.`,
      keyTakeaways: [
        "Mitosis is asexual diploid somatic clone replication, supporting tissue growth and wound restoration.",
        "Spindle fibers connect to the chromosome's centromere, exerting tension to divide genetic sister chromatids cleanly.",
        "Meiosis splits chromatin twice, producing four individual haploid gamete cells with genetic variances."
      ],
      simplifiedPoints: [
        {
          concept: "Chromatid",
          explanation: "One of the two identical biological strands of a duplicated chromosome joined at the centromere."
        },
        {
          concept: "Cytokinesis",
          explanation: "The final cellular process that physically pinches the cytoplasm to split one cell into two distinct bodies."
        }
      ],
      mnemonicDevice: "C-E-L-L-S: Chromatids condense, Equatorial alignment, Longitudinal splitting, Lobe reformations, and Somatic clones."
    };
  }

  // Generic summary fallback:
  return {
    topicSummary: `Revision summary for reading: "${brief}". Breaks down core vocabulary, extracts key lessons, and defines key glossary terms.`,
    keyTakeaways: [
      "Breaking complex topics into bite-sized summaries triggers immediate memory recall improvements.",
      "Isolating variables prevents cognitive overload during tight revision sessions.",
      "Summaries act as excellent long-term retention benchmarks."
    ],
    simplifiedPoints: [
      {
        concept: "Concept Deconstruction",
        explanation: "Splitting difficult chapters into atomic terms that can be studied in under 1 minute."
      },
      {
        concept: "Memory Hook",
        explanation: "Using acronym mnemonics to fast-track active retrieval capabilities during exams."
      }
    ],
    mnemonicDevice: "R-E-C-A-L-L: Read content, Extract terms, Categorize, Active testing, Link models, and Log summaries."
  };
}

function getSubjectMockMindmap(subject: string, topic: string) {
  const normSub = (subject || "General").toLowerCase();
  const rootName = topic || `${subject} Map`;
  
  if (normSub.includes("python")) {
    return {
      rootName,
      description: "Python Programming conceptual hierarchy tree map",
      children: [
        {
          name: "Foundational Syntax",
          description: "Core structural building blocks of scripts",
          children: [
            { name: "Object References", description: "Reference counts and immutable bindings" },
            { name: "Data Structures", description: "Python lists, tuples, dicts, and set hashing speeds" }
          ]
        },
        {
          name: "Advance Code Design",
          description: "Writing lightweight high-yield modules",
          children: [
            { name: "Wrap Decorators", description: "Function wrappers wrapping code with @ notation" },
            { name: "Yield Generators", description: "Streaming files iteratively to bypass physical data limits" }
          ]
        },
        {
          name: "Exam Traps",
          description: "Prone bugs tested under tight conditions",
          children: [
            { name: "Mutable defaults default trap", description: "Setting def arg = [] can poison parameter scopes" },
            { name: "Shallow vs Deep Copy", description: "Modifying nested lists copies nested references too" }
          ]
        }
      ]
    };
  } else if (normSub.includes("c pr") || normSub === "c" || normSub.includes("cprogramming")) {
    return {
      rootName,
      description: "Compiled C Programming language structural concepts map",
      children: [
        {
          name: "Direct Access Memory",
          description: "Tracing hardware references directly",
          children: [
            { name: "Addresses and Pins (&/*)", description: "Extracting cell coords and dereferencing variables" },
            { name: "Pointer Arithmetic", description: "Adding indices increments by actual byte sizes" }
          ]
        },
        {
          name: "Dynamic Heap Buffer",
          description: "Managing custom runtime memory blocks",
          children: [
            { name: "Malloc & Free", description: "Explicit allocating on hep and calling free() to clean memory" },
            { name: "NULL Check Validation", description: "Verifying allocation succeeded before referencing pointer variables" }
          ]
        },
        {
          name: "Professor Lab Pitfalls",
          description: "C compiler crashes and security pitfalls",
          children: [
            { name: "Dangling Pointers", description: "Using pointer values after deleting original target buffers" },
            { name: "Buffer Overflow", description: "Writing characters past allocated array borders" }
          ]
        }
      ]
    };
  } else if (normSub.includes("artificial") || normSub.includes("ai")) {
    return {
      rootName,
      description: "Artificial Intelligence machine learning concepts map",
      children: [
        {
          name: "Trainable Parameters",
          description: "Matrix elements optimized during epochs",
          children: [
            { name: "Biases & Weights (W/b)", description: "Synthetic connections adjusted to model datasets" },
            { name: "Weights Optimization", description: "Applying computed gradients in the backward cycle" }
          ]
        },
        {
          name: "Optimization Math",
          description: "Minimizing loss functions sequentially",
          children: [
            { name: "Gradient Descent", description: "Updating weights based on learning rate: w = w - lr * dw" },
            { name: "Calculus Chain Rule", description: "Computing derivatives backward through connected nodes" }
          ]
        },
        {
          name: "Examiner Hard Cases",
          description: "Theoretical network failures",
          children: [
            { name: "Vanishing Gradients", description: "Sigmoids squeezing gradients close to 0 under deep stacks" },
            { name: "Overfitting memorization", description: "Applying L2 regularizations or dropouts to maintain general bounds" }
          ]
        }
      ]
    };
  } else if (normSub.includes("civil")) {
    return {
      rootName,
      description: "Civil Engineering loaded structures concept mapping",
      children: [
        {
          name: "Static Equilibrium",
          description: "Fulfilling rigid physical balance parameters",
          children: [
            { name: "Forces Balance Net Zero", description: "Summing net forces in x and y coordinates to equal 0" },
            { name: "Moments Balance", description: "Summing moments at pivot points to verify zero rotation" }
          ]
        },
        {
          name: "Truss Load Solutions",
          description: "Isolating axial load forces in frame components",
          children: [
            { name: "Joints Method", description: "Solving small connections with simple geometric calculations" },
            { name: "Sections Method", description: "Applying moments across internal splits to isolate a single beam force" }
          ]
        },
        {
          name: "Frequent Exam Traps",
          description: "Errors commonly checked under testing conditions",
          children: [
            { name: "Buckling forces", description: "Ignoring zero-weight truss members which prevent folding buckling" },
            { name: "Bending stress formulas", description: "Mixing up centroid heights when solving section stresses" }
          ]
        }
      ]
    };
  } else if (normSub.includes("physics")) {
    return {
      rootName,
      description: "Physics Mechanics and Conservative energy map",
      children: [
        {
          name: "Vector Forces (F)",
          description: "Decomposing physical trajectories",
          children: [
            { name: "Incline Gravity Vectors", description: "Decomposing weight force vectors down into parallel and perpendicular alignments" },
            { name: "Friction Vectors", description: "Computing sliding resistances using friction boundaries: F_f = μ * N" }
          ]
        },
        {
          name: "Conservation Laws",
          description: "Maintaining core system calculations",
          children: [
            { name: "Mechanical Energy Conservation", description: "Total static kinetic energies sum stays identical across smooth surfaces" },
            { name: "Linear Momentum conservation", description: "Collision particles retain net speed states when zero net load acts" }
          ]
        },
        {
          name: "Professor Pitfalls",
          description: "Calculations where units and coefficients confuse",
          children: [
            { name: "Static Friction exceed state", description: "Applying movement formulas before force overcomes static thresholds" },
            { name: "Inclined plane Normal", description: "Mistaking Normal load with mass weight: Normal is m*g*cos(θ)" }
          ]
        }
      ]
    };
  } else if (normSub.includes("biology")) {
    return {
      rootName,
      description: "Cell replication and cell division chromosome maps",
      children: [
        {
          name: "Active Mitotic Phases (PMAT)",
          description: "Cell sequential separation checkpoints",
          children: [
            { name: "Prophase & Metaphase", description: "Chromatin fibers condense, and spindle structures align chromatids centered" },
            { name: "Anaphase & Telophase", description: "Spindle fibers contraction pulls chromatids apart, cell lobes re-form" }
          ]
        },
        {
          name: "Replication apparatus",
          description: "Elements driving cellular operations",
          children: [
            { name: "Spindle Microtubules", description: "Filament threads that extend from centrosomes to grab chromosomes" },
            { name: "Homologous chromatids", description: "Genetic sister materials split to keep daughter genomes consistent" }
          ]
        },
        {
          name: "Core Examiner Traps",
          description: "Chromosomes division differences regularly tested",
          children: [
            { name: "Meiosis variations", description: "Mixing diploids mitosis with haploid gamete crossovers" },
            { name: "Cytokinesis stages", description: "Ignoring cell plate differences in plants vs cell furrow splitting in animals" }
          ]
        }
      ]
    };
  }

  // Generic fallback map:
  return {
    rootName,
    description: `Conceptual revision connection tree of ${subject || "this topic"}`,
    children: [
      {
        name: "Foundational Pillars",
        description: "Underlying academic principles and beginning assumptions",
        children: [
          { name: "Definitions & Jargon", description: "Understanding standard vocabulary words" },
          { name: "Core Variables", description: "Identifying constraints and inputs early" }
        ]
      },
      {
        name: "Core Methodologies",
        description: "How to apply definitions to solve exam problems",
        children: [
          { name: "Analytical Solutions", description: "Solving and deriving step-by-step using formulas" },
          { name: "Case Application", description: "Applying models to resolve practical problems" }
        ]
      },
      {
        name: "Exam Traps & Tips",
        description: "Frequent coordinate mistakes and calculations traps",
        children: [
          { name: "Standard Pitfalls", description: "Mixing up coefficients, constants, or units bounds" },
          { name: "Defensive Tips", description: "Syllabus checking questions designed to guard active recall" }
        ]
      }
    ]
  };
}

const generateMockData = {
  questions: (topic: string, subject: string = "General") => getSubjectMockQuestions(subject, topic),
  notes: (topic: string, subject: string = "General") => getSubjectMockNotes(subject, topic),
  summary: (text: string, subject: string = "General") => getSubjectMockSummary(subject, text),
  mindmap: (topic: string, subject: string = "General") => getSubjectMockMindmap(subject, topic)
};

// Endpoints with built-in fallback if API key is not available
app.post("/api/questions", async (req, res) => {
  const { topic } = req.body;
  if (!topic || typeof topic !== "string") {
    return res.status(400).json({ error: "Topic is required and must be a string." });
  }

  try {
    const ai = getGeminiAI();
    const prompt = `Generate 4 to 5 important, highly exam-focused academic questions for the topic/subject: "${topic}". 
Include realistic academic questions, set exact difficulty levels ("Easy", "Medium", "Hard"), 
provide a list of important key concepts/points the student MUST cover in their answer, and 
add a short sample answer outline showing how to structure a scoring answer. Keep the tone helpful, professional, and student-supportive.`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert exam designer and academic tutor. You generate structured exam preparation content.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING, description: "The overarching academic subject for this topic" },
              topic: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    question: { type: Type.STRING },
                    difficulty: { type: Type.STRING, description: "Difficulty level: Easy, Medium, or Hard" },
                    importantPoints: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "3 Key academic concepts or points which must be mentioned in the answer"
                    },
                    sampleAnswerOutline: { type: Type.STRING, description: "Short guided step-by-step model answer structure" }
                  },
                  required: ["id", "question", "difficulty", "importantPoints", "sampleAnswerOutline"]
                }
              }
            },
            required: ["subject", "topic", "questions"]
          }
        }
      }),
      8000,
      "Gemini compile questions"
    );

    const data = JSON.parse(response.text?.trim() || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Gemini /api/questions error:", error);
    // Graceful fallback to rich mock data
    res.json({
      ...generateMockData.questions(topic),
      isFallback: true,
      errorMessage: error.message || "An unexpected error occurred"
    });
  }
});

app.post("/api/notes", async (req, res) => {
  const { topic } = req.body;
  if (!topic || typeof topic !== "string") {
    return res.status(400).json({ error: "Topic is required and must be a string." });
  }

  try {
    const ai = getGeminiAI();
    const prompt = `Generate comprehensive, exceptionally high-scoring, college-topper style handwritten notes for the topic: "${topic}".
The notes should be highly student-focused, beautifully structured, and exam-oriented.

You MUST generate:
1. Quick Revision Summary: Short introduction and exam-focused explanation.
2. Foundational Concepts: Key terminology, definitions, core concepts, and key glossary items.
3. Important Exam Questions: Must include a 1 Mark Question, a 2 Mark Question, a 5 Mark Question, a Long Answer, and an MCQ (with four structured choices and correctOption marked).
4. Important Notes Section: Bulleted key points, shortcut tricks, important formulas, diagram/flowchart explanations, and frequently repeated concepts.
5. Smart Study Blocks: Memory tricks or mnemonics, simple explanations, and concrete real-world examples.
6. Key Takeaway Summary: Bullet points list for last-minute exam preparation.
7. Mind Map hierarchy tree: Parent-child connected node items describing the conceptual visual flowchart.`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an elite university professor and gold-medalist topper. You compile immaculate, highly structured visual study notes, shortcut memory tips, and exam-winning answer guidelines.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              introduction: { type: Type.STRING, description: "Engaging 2-3 sentence overview introducing the topic and academic relevance." },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    subHeading: { type: Type.STRING },
                    keyPoints: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    formulaOrKeyTerms: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ["subHeading", "keyPoints", "formulaOrKeyTerms"]
                }
              },
              quickSummary: { type: Type.STRING },
              studyTip: { type: Type.STRING },
              foundationalConcepts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    concept: { type: Type.STRING },
                    definition: { type: Type.STRING },
                    terminology: { type: Type.STRING },
                    glossary: { type: Type.STRING }
                  },
                  required: ["concept", "definition", "terminology", "glossary"]
                }
              },
              examQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    markType: { type: Type.STRING },
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    correctOption: { type: Type.STRING }
                  },
                  required: ["id", "markType", "question", "answer"]
                }
              },
              importantNotesSection: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    keyPoint: { type: Type.STRING },
                    shortcutTrick: { type: Type.STRING },
                    formula: { type: Type.STRING },
                    diagramExplanation: { type: Type.STRING },
                    repeatedConcept: { type: Type.STRING }
                  },
                  required: ["keyPoint", "shortcutTrick", "formula", "diagramExplanation", "repeatedConcept"]
                }
              },
              smartStudyBlocks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    point: { type: Type.STRING },
                    memoryTrick: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    example: { type: Type.STRING }
                  },
                  required: ["point", "memoryTrick", "explanation", "example"]
                }
              },
              keyTakeawaySummary: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              mindMapTree: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    nodeName: { type: Type.STRING },
                    parentName: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["id", "nodeName", "parentName", "description"]
                }
              }
            },
            required: [
              "topic",
              "introduction",
              "sections",
              "quickSummary",
              "studyTip",
              "foundationalConcepts",
              "examQuestions",
              "importantNotesSection",
              "smartStudyBlocks",
              "keyTakeawaySummary",
              "mindMapTree"
            ]
          }
        }
      }),
      14000,
      "Gemini compile notes topper"
    );

    const data = JSON.parse(response.text?.trim() || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Gemini /api/notes error:", error);
    res.json({
      ...generateMockData.notes(topic),
      isFallback: true,
      errorMessage: error.message || "An unexpected error occurred"
    });
  }
});

app.post("/api/summary", async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Text to summarize is required and must be a string." });
  }

  try {
    const ai = getGeminiAI();
    const prompt = `Summarize the following topic text into condensed, clear, bite-sized revision points:
"${text}"

Extract the overriding main concept, provide a list of key takeaways, simplified point-by-point 'concept' & 'explanation' definitions for complex terms in the text, and generate a memorable diagnostic 'mnemonicDevice' (an acronym, rhyme, or phrase) to make it easy for students to study this block of knowledge for active recall.`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a master educational simplifier who helps students grasp highly dense reading text swiftly by outputting clear modular takeaways, simple jargon definitions, and clever mnemonics.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topicSummary: { type: Type.STRING, description: "One elegant paragraph summarizing the textbook excerpt" },
              keyTakeaways: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "High-level takeaways from the text"
              },
              simplifiedPoints: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    concept: { type: Type.STRING, description: "A key word or concept" },
                    explanation: { type: Type.STRING, description: "A simplified student-friendly explanation" }
                  },
                  required: ["concept", "explanation"]
                }
              },
              mnemonicDevice: { type: Type.STRING, description: "A catchy memorization word, phrase, or hook with explanation. Highly memorable." }
            },
            required: ["topicSummary", "keyTakeaways", "simplifiedPoints", "mnemonicDevice"]
          }
        }
      }),
      8010,
      "Gemini compile summary"
    );

    const data = JSON.parse(response.text?.trim() || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Gemini /api/summary error:", error);
    res.json({
      ...generateMockData.summary(text),
      isFallback: true,
      errorMessage: error.message || "An unexpected error occurred"
    });
  }
});

app.post("/api/mindmap", async (req, res) => {
  const { topic } = req.body;
  if (!topic || typeof topic !== "string") {
    return res.status(400).json({ error: "Topic is required and must be a string." });
  }

  try {
    const ai = getGeminiAI();
    const prompt = `Create a visually connected hierarchical text-based mind-map data structure for the topic: "${topic}".
It must have a central core topic as 'rootName', a brief 'description' of this master node, and an array of 3 to 4 logical sub-topics as 'children'. Each child sub-topic must have an array of 2 to 3 leaf nodes under it detailing key micro-aspects of that sub-topic.`;

    const response = await withTimeout(
      ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an educational information architect. You organize concepts into beautiful, logically structured hierarchical mind trees representing interconnected concepts.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rootName: { type: Type.STRING, description: "The ultimate main central study topic" },
              description: { type: Type.STRING, description: "Main conceptual definition" },
              children: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Name of this branch sub-topic" },
                    description: { type: Type.STRING, description: "A summary sentence of this specific sub-topic branch" },
                    children: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING, description: "A leaf node key concept detail" },
                          description: { type: Type.STRING, description: "1-sentence quick explanation for review" }
                        },
                        required: ["name", "description"]
                      }
                    }
                  },
                  required: ["name", "description", "children"]
                }
              }
            },
            required: ["rootName", "description", "children"]
          }
        }
      }),
      8015,
      "Gemini compile mindmap"
    );

    const data = JSON.parse(response.text?.trim() || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Gemini /api/mindmap error:", error);
    res.json({
      ...generateMockData.mindmap(topic),
      isFallback: true,
      errorMessage: error.message || "An unexpected error occurred"
    });
  }
});

// Helper to register exact subject-specific questions endpoints requested by user
const registerSubjectQuestionsRoute = (routePath: string, subjectName: string) => {
  const handler = async (req: express.Request, res: express.Response) => {
    const { topic } = req.body;
    const activeTopic = topic || "Foundations";
    try {
      const ai = getGeminiAI();
      const prompt = `Generate 4 to 5 important, highly exam-focused academic questions for the subject: "${subjectName}" on topic/chapter: "${activeTopic}".
Include realistic academic questions, set exact difficulty levels ("Easy", "Medium", "Hard"), 
provide a list of important key concepts/points the student MUST cover in their answer, and 
add a short sample answer outline.`;

      const response = await withTimeout(
        ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction: "You are an expert exam designer and university professor. Return a structured JSON response.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING },
                topic: { type: Type.STRING },
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      question: { type: Type.STRING },
                      difficulty: { type: Type.STRING },
                      importantPoints: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      sampleAnswerOutline: { type: Type.STRING }
                    },
                    required: ["id", "question", "difficulty", "importantPoints", "sampleAnswerOutline"]
                  }
                }
              },
              required: ["subject", "topic", "questions"]
            }
          }
        }),
        8000,
        `Gemini ${subjectName} questions`
      );

      const data = JSON.parse(response.text?.trim() || "{}");
      res.json(data);
    } catch (err: any) {
      console.error(`Error on subject questions endpoint (${subjectName}):`, err);
      res.json({
        ...generateMockData.questions(activeTopic, subjectName),
        isFallback: true,
        errorMessage: err.message || "Endpoint error occurred"
      });
    }
  };

  // Register in app
  app.post(routePath, handler);
  app.post(`/api${routePath}`, handler);
};

// Register requested exact endpoints
registerSubjectQuestionsRoute("/python-questions", "Python Programming");
registerSubjectQuestionsRoute("/cprogramming-questions", "C Programming");
registerSubjectQuestionsRoute("/ai-questions", "Artificial Intelligence");
registerSubjectQuestionsRoute("/civil-questions", "Civil Engineering");
registerSubjectQuestionsRoute("/physics-questions", "Physics");
registerSubjectQuestionsRoute("/biology-questions", "Biology");

// Configure Vite middleware for development or serve custom static build in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production state
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Student Study Assistant backend listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
