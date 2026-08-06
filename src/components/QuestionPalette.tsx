"use client";
import React, { useState } from 'react';
import { useTest } from '../context/TestContext';
import { ShieldAlert, Award, Loader2, User } from 'lucide-react';
import confetti from 'canvas-confetti';

export const QuestionPalette: React.FC = () => {
  const {
    payload,
    currentQuestionIndex,
    answers,
    markedForReview,
    visitedQuestions,
    setCurrentQuestionIndex,
    submitAttempt,
    isSubmitting,
    isCompleted,
    connectionLost,
    isWaiting,
    remainingSeconds,
    activeSection,
    fastForwardAttempt,
  } = useTest();

  const [showSubmitModal, setShowSubmitModal] = useState(false);

  if (!payload) return null;

  const totalQuestions = payload.questions.length;
  const answeredCount = Object.keys(answers).filter((qId) => answers[qId] !== null && answers[qId] !== "").length;
  
  // Custom counters for TCS iON CAT legends
  const answeredMarkedCount = payload.questions.filter(
    (q) => markedForReview.includes(q.id) && answers[q.id] !== null && answers[q.id] !== ""
  ).length;

  const markedReviewCount = payload.questions.filter(
    (q) => markedForReview.includes(q.id) && (answers[q.id] === null || answers[q.id] === "")
  ).length;

  const visitedUnansweredCount = payload.questions.filter(
    (q) => visitedQuestions.includes(q.id) && !markedForReview.includes(q.id) && (answers[q.id] === null || answers[q.id] === "")
  ).length;

  const notVisitedCount = payload.questions.filter(
    (q) => !visitedQuestions.includes(q.id) && !markedForReview.includes(q.id) && (answers[q.id] === null || answers[q.id] === "")
  ).length;

  // Format countdown clock: HH:MM:SS
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const handleFinalSubmit = async () => {
    await submitAttempt();
    setShowSubmitModal(false);

    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#3b82f6', '#10b981'],
    });
  };

  // Render TCS iON CAT shaped question indicator
  const renderQuestionBubble = (qId: string, idx: number) => {
    const isCurrent = idx === currentQuestionIndex;
    const isAnswered = answers[qId] !== null && answers[qId] !== "";
    const isMarked = markedForReview.includes(qId);
    const isVisited = visitedQuestions.includes(qId);

    const borderRingClass = isCurrent 
      ? 'ring-2 ring-orange-500 ring-offset-1 ring-offset-white scale-105 shadow' 
      : 'hover:scale-105';

    // 1. Answered & Marked for Review: Purple Circle with small green checkmark
    if (isAnswered && isMarked) {
      return (
        <button
          key={qId}
          onClick={() => !connectionLost && !isWaiting && setCurrentQuestionIndex(idx)}
          disabled={connectionLost || isWaiting}
          className={`relative w-9 h-9 flex items-center justify-center text-white text-xs font-extrabold rounded-full bg-[#5D3F8A] border border-[#4a2e6f] font-mono shrink-0 transition-transform ${borderRingClass}`}
        >
          {idx + 1}
          <div className="absolute -bottom-1 -right-1 bg-[#2CA02C] text-white rounded-full p-0.5 border border-white flex items-center justify-center">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        </button>
      );
    }

    // 2. Answered: Green Pentagon (pointing down trapezoid)
    if (isAnswered) {
      return (
        <button
          key={qId}
          onClick={() => !connectionLost && !isWaiting && setCurrentQuestionIndex(idx)}
          disabled={connectionLost || isWaiting}
          className={`relative w-9 h-9 flex items-center justify-center text-white text-xs font-extrabold font-mono shrink-0 transition-transform ${borderRingClass}`}
        >
          <svg className="absolute inset-0 w-full h-full text-[#2CA02C] fill-current" viewBox="0 0 24 24">
            <path d="M12 22L2 14.5L5.8 2.5H18.2L22 14.5z" />
          </svg>
          <span className="relative z-10">{idx + 1}</span>
        </button>
      );
    }

    // 3. Marked for Review (Unanswered): Purple Circle
    if (isMarked) {
      return (
        <button
          key={qId}
          onClick={() => !connectionLost && !isWaiting && setCurrentQuestionIndex(idx)}
          disabled={connectionLost || isWaiting}
          className={`relative w-9 h-9 flex items-center justify-center text-white text-xs font-extrabold rounded-full bg-[#5D3F8A] border border-[#4a2e6f] font-mono shrink-0 transition-transform ${borderRingClass}`}
        >
          {idx + 1}
        </button>
      );
    }

    // 4. Not Answered (Visited): Red Pentagon (pointing up shield)
    if (isVisited) {
      return (
        <button
          key={qId}
          onClick={() => !connectionLost && !isWaiting && setCurrentQuestionIndex(idx)}
          disabled={connectionLost || isWaiting}
          className={`relative w-9 h-9 flex items-center justify-center text-white text-xs font-extrabold font-mono shrink-0 transition-transform ${borderRingClass}`}
        >
          <svg className="absolute inset-0 w-full h-full text-[#D9534F] fill-current" viewBox="0 0 24 24">
            <path d="M12 2L2 9.5L5.8 21.5H18.2L22 9.5z" />
          </svg>
          <span className="relative z-10">{idx + 1}</span>
        </button>
      );
    }

    // 5. Not Visited: Light Gray Square
    return (
      <button
        key={qId}
        onClick={() => !connectionLost && !isWaiting && setCurrentQuestionIndex(idx)}
        disabled={connectionLost || isWaiting}
        className={`relative w-9 h-9 flex items-center justify-center text-gray-700 text-xs font-extrabold bg-[#EEEEEE] border border-gray-300 rounded font-mono shrink-0 transition-transform ${borderRingClass}`}
      >
        {idx + 1}
      </button>
    );
  };

  return (
    <div className="w-full flex flex-col border border-gray-300 rounded shadow-sm bg-white overflow-hidden select-none font-sans text-xs">
      
      {/* 1. Candidate Passport Profile Placeholder Box */}
      <div className="bg-[#E5ECF4] border-b border-gray-300 p-4 flex items-center gap-3">
        <div className="w-16 h-16 bg-white border border-gray-300 flex items-center justify-center rounded overflow-hidden shrink-0 shadow-sm">
          <div className="w-14 h-14 bg-gray-200 flex items-center justify-center text-gray-500 rounded-sm">
            <User className="w-8 h-8" />
          </div>
        </div>
        <div className="flex flex-col gap-1 text-[11px] leading-tight">
          <span className="text-gray-500 font-medium">Candidate Name:</span>
          <span className="text-gray-900 font-bold uppercase tracking-wide">candidate_principal</span>
          <span className="text-gray-500 font-medium mt-1">Assessment System:</span>
          <span className="text-blue-800 font-extrabold uppercase font-mono">LAB-04_MOCK_CAT</span>
        </div>
      </div>

      {/* 2. Prominent Section Countdown Timer Box */}
      <div className="bg-[#333333] text-white p-3 border-b border-zinc-950 flex items-center justify-between font-mono">
        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
          {activeSection ? `${activeSection.name} Clock` : 'Timer'}
        </span>
        <div className="flex items-center gap-1.5 text-base font-extrabold text-[#5CB85C] tracking-wide">
          <span>{isCompleted ? '00:00:00' : isWaiting ? 'LOBBY_HOLD' : formatTime(remainingSeconds)}</span>
        </div>
      </div>

      {/* 3. TCS iON Legend of Status Shapes */}
      <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-x-2 gap-y-3 text-[10px] text-gray-800 font-bold font-sans uppercase">
          
          <div className="flex items-center gap-2">
            {/* Green Pentagon */}
            <div className="relative w-6 h-6 flex items-center justify-center text-white text-[9px] font-mono shrink-0">
              <svg className="absolute inset-0 w-full h-full text-[#2CA02C] fill-current" viewBox="0 0 24 24">
                <path d="M12 22L2 14.5L5.8 2.5H18.2L22 14.5z" />
              </svg>
              <span className="relative z-10">{answeredCount}</span>
            </div>
            <span>Answered</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Red Pentagon */}
            <div className="relative w-6 h-6 flex items-center justify-center text-white text-[9px] font-mono shrink-0">
              <svg className="absolute inset-0 w-full h-full text-[#D9534F] fill-current" viewBox="0 0 24 24">
                <path d="M12 2L2 9.5L5.8 21.5H18.2L22 9.5z" />
              </svg>
              <span className="relative z-10">{visitedUnansweredCount}</span>
            </div>
            <span>Not Answered</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Gray Square */}
            <div className="w-6 h-6 flex items-center justify-center text-gray-700 text-[9px] font-extrabold bg-[#EEEEEE] border border-gray-300 rounded shrink-0 font-mono">
              {notVisitedCount}
            </div>
            <span>Not Visited</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Purple Circle */}
            <div className="w-6 h-6 flex items-center justify-center text-white text-[9px] font-extrabold rounded-full bg-[#5D3F8A] border border-[#4a2e6f] shrink-0 font-mono">
              {markedReviewCount}
            </div>
            <span>Marked Review</span>
          </div>

          <div className="col-span-2 flex items-center gap-2 border-t border-gray-200 pt-2">
            {/* Purple Circle with Green Check */}
            <div className="relative w-6 h-6 flex items-center justify-center text-white text-[9px] font-extrabold rounded-full bg-[#5D3F8A] border border-[#4a2e6f] shrink-0 font-mono">
              {answeredMarkedCount}
              <div className="absolute -bottom-0.5 -right-0.5 bg-[#2CA02C] text-white rounded-full p-0.2 border border-white flex items-center justify-center">
                <svg className="w-1.5 h-1.5" fill="none" stroke="currentColor" strokeWidth="4.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
            </div>
            <span>Ans & Marked for Review</span>
          </div>

        </div>
      </div>

      {/* 4. Active Section Title Header Block */}
      <div className="bg-[#1F70C1] text-white font-bold px-4 py-2 border-b border-gray-300 flex justify-between items-center tracking-wide uppercase font-sans text-[11px]">
        <span>Section: {activeSection ? activeSection.name : 'VARC'}</span>
        <span>Question Grid</span>
      </div>

      {/* 5. Navigator Bubble Grid Panel */}
      <div className="p-4 flex-1 overflow-y-auto min-h-[160px] max-h-[220px]">
        <div className="flex flex-wrap gap-2.5 justify-start">
          {payload.questions.map((q, idx) => renderQuestionBubble(q.id, idx))}
        </div>
      </div>

      {/* 6. Enforced Submit Action Box (QA Section Only!) */}
      <div className="bg-[#EEEEEE] border-t border-gray-300 p-4 shrink-0 flex flex-col items-center">
        {isCompleted ? (
          <div className="w-full flex items-center justify-center gap-2 rounded bg-emerald-50 border border-emerald-400 text-emerald-700 py-3.5 px-4 font-bold text-xs uppercase tracking-wider font-mono">
            <Award className="h-5 w-5 animate-pulse" />
            <span>EXAMINATION SUBMITTED</span>
          </div>
        ) : activeSection?.name === 'QA' ? (
          <button
            onClick={() => !connectionLost && !isWaiting && setShowSubmitModal(true)}
            disabled={connectionLost || isWaiting}
            className={`w-full relative overflow-hidden transition-colors duration-150 rounded py-3.5 px-4 font-bold text-xs uppercase tracking-wider font-sans border shadow-sm focus:outline-none ${
              connectionLost || isWaiting
                ? 'bg-gray-150 border-gray-250 text-gray-400 cursor-not-allowed opacity-50'
                : 'bg-[#5CB85C] hover:bg-[#4cae4c] border-[#4cae4c] text-white cursor-pointer'
            }`}
          >
            Submit Examination
          </button>
        ) : (
          <div className="w-full flex flex-col gap-2">
            <div className="w-full text-center text-gray-500 font-mono text-[9px] uppercase tracking-wider leading-relaxed border border-dashed border-gray-300 bg-white p-3 rounded">
              Submission controls are locked and engage strictly in the final (QA) section block.
            </div>
            <button
              onClick={fastForwardAttempt}
              className="w-full rounded bg-amber-600 hover:bg-amber-700 text-white py-2 px-3 font-bold text-[10px] uppercase tracking-wider cursor-pointer border border-amber-700 shadow transition-colors text-center"
            >
              Skip Section (Simulation Mode)
            </button>
            <button
              onClick={() => !connectionLost && !isWaiting && setShowSubmitModal(true)}
              className="w-full rounded bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 font-bold text-[10px] uppercase tracking-wider cursor-pointer border border-blue-700 shadow transition-colors text-center"
            >
              Instant Submit (Simulation Mode)
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showSubmitModal && !connectionLost && !isWaiting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded border border-gray-300 bg-white p-6 shadow-2xl animate-scale-in">
            
            <div className="flex items-center gap-3 text-red-650 border-b border-gray-200 pb-4 mb-4 font-sans uppercase tracking-wider">
              <ShieldAlert className="h-6 w-6 shrink-0" />
              <h3 className="text-base font-bold text-gray-900">Final Submit Assessment?</h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mb-5 font-sans font-medium">
              You are about to authorize the finalized submission of your CAT Mock attempt. Once clicked, this transactional operation is irreversible and all section scores will lock permanently.
            </p>

            <div className="rounded bg-gray-50 p-4 border border-gray-300 flex flex-col gap-2 mb-6 text-xs font-mono uppercase tracking-wider font-semibold">
              <div className="flex justify-between">
                <span className="text-gray-600">Total System Questions:</span>
                <span className="text-gray-900 font-extrabold">{totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">Graded Answers Sync:</span>
                <span className="text-blue-600 font-extrabold">{answeredCount}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 font-sans text-xs font-bold uppercase tracking-wider">
              <button
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
                className="rounded border border-gray-300 bg-white px-4 py-2.5 text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Return to Exam
              </button>
              
              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded bg-blue-600 hover:bg-blue-700 border border-blue-700 px-5 py-2.5 text-white shadow cursor-pointer disabled:opacity-55"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Grading...</span>
                  </>
                ) : (
                  <span>Submit Exam</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
