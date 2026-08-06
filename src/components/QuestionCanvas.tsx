"use client";
import React, { useEffect, useState } from 'react';
import { useTest } from '../context/TestContext';
import { OptionCard } from './OptionCard';
import { HelpCircle } from 'lucide-react';

export const QuestionCanvas: React.FC = () => {
  const {
    payload,
    currentQuestionIndex,
    answers,
    markedForReview,
    setCurrentQuestionIndex,
    selectOption,
    clearSelection,
    toggleMarkForReview,
    isCompleted,
    connectionLost,
    isWaiting,
    activeSection,
  } = useTest();

  const [localSelectedOption, setLocalSelectedOption] = useState<string | null>(null);

  const currentQuestion = payload?.questions?.[currentQuestionIndex];

  // Sync localSelectedOption with answers database sync when index swaps
  useEffect(() => {
    if (currentQuestion) {
      setLocalSelectedOption(answers[currentQuestion.id] || null);
    }
  }, [currentQuestionIndex, currentQuestion?.id, answers]);

  // Keyboard Shortcuts Hook
  useEffect(() => {
    if (isCompleted || connectionLost || isWaiting) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentQuestion) return;
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key.toLowerCase();

      // Save & Next shortcut (Enter)
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSaveNext();
      }

      // Mark for Review (m)
      if (key === 'm') {
        e.preventDefault();
        handleMarkReviewNext();
      }

      // Clear selection (Escape)
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClearResponse();
      }

      // Option selection hotkeys (a, b, c, d)
      const optionIndex = key.charCodeAt(0) - 97; // 'a' = 0, 'b' = 1, etc.
      if (optionIndex >= 0 && optionIndex < currentQuestion.options.length && key.length === 1) {
        e.preventDefault();
        setLocalSelectedOption(currentQuestion.options[optionIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, currentQuestion, localSelectedOption, isCompleted, connectionLost, isWaiting, payload?.questions]);

  if (!payload || payload.questions.length === 0 || !currentQuestion) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 p-4">
        <HelpCircle className="h-10 w-10 text-gray-400 animate-pulse" />
        <p className="mt-2 text-xs text-gray-500 font-bold uppercase tracking-wider font-mono">
          No questions loaded in active section segment.
        </p>
      </div>
    );
  }

  // Navigation handlers satisfying TCS iON state triggers
  const handleSaveNext = () => {
    if (isCompleted || connectionLost || isWaiting) return;

    if (localSelectedOption !== null) {
      selectOption(currentQuestion.id, localSelectedOption);
    }
    
    if (currentQuestionIndex < payload.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleMarkReviewNext = () => {
    if (isCompleted || connectionLost || isWaiting) return;

    // Save choice locally to context DB if selected
    if (localSelectedOption !== null) {
      selectOption(currentQuestion.id, localSelectedOption);
    }

    // Set mark reviews
    if (!markedForReview.includes(currentQuestion.id)) {
      toggleMarkForReview(currentQuestion.id);
    }

    if (currentQuestionIndex < payload.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleClearResponse = () => {
    if (isCompleted || connectionLost || isWaiting) return;

    setLocalSelectedOption(null);
    clearSelection(currentQuestion.id);
    
    // Also clear from mark reviews if present
    if (markedForReview.includes(currentQuestion.id)) {
      toggleMarkForReview(currentQuestion.id);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Determine split screen bounds
  const isSplitSection = activeSection?.name === 'VARC' || activeSection?.name === 'DILR' || !!currentQuestion.passage;
  let passageText = '';
  let questionText = currentQuestion.text;

  if (isSplitSection) {
    if (currentQuestion.passage) {
      passageText = currentQuestion.passage.text;
      if (currentQuestion.passage.title) {
        passageText = `${currentQuestion.passage.title.toUpperCase()}\n\n${currentQuestion.passage.text}`;
      }
    } else {
      // Fallback to extraction-based splitting
      const questionHeaderIndex = currentQuestion.text.indexOf('Question:');
      if (questionHeaderIndex !== -1) {
        passageText = currentQuestion.text.slice(0, questionHeaderIndex).trim();
        questionText = currentQuestion.text.slice(questionHeaderIndex).trim();
      }
    }
  }

  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="w-full flex flex-col h-[calc(100vh-170px)] bg-white select-none">
      
      {/* Split Dual-Pane View Area */}
      <div className="flex-1 min-h-0 w-full grid grid-cols-1 md:grid-cols-2 divide-x divide-gray-300">
        
        {/* Left Column: Passage area for VARC/DILR sections */}
        {isSplitSection ? (
          <div className="h-full overflow-y-auto p-5 leading-relaxed text-gray-800 text-sm font-sans bg-gray-50/30 whitespace-pre-line select-text">
            <div className="max-w-prose">
              {passageText}
            </div>
          </div>
        ) : null}

        {/* Right Column: Active Question Canvas */}
        <div className={`h-full overflow-y-auto p-5 flex flex-col gap-4 min-w-0 ${!isSplitSection ? 'col-span-2' : ''}`}>
          
          {/* Section Indicator and Value */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
            <span className="text-[10px] font-bold text-[#1F70C1] bg-blue-50 border border-blue-200 px-2.5 py-1 rounded font-mono uppercase tracking-wide">
              Question {currentQuestionIndex + 1} of {payload.questions.length}
            </span>
            <div className="text-[10px] font-bold text-gray-500 uppercase font-mono flex gap-3">
              <span>Marks: <span className="text-gray-900 font-extrabold">+3 / -1</span></span>
            </div>
          </div>

          {/* Question Text */}
          <div className="text-sm font-semibold text-gray-900 leading-relaxed font-sans whitespace-pre-line">
            {questionText}
          </div>

          {/* Option Stack */}
          <div className="flex flex-col gap-2.5 mt-2">
            {currentQuestion.options.map((option, idx) => (
              <OptionCard
                key={option.id}
                id={option.id}
                text={option.text}
                letter={letters[idx] || '?'}
                isSelected={localSelectedOption === option.id}
                onSelect={() => !isCompleted && !connectionLost && !isWaiting && setLocalSelectedOption(option.id)}
                disabled={isCompleted || connectionLost || isWaiting}
              />
            ))}
          </div>

        </div>

      </div>

      {/* Sticky Bottom TCS iON Navigation Bar */}
      <footer className="w-full bg-[#E5ECF4] border-t border-gray-300 px-4 py-3 flex items-center justify-between shadow-inner shrink-0 z-10">
        
        {/* Left Side Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkReviewNext}
            disabled={isCompleted || connectionLost || isWaiting}
            className={`px-4 py-2 border rounded text-xs font-bold font-sans uppercase shadow-sm transition-colors ${
              isCompleted || connectionLost || isWaiting
                ? 'bg-gray-100 border-gray-250 text-gray-400 cursor-not-allowed opacity-50'
                : 'bg-[#5D3F8A] hover:bg-[#4a2e6f] border-[#4a2e6f] text-white cursor-pointer'
            }`}
          >
            Mark for Review & Next
          </button>
          
          <button
            onClick={handleClearResponse}
            disabled={isCompleted || connectionLost || isWaiting}
            className={`px-4 py-2 border rounded text-xs font-bold font-sans uppercase shadow-sm transition-colors ${
              isCompleted || connectionLost || isWaiting
                ? 'bg-gray-100 border-gray-250 text-gray-400 cursor-not-allowed opacity-50'
                : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700 cursor-pointer'
            }`}
          >
            Clear Response
          </button>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`px-4 py-2 border rounded text-xs font-bold font-sans uppercase shadow-sm transition-colors ${
              currentQuestionIndex === 0
                ? 'bg-gray-100 border-gray-205 text-gray-400 cursor-not-allowed opacity-50'
                : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700 cursor-pointer'
            }`}
          >
            Previous
          </button>

          <button
            onClick={handleSaveNext}
            disabled={isCompleted || connectionLost || isWaiting}
            className={`px-5 py-2 border rounded text-xs font-bold font-sans uppercase shadow-sm transition-colors ${
              isCompleted || connectionLost || isWaiting
                ? 'bg-gray-100 border-gray-250 text-gray-400 cursor-not-allowed opacity-50'
                : 'bg-[#5CB85C] hover:bg-[#4cae4c] border-[#4cae4c] text-white cursor-pointer'
            }`}
          >
            Save & Next
          </button>
        </div>

      </footer>

    </div>
  );
};
