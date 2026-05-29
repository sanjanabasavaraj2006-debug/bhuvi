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

export interface NotesResponse {
  topic: string;
  introduction: string;
  sections: NoteSection[];
  quickSummary: string;
  studyTip: string;
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

export type ActiveTab = "home" | "questions" | "notes" | "summarize" | "mindmap";
