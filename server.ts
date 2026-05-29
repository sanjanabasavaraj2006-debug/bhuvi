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

// Check api availability status
app.get("/api/status", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({ status: "ok", hasApiKey: hasKey });
});

// Mock/Fallback generator helper in case API key is missing or failed
const generateMockData = {
  questions: (topic: string) => ({
    subject: "Active Review Topic",
    topic: topic,
    questions: [
      {
        id: "q1",
        question: `What are the core foundational pillars of ${topic}?`,
        difficulty: "Easy",
        importantPoints: [
          "Understanding the core definition and context.",
          "Identifying the primary components.",
          "Explaining how these components connect together to solve problems."
        ],
        sampleAnswerOutline: "Start by defining the topic clearly. Outline the three main components. Conclude by giving concrete real-world instances of how this concept applies in professional contexts today."
      },
      {
        id: "q2",
        question: `How does ${topic} contrast with its primary modern alternatives?`,
        difficulty: "Medium",
        importantPoints: [
          "Delineate key comparison metrics (efficiency, scalability, simplicity).",
          "Highlight a specific scenario where this is preferred.",
          "Identify its main disadvantages or limitations in high-stress/scale-critical operations."
        ],
        sampleAnswerOutline: "Create a mental or analytical comparison matrix. Go through efficiency, resource demand, and learning curve. State clearly why this topic fits specific niches better than existing alternatives."
      },
      {
        id: "q3",
        question: `Propose an advanced implementation scenario utilizing ${topic} to maximize resource efficiency.`,
        difficulty: "Hard",
        importantPoints: [
          "Acknowledge edge cases and extreme input conditions.",
          "Describe integration with microservice architectures or complex systems.",
          "Draft a testing suite or verification flow."
        ],
        sampleAnswerOutline: "Propose a multi-tier design. Explain the exact mechanism where the concept handles heavy-loads. Address how failure modes are mitigated or rolled back under high latency."
      }
    ]
  }),

  notes: (topic: string) => ({
    topic: topic,
    introduction: `${topic} is a key academic concept widely encountered across undergraduate curriculums. It is highly valued for its conceptual neatness and high real-world applicability in solving practical problems.`,
    sections: [
      {
        subHeading: "Foundations & Structural Overview",
        keyPoints: [
          "Defined as a functional system governed by exact parameters, ensuring predictable behavior and scalability.",
          "Constructed using modular nodes, reducing dependencies and mitigating compounding error cascading risks.",
          "Maintains low cognitive overhead because it follows standardized conventions across modern frameworks."
        ],
        formulaOrKeyTerms: [
          "Node Isolation: Decoupling entities to ensure absolute single-responsibility rules.",
          "Theoretical Maximum Performance Index: T_max = N(k - ln(N)) where N is node density."
        ]
      },
      {
        subHeading: "Practical Design & Execution",
        keyPoints: [
          "Requires strict execution routines with robust defensive validation parameters built in at startup.",
          "Optimizes computation blocks by caching intermediate static attributes to prevent CPU cycles on duplicate inputs."
        ],
        formulaOrKeyTerms: [
          "Static Caching",
          "Efficiency Coefficient = Work Done / Latency Cost"
        ]
      }
    ],
    quickSummary: `To master ${topic}, focus on how isolated items communicate, avoid tight coupling in high-frequency channels, and write rigorous validations to capture theoretical edge cases before compilation.`,
    studyTip: "Revision Tip: Focus 70% of study time on comparing isolate components and tracing information-flow step-by-step; exams frequently test drawing connectivity trees."
  }),

  summary: (text: string) => {
    const brief = text.length > 100 ? text.substring(0, 100) + "..." : text;
    return {
      topicSummary: `Structured summary for the text: "${brief}". Focuses on modular breakdown, isolated variables, and conceptual patterns.`,
      keyTakeaways: [
        "Primary action revolves around reducing complexity via structural decoupling.",
        "Systemic parameters must align perfectly with standard best layouts to prevent downstream errors.",
        "Consistency in tracking relationships yields 40% higher direct retention rates."
      ],
      simplifiedPoints: [
        {
          concept: "Deconstruction",
          explanation: "Splitting a complex prompt/paragraph into atomic key items that can be memorized independently."
        },
        {
          concept: "Edge Case Isolation",
          explanation: "Identifying parts of the text representing extreme or outlier scenarios so that main flows stay clean."
        }
      ],
      mnemonicDevice: "M-A-P-S: Modularize, Analyze relationships, Practice isolating blocks, and Standardize key summaries."
    };
  },

  mindmap: (topic: string) => ({
    rootName: topic,
    description: `Core academic structure of ${topic}`,
    children: [
      {
        name: "Foundational Pillars",
        description: "The underlying principles that make this model functional.",
        children: [
          { name: "First Principles", description: "Standard definitions and initial axioms" },
          { name: "Historical Context", description: "How this concept evolved over time" }
        ]
      },
      {
        name: "Core Methodologies",
        description: "Primary approaches to applying the concept to work.",
        children: [
          { name: "Analytical Method", description: "Solving and breaking down via standard proof methods" },
          { name: "Empirical Application", description: "Testing and executing in laboratories or scenarios" }
        ]
      },
      {
        name: "Exam Traps & Tricks",
        description: "Frequent points of confusion tested by professors.",
        children: [
          { name: "Trivial Pitfalls", description: "Getting units wrong or mixing up key symbols" },
          { name: "Integration Scenarios", description: "Applying formula parameters under wrong premises" }
        ]
      }
    ]
  })
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

    const response = await ai.models.generateContent({
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
    });

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
    const prompt = `Generate comprehensive, clear, high-scoring exam notes for the topic: "${topic}". 
The notes should be highly student-focused, digestible, and exam-oriented. 
Divide the concept into 2 to 3 main sections with sub-headings, list discrete bulleted key points for study, 
detail any formulas or key terms critical to get right, write an engaging 3-sentence summary of the topic, 
and formulate a clever "ExamTip" or study advice that points out a common student trap on this specific topic.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional university professor who writes outstanding, clear, simplified exam preparation notes for college and school students.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            introduction: { type: Type.STRING, description: "Engaging 2-3 sentence overview introducing the topic and its academic relevance." },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  subHeading: { type: Type.STRING, description: "Title of this note subheading" },
                  keyPoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Extracted high-value studying observations and bullet-points"
                  },
                  formulaOrKeyTerms: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Formulas or key vocabulary terms associated with this sub section"
                  }
                },
                required: ["subHeading", "keyPoints", "formulaOrKeyTerms"]
              }
            },
            quickSummary: { type: Type.STRING, description: "Excellent final recap sentences summarizing the core takeaway." },
            studyTip: { type: Type.STRING, description: "Exam tip detailing what the examiners often look for or common traps on this topic." }
          },
          required: ["topic", "introduction", "sections", "quickSummary", "studyTip"]
        }
      }
    });

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

    const response = await ai.models.generateContent({
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
    });

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

    const response = await ai.models.generateContent({
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
    });

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
