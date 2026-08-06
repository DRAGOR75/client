"use client";
import React from 'react';
import { useTest } from '../context/TestContext';

export const TestHeader: React.FC = () => {
  const { payload, activeSectionIndex, isWaiting } = useTest();

  if (!payload) return null;

  const sections = ['VARC', 'DILR', 'QA'];

  return (
    <div className="w-full flex flex-col shrink-0 select-none">
      {/* 1. Top Ribbon: Dark Gray/Black Official Exam Title Bar */}
      <header className="w-full bg-[#333333] text-white px-4 py-3 flex items-center justify-between border-b border-zinc-950 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="bg-[#E4A11B] text-black font-extrabold text-[11px] px-2 py-0.5 rounded font-mono uppercase tracking-wide">
            CAT 2026
          </span>
          <h1 className="text-sm sm:text-base font-bold tracking-tight font-sans">
            {payload.test.title}
          </h1>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-gray-300 font-mono uppercase tracking-wider">
          <span>System ID: <span className="text-white font-bold">LAB-04_CBT</span></span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">Attempt Signature: <span className="text-white font-bold">{payload.attemptId.slice(0, 8)}</span></span>
        </div>
      </header>

      {/* 2. Sub-Ribbon: Light Gray/Blue Section Selection Bar */}
      <nav className="w-full bg-[#E5ECF4] border-b border-gray-300 px-4 py-2 flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-700 uppercase mr-3 font-sans">Sections:</span>
          {sections.map((secName, idx) => {
            const isActive = idx === activeSectionIndex && !isWaiting;
            
            if (isActive) {
              return (
                <button
                  key={secName}
                  disabled
                  className="bg-[#1F70C1] text-white text-xs font-bold px-5 py-1.5 rounded shadow-sm border border-[#165a9e] tracking-wide cursor-default uppercase font-sans transition-all"
                >
                  {secName}
                </button>
              );
            }

            return (
              <button
                key={secName}
                disabled
                className="bg-[#FFFFFF] text-gray-400 text-xs font-medium px-5 py-1.5 rounded border border-gray-250 cursor-not-allowed opacity-60 uppercase font-sans"
              >
                {secName}
              </button>
            );
          })}
        </div>
        <div className="text-[11px] text-blue-800 font-bold uppercase tracking-wider hidden sm:block font-mono bg-blue-50/50 px-3 py-1 rounded border border-blue-200">
          Enforced CAT-Style Segment Containment Locked
        </div>
      </nav>
    </div>
  );
};
