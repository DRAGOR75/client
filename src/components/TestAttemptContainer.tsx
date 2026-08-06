"use client";
import React, { useState, useEffect } from 'react';
import { TestProvider, useTest } from '../context/TestContext';
import { TestHeader } from './TestHeader';
import { QuestionCanvas } from './QuestionCanvas';
import { QuestionPalette } from './QuestionPalette';
import { ProctoringOverlay } from './ProctoringOverlay';
import { ShieldCheck, Award, Calendar, User, CheckCircle2, ShieldAlert, Clock, X } from 'lucide-react';

const TestAttemptMainLayout: React.FC = () => {
  const { 
    isCompleted, 
    payload, 
    isLoading, 
    error, 
    connectionLost, 
    submitResult, 
    isWaiting,
    transitioning,
    logInfraction 
  } = useTest();

  const [fullscreenBroken, setFullscreenBroken] = useState(false);

  // --- ANTI-CHEAT HARDENING TRIGGERS ---

  // Anti-Cheat 1: Fullscreen lock triggers and changes
  useEffect(() => {
    if (isWaiting || isCompleted || !payload) return;

    const requestFullscreenMode = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
          setFullscreenBroken(false);
        }
      } catch (err) {
        console.warn("[Anti-Cheat] Fullscreen request restricted by browser.");
        setFullscreenBroken(true);
      }
    };

    requestFullscreenMode();

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFullscreenBroken(true);
        logInfraction("Student exited fullscreen mode");
      } else {
        setFullscreenBroken(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isWaiting, isCompleted, payload]);

  // Anti-Cheat 2: Tab Visibility shift tracking
  useEffect(() => {
    if (isWaiting || isCompleted || !payload) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logInfraction("Student switched tabs or minimized browser");
        alert("SECURITY VIOLATION:\n\nA tab switch or window minimization has been detected. Swapping focus during a high-stakes exam is strictly forbidden. This incident has been cryptographically logged.");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isWaiting, isCompleted, payload]);

  // Anti-Cheat 3: Global hotkey lockouts (Copy, Paste, Print, Context menu)
  useEffect(() => {
    const blockKeys = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      if (isCtrl && (e.key === 'c' || e.key === 'v' || e.key === 'p')) {
        e.preventDefault();
        logInfraction(`Blocked keystroke attempt: Ctrl+${e.key}`);
        alert("SECURITY ACTION: Copying, pasting, and printing are disabled in this testing terminal.");
      }
    };

    const blockContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      alert("SECURITY ACTION: Context menus are disabled in this testing terminal.");
    };

    document.addEventListener('keydown', blockKeys);
    document.addEventListener('contextmenu', blockContextMenu);

    return () => {
      document.removeEventListener('keydown', blockKeys);
      document.removeEventListener('contextmenu', blockContextMenu);
    };
  }, []);

  // 1. Sleek, clinical loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <div className="w-full max-w-md rounded border border-gray-300 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <h2 className="text-xs font-bold text-gray-900 tracking-wide font-mono">ESTABLISHING SECURE TERMINAL</h2>
          <p className="mt-2 text-xs text-gray-500 font-semibold uppercase tracking-wider">Contacting authoritative Go API...</p>
        </div>
      </div>
    );
  }

  // 2. High-visibility connection error capture panel
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <div className="w-full max-w-md rounded border border-red-500 bg-red-50/30 p-8 text-center shadow-md">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 border border-red-400 text-red-650">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-gray-900 tracking-wide">CONNECTION TAMPERED OR FAILURE</h2>
          <p className="mt-2 text-xs text-red-750 font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full rounded bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 font-bold text-xs cursor-pointer shadow transition-all border border-blue-700"
          >
            Retry Connection Handshake
          </button>
        </div>
      </div>
    );
  }

  if (!payload) return null;

  // 3. E2E waiting room cohort dashboard
  if (isWaiting) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <TestHeader />
        
        <main className="flex-1 mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 w-full flex items-center justify-center bg-white">
          <div className="w-full rounded border border-gray-300 bg-white p-12 text-center shadow-sm">
            
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 border border-blue-400 text-blue-600 animate-pulse">
              <Clock className="h-8 w-8" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 uppercase font-mono">
              Synchronized Waiting Room
            </h2>
            <p className="mt-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">
              Terminal attempt signature: <span className="text-blue-600">{payload.attemptId}</span>
            </p>

            <div className="mt-8 rounded bg-gray-50 border border-gray-250 p-6 max-w-md mx-auto text-left leading-relaxed flex flex-col gap-3 font-mono text-xs">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500 animate-ping" />
                <span className="font-bold text-gray-900 uppercase">System Status: Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 uppercase">Assessment:</span>
                <span className="text-gray-900 font-bold uppercase">{payload.test.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 uppercase">Student Candidate:</span>
                <span className="text-gray-900 font-bold uppercase">candidate_principal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 uppercase">Lobby State:</span>
                <span className="text-yellow-600 font-bold uppercase">Awaiting Instructor Launch</span>
              </div>
            </div>

            <div className="mt-8 text-xs font-semibold text-gray-400 uppercase tracking-wider animate-pulse leading-relaxed">
              Do not refresh or exit this screen. The assessment will begin automatically and synchronized for the entire cohort. Fullscreen locks will engage immediately.
            </div>

            <div className="mt-8 flex justify-center gap-2.5 text-xs text-gray-500 font-bold uppercase tracking-widest font-mono">
              <div className="h-4 w-4 rounded-full border-2 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent animate-spin shrink-0" />
              <span>WAITING_FOR_INSTRUCTOR</span>
            </div>

          </div>
        </main>
      </div>
    );
  }

  // 4. Render Server-Graded Completed Dashboard
  if (isCompleted) {
    const elapsedMinutes = submitResult ? Math.floor(submitResult.timeTakenSeconds / 60) : 0;
    const elapsedSeconds = submitResult ? submitResult.timeTakenSeconds % 60 : 0;
    const isPass = submitResult ? submitResult.percentage >= 60 : false;

    return (
      <div className="min-h-screen flex flex-col bg-white">
        <TestHeader />
        
        <main className="flex-1 mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 w-full flex items-center justify-center bg-white">
          <div className="w-full overflow-hidden rounded border border-gray-300 bg-white p-8 text-center shadow-sm">
            
            <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border ${
              isPass 
                ? 'bg-emerald-50 border-emerald-500 text-emerald-600' 
                : 'bg-blue-50 border-blue-500 text-blue-600'
            }`}>
              <Award className="h-10 w-10" />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl font-mono uppercase">
              Secure Assessment Finalized
            </h2>
            <p className="mt-2 text-xs text-gray-500 font-medium uppercase tracking-widest font-mono">
              Terminal Verification Signature: <span className="text-blue-600 font-bold">{payload.attemptId}</span>
            </p>

            {/* Scorecard Grid */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-2xl mx-auto">
              
              <div className="rounded border border-gray-300 bg-gray-50 p-5 flex flex-col items-center justify-center shadow-sm">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 font-mono">Graded Score</span>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-gray-900">
                  {submitResult?.score ?? 0} <span className="text-gray-500 text-lg">/ {submitResult?.maxScore ?? 0}</span>
                </span>
                <span className="text-[9px] text-gray-500 font-bold mt-1 uppercase font-mono">Authoritative Points</span>
              </div>

              <div className="rounded border border-gray-300 bg-gray-50 p-5 flex flex-col items-center justify-center shadow-sm">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 font-mono">Percentage</span>
                <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${
                  isPass ? 'text-emerald-600' : 'text-blue-605'
                }`}>
                  {submitResult?.percentage ? submitResult.percentage.toFixed(1) : '0.0'}%
                </span>
                <span className="text-[9px] text-gray-500 font-bold mt-1 uppercase font-mono">Grade Status</span>
              </div>

              <div className="rounded border border-gray-300 bg-gray-50 p-5 flex flex-col items-center justify-center shadow-sm">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 font-mono">Duration Elapsed</span>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-gray-900 flex items-baseline gap-1">
                  {elapsedMinutes} <span className="text-xs text-gray-400 font-bold uppercase">m</span> {elapsedSeconds} <span className="text-xs text-gray-400 font-bold uppercase">s</span>
                </span>
                <span className="text-[9px] text-gray-500 font-bold mt-1 uppercase font-mono">Authoritative Time</span>
              </div>

            </div>

            {/* Verification audit log */}
            <div className="mt-8 rounded bg-gray-50 border border-gray-300 p-6 text-left max-w-lg mx-auto flex flex-col gap-4 shadow-sm font-mono text-xs">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-3 font-bold">
                <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
                <span className="text-gray-900 uppercase">Assessment Authentication Log</span>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <User className="h-4 w-4 text-gray-500 shrink-0" />
                <span className="text-gray-600 font-semibold">Candidate Identifier:</span>
                <span className="ml-auto font-mono text-xs font-bold text-gray-900 bg-white border border-gray-300 px-2 py-0.5 rounded">candidate_principal</span>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <Calendar className="h-4 w-4 text-gray-500 shrink-0" />
                <span className="text-gray-600 font-semibold">Time Stamp:</span>
                <span className="ml-auto font-mono text-xs text-gray-950">{new Date().toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <CheckCircle2 className="h-4 w-4 text-gray-500 shrink-0" />
                <span className="text-gray-600 font-semibold">Grading Details:</span>
                <span className="ml-auto font-mono font-bold text-emerald-600">{submitResult?.correctCount ?? 0} / {submitResult?.totalQuestions ?? 0} Correct</span>
              </div>
            </div>

            {/* Assessment Breakdown */}
            {submitResult?.breakdown && submitResult.breakdown.length > 0 && (
              <div className="mt-8 text-left max-w-2xl mx-auto">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-2 mb-4 font-mono">
                  Detailed Results Breakdown
                </h3>
                <div className="flex flex-col gap-4">
                  {submitResult.breakdown.map((q, idx) => (
                    <div key={q.questionId} className={`p-4 rounded border shadow-sm ${q.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex gap-3 mb-3 items-start">
                        <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${q.isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}>
                          {q.isCorrect ? <CheckCircle2 className="w-3 h-3 text-white" /> : <X className="w-3 h-3 text-white" />}
                        </div>
                        <p className="text-xs font-bold text-gray-800 leading-relaxed font-sans whitespace-pre-wrap">
                          Q{idx + 1}: {q.questionText}
                        </p>
                      </div>
                      <div className="pl-8 flex flex-col gap-2 font-mono text-[10px]">
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-gray-500 w-24 shrink-0 uppercase">Your Answer:</span>
                          <span className={`font-semibold ${q.isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                            {q.userOptionText || <span className="text-gray-400 italic">No Answer Selected</span>}
                          </span>
                        </div>
                        {!q.isCorrect && (
                          <div className="flex items-start gap-2">
                            <span className="font-bold text-gray-500 w-24 shrink-0 uppercase">Correct Answer:</span>
                            <span className="font-semibold text-gray-900">
                              {q.correctOptionText}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 rounded bg-gray-50 border border-gray-300 p-4 text-xs text-gray-600 max-w-lg mx-auto text-left leading-relaxed">
              <span className="font-bold text-gray-800 block mb-1">Authoritative Verification Stamp:</span>
              Your responses were securely graded directly against internal database record hashes. The exam state has been finalized, database locked, and session invalidated.
            </div>

            <button
              onClick={() => window.location.reload()}
              className="mt-8 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase px-6 py-3.5 tracking-wider transition-colors border border-blue-700 shadow"
            >
              Start New Test Simulation
            </button>

          </div>
        </main>
      </div>
    );
  }

  // 5. Render Active Exam Matrix
  return (
    <div className="min-h-screen flex flex-col relative bg-white select-none">
      <TestHeader />
      
      <main className="flex-1 w-full bg-white max-w-[100vw] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4 h-full">
          
          {/* Main Question Presentation Column (Takes up 75% on large screens) */}
          <div className="lg:col-span-3 border-r border-gray-300 h-full flex flex-col">
            <QuestionCanvas />
          </div>

          {/* Sidebar Navigation Palette Column (Takes up 25% on large screens) */}
          <div className="lg:col-span-1 bg-[#F9F9F9] h-full overflow-y-auto p-4">
            <QuestionPalette />
          </div>

        </div>
      </main>

      {/* Proctoring AI Engine */}
      <ProctoringOverlay />

      {/* 6. Section Transition Overlay splash */}
      {transitioning && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded border border-gray-300 bg-white p-8 text-center shadow-2xl animate-scale-in">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 border border-blue-400 text-blue-600 animate-spin">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 tracking-wide uppercase font-sans">Section Complete</h3>
            <p className="mt-2 text-xs text-gray-650 font-semibold uppercase tracking-wider leading-relaxed">
              Moving dynamically to the next CAT exam section block...
            </p>
            <div className="mt-5 text-[10px] font-mono text-blue-800 font-bold uppercase tracking-widest bg-blue-50 border border-blue-200 px-3 py-1.5 rounded">
              Server Action: Lock & Transition Applied
            </div>
          </div>
        </div>
      )}

      {/* 7. Non-dismissible Full-screen Connection Lost overlay */}
      {connectionLost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded border border-red-500 bg-white p-8 text-center shadow-2xl animate-scale-in">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 border border-red-400 text-red-650 animate-pulse">
              <ShieldAlert className="h-7 w-7" />
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 tracking-wide uppercase font-mono">Connection Lost</h3>
            <p className="mt-2 text-xs text-gray-600 font-semibold uppercase tracking-wider">
              Reconnecting to secure CBT testing network...
            </p>
            
            <div className="mt-5 flex flex-col items-center gap-2 text-xs font-bold text-red-750 bg-red-50 border border-red-300 p-4 rounded text-left leading-relaxed">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-ping shrink-0" />
                <span className="text-gray-900 uppercase tracking-wider font-extrabold text-[10px]">Security Notice:</span>
              </div>
              <span className="text-red-750 font-medium">
                Connection severed. Heartbeat paused. The server countdown is still active. Please remain on this screen.
              </span>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2.5 text-xs text-gray-500 font-bold uppercase tracking-widest font-mono">
              <div className="h-4 w-4 rounded-full border-2 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent animate-spin shrink-0" />
              <span>HANDSHAKE_RETRY_ACTIVE</span>
            </div>
          </div>
        </div>
      )}

      {/* 8. Strict Fullscreen Broken Block Overlay */}
      {fullscreenBroken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded border border-red-500 bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 border border-red-400 text-red-650 animate-pulse">
              <ShieldAlert className="h-7 w-7" />
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 tracking-wide uppercase font-mono">FULLSCREEN INTEGRITY BREACHED</h3>
            <p className="mt-2 text-xs text-red-750 font-semibold uppercase tracking-wider leading-relaxed">
              Standardized testing policies demand containerized fullscreen lockouts to guarantee exam integrity.
            </p>
            
            <div className="mt-6 text-xs text-gray-650 leading-relaxed text-left bg-gray-50 p-4 rounded border border-gray-300 font-mono">
              <span className="font-bold text-gray-900 block mb-1">Incident Report Status:</span>
              Exiting fullscreen modes switches environment focus, triggering an infraction log to the Go database audit board. Click below to immediately re-engage containment.
            </div>

            <button
              onClick={async () => {
                try {
                  await document.documentElement.requestFullscreen();
                  setFullscreenBroken(false);
                } catch (err) {
                  alert("Please grant fullscreen permissions to continue your exam.");
                }
              }}
              className="mt-6 w-full rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase px-4 py-3 tracking-wider transition-all border border-blue-700 shadow"
            >
              Re-engage Fullscreen Lock
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const TestAttemptContainer: React.FC = () => {
  return (
    <TestProvider>
      <TestAttemptMainLayout />
    </TestProvider>
  );
};
