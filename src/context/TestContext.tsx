"use client";
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { SanitizedStartPayload, UserResponses, SanitizedSection } from '../types/test';

export interface QuestionBreakdown {
  questionId: string;
  questionText: string;
  userOptionId: string;
  userOptionText: string;
  correctOptionId: string;
  correctOptionText: string;
  isCorrect: boolean;
}

export interface GradingResult {
  attemptId: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: string;
  timeTakenSeconds: number;
  correctCount: number;
  totalQuestions: number;
  breakdown: QuestionBreakdown[];
}

interface TestContextType {
  payload: SanitizedStartPayload | null;
  currentQuestionIndex: number;
  answers: UserResponses;
  markedForReview: string[];
  visitedQuestions: string[];
  remainingSeconds: number;
  isSubmitting: boolean;
  isCompleted: boolean;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  connectionLost: boolean;
  submitResult: GradingResult | null;
  isWaiting: boolean; 
  activeSection: SanitizedSection | null;
  activeSectionIndex: number;
  transitioning: boolean;

  // Navigation & Actions
  setCurrentQuestionIndex: (index: number) => void;
  selectOption: (questionId: string, optionId: string) => void;
  clearSelection: (questionId: string) => void;
  toggleMarkForReview: (questionId: string) => void;
  submitAttempt: (isAutoSubmit?: boolean) => Promise<void>;
  logInfraction: (reason: string) => Promise<void>;
  fastForwardAttempt: () => Promise<void>;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

export const TestProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/tests/';
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/api/ws/tests/';
  const [payload, setPayload] = useState<SanitizedStartPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionLost, setConnectionLost] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  const [activeSection, setActiveSection] = useState<SanitizedSection | null>(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);
  const [transitioning, setTransitioning] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndexState] = useState(0);
  const [answers, setAnswers] = useState<UserResponses>({});
  const [markedForReview, setMarkedForReview] = useState<string[]>([]);
  const [visitedQuestions, setVisitedQuestions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [submitResult, setSubmitResult] = useState<GradingResult | null>(null);
  
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const retryCountRef = useRef<number>(0);

  const submitAttempt = useCallback(async (isAutoSubmit?: boolean) => {
    if (isSubmitting || isCompleted || !payload) return;
    setIsSubmitting(true);

    try {
      if (wsRef.current) {
        wsRef.current.close();
      }

      const res = await fetch(`http://localhost:8080/api/tests/${payload.attemptId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answers),
      });

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error('This attempt has already been submitted and finalized.');
        }
        throw new Error(`Submit rejected by server with status: ${res.status}`);
      }

      const result: GradingResult = await res.json();
      setSubmitResult(result);
      setIsCompleted(true);

      if (isAutoSubmit) {
        alert("TIME IS UP!\n\nYour exam time has expired. Your responses have been automatically submitted and graded.");
      }
    } catch (err: any) {
      console.error('[Submit Error]', err);
      alert(err.message || 'Submission failed. Please check network and retry.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, isCompleted, payload, answers, API_BASE_URL]);

  // Mount-time Bootstrapper: fetches current active section questions
  useEffect(() => {
    let isMounted = true;

    const bootstrapExam = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const activeTestId = localStorage.getItem('activeTestId') || 'aws-sap-c02';
        const res = await fetch(`${API_BASE_URL}${activeTestId}/start`);
        if (!res.ok) {
          throw new Error(`CBT backend responded with HTTP status code: ${res.status}`);
        }
        
        const data: SanitizedStartPayload = await res.json();
        
        if (!isMounted) return;

        setPayload(data);
        if (data.activeSection) {
          setActiveSection(data.activeSection);
        }

        // Seed current active questions answers and set first visited
        const initialAnswers: UserResponses = {};
        data.questions.forEach((q) => {
          initialAnswers[q.id] = null;
        });
        setAnswers(initialAnswers);
        if (data.questions.length > 0) {
          setVisitedQuestions([data.questions[0].id]);
        }
        
        // Duration from active section segment
        setRemainingSeconds(data.activeSection ? data.activeSection.durationMinutes * 60 : 2400);
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Connection failed to secure testing API');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    bootstrapExam();

    return () => {
      isMounted = false;
    };
  }, []);

  // Web Socket state sync channel
  useEffect(() => {
    if (!payload || isCompleted) return;

    let isCleanup = false;

    const connectWebSocket = () => {
      if (isCleanup) return;

      console.log(`[WS] Handshake established: ${WS_URL}${payload.attemptId}`);
      const ws = new WebSocket(`${WS_URL}${payload.attemptId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isCleanup) {
          ws.close();
          return;
        }
        setIsConnected(true);
        setConnectionLost(false);
        retryCountRef.current = 0;
      };

      ws.onmessage = (event) => {
        if (isCleanup) return;
        try {
          const msg = JSON.parse(event.data);
          
          if (msg.type === 'WAITING') {
            setIsWaiting(true);
          } else if (msg.type === 'TEST_START') {
            setIsWaiting(false);
            if (msg.activeSection) {
              setActiveSection(msg.activeSection);
            }
            if (msg.section_index !== undefined) {
              setActiveSectionIndex(msg.section_index);
            }
            if (msg.questions) {
              setPayload((prev) => {
                if (!prev) return null;
                return { ...prev, questions: msg.questions };
              });
              
              const initialAnswers: UserResponses = {};
              msg.questions.forEach((q: any) => {
                initialAnswers[q.id] = null;
              });
              setAnswers(initialAnswers);
              if (msg.questions.length > 0) {
                setVisitedQuestions([msg.questions[0].id]);
              }
              setMarkedForReview([]);
              setCurrentQuestionIndexState(0);
            }
            if (msg.remaining_seconds !== undefined) {
              setRemainingSeconds(msg.remaining_seconds);
            }
          } else if (msg.type === 'TICK') {
            const serverSeconds = msg.remaining_seconds;
            setRemainingSeconds(serverSeconds);
            setConnectionLost(false);
            if (msg.section_index !== undefined) {
              setActiveSectionIndex(msg.section_index);
            }
          } else if (msg.type === 'SECTION_TRANSITION') {
            console.log('[WS] Synchronized SECTION_TRANSITION received. Loading next segment questions...');
            setTransitioning(true);

            // Wipe local response state to avoid leaks and peeks
            setAnswers({});
            setMarkedForReview([]);
            setVisitedQuestions([]);
            setCurrentQuestionIndexState(0);

            if (msg.activeSection) {
              setActiveSection(msg.activeSection);
            }
            if (msg.section_index !== undefined) {
              setActiveSectionIndex(msg.section_index);
            }
            if (msg.questions) {
              setPayload((prev) => {
                if (!prev) return null;
                return { ...prev, questions: msg.questions };
              });

              const initialAnswers: UserResponses = {};
              msg.questions.forEach((q: any) => {
                initialAnswers[q.id] = null;
              });
              setAnswers(initialAnswers);
              if (msg.questions.length > 0) {
                setVisitedQuestions([msg.questions[0].id]);
              }
            }
            if (msg.remaining_seconds !== undefined) {
              setRemainingSeconds(msg.remaining_seconds);
            }

            // Show flash banner
            setTimeout(() => {
              setTransitioning(false);
            }, 2500);

          } else if (msg.type === 'WARNING') {
            console.warn('[WS WARNING]', msg.message);
            alert(msg.message);
          } else if (msg.type === 'TIME_UP') {
            console.warn('[WS Time Up] Server enforced automatic exam submission.');
            if (msg.result) {
              setSubmitResult(msg.result);
              setIsCompleted(true);
            } else {
              submitAttempt(true);
            }
          }
        } catch (err) {
          console.error('[WS Error] Failed to parse message tick:', err);
        }
      };

      ws.onclose = () => {
        if (isCleanup) return;
        setIsConnected(false);
        wsRef.current = null;

        if (isCompleted) return;
        setConnectionLost(true);

        const backoffDelay = Math.min(8000, 1000 * Math.pow(2, retryCountRef.current));
        retryCountRef.current += 1;

        reconnectTimeoutRef.current = window.setTimeout(() => {
          connectWebSocket();
        }, backoffDelay);
      };

      ws.onerror = () => {
        if (isCleanup) return;
        ws.close();
      };
    };

    connectWebSocket();

    return () => {
      isCleanup = true;
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [payload?.attemptId, isCompleted]);

  // Smooth local tick helper
  useEffect(() => {
    if (isCompleted || isWaiting || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isCompleted, isWaiting, remainingSeconds]);

  // Automatic submission when timer hits 0 in the final section
  useEffect(() => {
    if (!isCompleted && !isWaiting && payload && remainingSeconds === 0 && activeSection?.name === 'QA') {
      console.log('[Timer] Exam time expired! Triggering automatic submission.');
      submitAttempt(true);
    }
  }, [remainingSeconds, activeSection, isCompleted, isWaiting, payload, submitAttempt]);

  const setCurrentQuestionIndex = (index: number) => {
    if (payload && index >= 0 && index < payload.questions.length) {
      setCurrentQuestionIndexState(index);
      const questionId = payload.questions[index].id;
      setVisitedQuestions((prev) => 
        prev.includes(questionId) ? prev : [...prev, questionId]
      );
    }
  };

  const selectOption = (questionId: string, optionId: string) => {
    if (connectionLost || isWaiting) return;
    
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'ANSWER',
        question_id: questionId,
        option_id: optionId
      }));
    }
  };

  const clearSelection = (questionId: string) => {
    if (connectionLost || isWaiting) return;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: null,
    }));

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'ANSWER',
        question_id: questionId,
        option_id: ""
      }));
    }
  };

  const toggleMarkForReview = (questionId: string) => {
    if (connectionLost || isWaiting) return;

    setMarkedForReview((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };


  const logInfraction = async (reason: string) => {
    if (!payload) return;
    try {
      await fetch(`http://localhost:8080/api/attempts/${payload.attemptId}/infraction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
    } catch (err) {
      console.error('[Anti-Cheat Error] Failed to log:', err);
    }
  };

  const fastForwardAttempt = async () => {
    if (!payload) return;
    try {
      const res = await fetch(`http://localhost:8080/api/attempts/${payload.attemptId}/fastforward`, {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error('Failed to fast-forward attempt section');
      }
      console.log('[Dev] Attempt successfully fast-forwarded in backend.');
    } catch (err) {
      console.error(err);
      alert('Failed to skip section. Please check backend logs.');
    }
  };

  return (
    <TestContext.Provider
      value={{
        payload,
        currentQuestionIndex,
        answers,
        markedForReview,
        visitedQuestions,
        remainingSeconds,
        isSubmitting,
        isCompleted,
        isLoading,
        error,
        isConnected,
        connectionLost,
        submitResult,
        isWaiting,
        activeSection,
        activeSectionIndex,
        transitioning,
        setCurrentQuestionIndex,
        selectOption,
        clearSelection,
        toggleMarkForReview,
        submitAttempt,
        logInfraction,
        fastForwardAttempt,
      }}
    >
      {children}
    </TestContext.Provider>
  );
};

export const useTest = () => {
  const context = useContext(TestContext);
  if (context === undefined) {
    throw new Error('useTest must be used within a TestProvider');
  }
  return context;
};
