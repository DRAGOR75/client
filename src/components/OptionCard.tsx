"use client";
import React from 'react';

interface OptionCardProps {
  id: string;
  text: string;
  letter: string; // 'A', 'B', 'C', 'D' etc.
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  id,
  text,
  letter,
  isSelected,
  onSelect,
  disabled = false,
}) => {
  return (
    <button
      id={`option-${id}`}
      onClick={onSelect}
      disabled={disabled}
      className={`w-full text-left relative overflow-hidden transition-colors duration-150 rounded-lg border p-4 sm:p-5 flex items-center gap-4 focus:outline-none shadow-sm ${
        disabled
          ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-55'
          : isSelected
          ? 'bg-blue-50 border-blue-500 text-gray-900 cursor-pointer'
          : 'bg-white border-gray-300 hover:bg-gray-100 hover:border-gray-400 cursor-pointer'
      }`}
    >

      {/* Hotkey Letter Badge */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border shrink-0 transition-all duration-300 font-mono ${
          disabled
            ? 'bg-gray-50 text-gray-400 border-gray-200'
            : isSelected
            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/10 scale-105'
            : 'bg-gray-50 text-gray-650 border-gray-300'
        }`}
      >
        {letter}
      </div>

      {/* Option Text */}
      <span
        className={`text-sm sm:text-base transition-colors duration-300 font-sans ${
          disabled
            ? 'text-gray-400'
            : isSelected
            ? 'text-gray-900 font-semibold'
            : 'text-gray-700'
        }`}
      >
        {text}
      </span>

      {/* Right Checked Indicator dot */}
      <div className="ml-auto shrink-0 pl-2">
        <div
          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-300 ${
            disabled
              ? 'border-gray-200 bg-transparent'
              : isSelected
              ? 'border-blue-500 bg-blue-600 scale-110 shadow-sm'
              : 'border-gray-300 bg-transparent'
          }`}
        >
          {isSelected && !disabled && (
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-scale-up" />
          )}
        </div>
      </div>

    </button>
  );
};
