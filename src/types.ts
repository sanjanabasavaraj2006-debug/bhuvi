export interface QuestionItem {
  id: string;
  question: string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  importantPoints: string[];
  sampleAnswerOutline: string;
}

export interface QuestionsResponse {
  subject: string;
  topic: string;
  questions: QuestionItem[];
  isFallback?: boolean;
  errorMessage?: string;
}

export interface NoteSection {
  subHeading: string;
  keyPoints: string[];
  formulaOrKeyTerms: string[];
}

export interface TopperConcept {
  concept: string;
  definition: string;
  terminology: string;
  glossary: string;
}

export interface TopperQuestion {
  id: string;
  markType: string; // "1 Mark" | "2 Marks" | "5 Marks" | "Long Answer" | "MCQ"
  question: string;
  answer: string;
  options?: string[];
  correctOption?: string;
}

export interface TopperNotesSection {
  keyPoint: string;
  shortcutTrick?: string;
  formula?: string;
  diagramExplanation?: string;
  repeatedConcept?: string;
}

export interface TopperStudyBlock {
  point: string;
  memoryTrick: string;
  explanation: string;
  example: string;
}

export interface TopperMindMapItem {
  id: string;
  nodeName: string;
  parentName?: string;
  description?: string;
}

export interface NotesResponse {
  topic: string;
  introduction: string;
  sections: NoteSection[];
  quickSummary: string;
  studyTip: string;
  // Topper Enhanced Fields
  foundationalConcepts?: TopperConcept[];
  examQuestions?: TopperQuestion[];
  importantNotesSection?: TopperNotesSection[];
  smartStudyBlocks?: TopperStudyBlock[];
  keyTakeawaySummary?: string[];
  mindMapTree?: TopperMindMapItem[];
  isFallback?: boolean;
  errorMessage?: string;
}

export interface SimplifiedPoint {
  concept: string;
  explanation: string;
}

export interface SummaryResponse {
  topicSummary: string;
  keyTakeaways: string[];
  simplifiedPoints: SimplifiedPoint[];
  mnemonicDevice: string;
  isFallback?: boolean;
  errorMessage?: string;
}

export interface MindMapLeaf {
  name: string;
  description: string;
}

export interface MindMapBranch {
  name: string;
  description: string;
  children: MindMapLeaf[];
}

export interface MindMapResponse {
  rootName: string;
  description: string;
  children: MindMapBranch[];
  isFallback?: boolean;
  errorMessage?: string;
}

export type ActiveTab = "home" | "questions" | "notes" | "summarize" | "mindmap" | "subjects";
