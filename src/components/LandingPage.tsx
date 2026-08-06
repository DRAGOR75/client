"use client";
import React from 'react';
import { ArrowRightLeft, ShieldCheck, Video, Clock, ChevronRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <ArrowRightLeft className="text-white" size={24} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">TAExams</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-500">
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <a href="#security" className="hover:text-blue-600 transition-colors">Security</a>
          <a href="#admin" className="hover:text-blue-600 transition-colors">Admin Portal</a>
        </div>
        <div>
          <a 
            href="#exam" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md font-semibold text-sm transition-all shadow-md shadow-blue-500/20"
          >
            Take an Exam
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
          The New Standard in <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            Secure Examinations
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10">
          TAExams delivers synchronized, AI-proctored testing environments across Web, Desktop, and Mobile. Complete hardware lockdown with zero compromises.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={async () => {
              try {
                // Instantly launch the demo exam from the server to bypass the waiting room
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/tests/';
                await fetch(`${API_BASE_URL}aws-sap-c02/launch`, { method: 'POST' });
                localStorage.setItem('activeTestId', 'aws-sap-c02');
                window.location.href = '/exam';
              } catch (e) {
                console.error("Failed to launch demo:", e);
                window.location.href = '/exam';
              }
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg shadow-blue-500/30 group cursor-pointer"
          >
            Launch Demo Exam
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <a 
            href="#admin" 
            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-8 py-4 rounded-lg font-bold text-lg transition-all"
          >
            Admin Dashboard
          </a>
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="bg-white border-y border-slate-200 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Enterprise-Grade Security Features</h2>
            <p className="text-slate-500">Built for high-stakes standardized testing and remote certifications.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Video className="text-blue-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">AI Face Proctoring</h3>
              <p className="text-slate-500 leading-relaxed">
                Native computer vision algorithms track candidate gaze, missing faces, and multiple people in real-time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="text-blue-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Kiosk Lockdown</h3>
              <p className="text-slate-500 leading-relaxed">
                Our Electron desktop shell completely disables Alt-Tabbing, screen recording, and right-clicking during the exam.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Clock className="text-blue-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">WebSocket Sync</h3>
              <p className="text-slate-500 leading-relaxed">
                Exam timers and section transitions are perfectly synchronized by the authoritative Go backend server.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-center text-sm">
        <p>© 2026 TAExams. All rights reserved.</p>
      </footer>
    </div>
  );
};
