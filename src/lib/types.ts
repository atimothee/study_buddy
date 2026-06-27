export type Difficulty = "easy" | "medium" | "hard";

export type CardType =
  | "basic"
  | "cloze"
  | "definition"
  | "compare_contrast"
  | "application";

export interface Profile {
  id: string;
  email: string | null;
  created_at: string;
}

export interface StudySet {
  id: string;
  user_id: string;
  title: string;
  subject: string | null;
  source_text: string | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  id: string;
  study_set_id: string;
  front: string;
  back: string;
  card_type: CardType;
  cloze_text: string | null;
  answer: string | null;
  explanation: string | null;
  tags: string[] | null;
  source_quote: string | null;
  difficulty: Difficulty;
  created_at: string;
}

export interface Quiz {
  id: string;
  study_set_id: string;
  title: string | null;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  choices: string[];
  correct_answer: string;
  explanation: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  study_set_id: string;
  user_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export interface GeneratedFlashcard {
  card_type: CardType;
  front: string;
  back: string;
  cloze_text?: string | null;
  answer?: string | null;
  explanation?: string | null;
  tags?: string[] | null;
  source_quote?: string | null;
  difficulty: Difficulty;
}

export interface GeneratedQuizQuestion {
  question: string;
  choices: string[];
  correct_answer: string;
  explanation: string;
}

export interface GenerationResult {
  summary: string;
  flashcards: GeneratedFlashcard[];
  quiz: {
    title: string;
    questions: GeneratedQuizQuestion[];
  };
}
