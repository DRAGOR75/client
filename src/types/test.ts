// TypeScript interfaces corresponding to sanitized Go payloads

export interface SanitizedOption {
  id: string;
  text: string;
}

export interface SanitizedPassage {
  id: string;
  title: string;
  text: string;
}

export interface SanitizedQuestion {
  id: string;
  sectionId?: string; // Links questions to parent section
  type: 'MCQ' | 'MSQ' | 'TITA';
  text: string;
  points: number;
  order: number;
  options: SanitizedOption[];
  passage?: SanitizedPassage;
}

export interface SanitizedSection {
  id: string;
  testId: string;
  name: string;
  orderIndex: number;
  durationMinutes: number;
}

export interface SanitizedTest {
  id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  type?: string;
}

/**
 * Stripped payload sent by Go backend on starting a test attempt
 */
export interface SanitizedStartPayload {
  attemptId: string;
  test: SanitizedTest;
  activeSection?: SanitizedSection; // Server authoritative section metadata (for CAT)
  allSections?: SanitizedSection[]; // All sections (for Generic/JEE)
  questions: SanitizedQuestion[];   // Questions only for the active section segment (CAT) or all (Generic)
  startTime: string;   // ISO 8601 string from Go time.Time
  serverTime: string;  // ISO 8601 string from Go time.Time for drift calibration
}

/**
 * Mapping of Question UUID to selected Option UUID (null if unanswered)
 */
export interface UserResponses {
  [questionId: string]: string | string[] | null;
}

/**
 * Tracks client-side interactive state during exam taking
 */
export interface TestState {
  currentQuestionIndex: number;
  answers: UserResponses;
  markedForReview: string[];  // array of question IDs
  visitedQuestions: string[]; // array of question IDs
  // TCS iON legends support
  answeredMarkedForReview: string[]; // array of question IDs
}
