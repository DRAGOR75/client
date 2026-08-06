"use client";

import React from 'react';
import { ArrowLeft, BookOpen, Link, Key, Shield } from 'lucide-react';

export default function LTIConfigPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans antialiased text-gray-800 p-6 flex justify-center">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-gray-300 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#E04403] text-white p-2.5 rounded shadow-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Moodle LTI 1.3 Configuration</h1>
              <p className="text-xs text-gray-500 font-medium font-mono">LMS EXTERNAL TOOL SETUP</p>
            </div>
          </div>
          <button
            onClick={() => { window.location.href = '/'; }}
            className="flex items-center gap-1 bg-white hover:bg-gray-50 border border-gray-300 px-4 py-2 rounded text-xs font-bold font-sans uppercase text-gray-700 transition shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        <div className="bg-white border border-gray-300 rounded shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
            Tool URLs (Paste into Moodle)
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase">Tool URL / Target Link URI</label>
              <div className="flex items-center gap-2 mt-1">
                <Link className="w-4 h-4 text-gray-400" />
                <code className="bg-gray-50 px-3 py-2 rounded border border-gray-200 text-sm font-mono flex-1 text-gray-800">
                  http://localhost:8080/lti/launch
                </code>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase">Initiate Login URL</label>
              <div className="flex items-center gap-2 mt-1">
                <Key className="w-4 h-4 text-gray-400" />
                <code className="bg-gray-50 px-3 py-2 rounded border border-gray-200 text-sm font-mono flex-1 text-gray-800">
                  http://localhost:8080/lti/login
                </code>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase">JWKS / Public Keyset URL</label>
              <div className="flex items-center gap-2 mt-1">
                <Shield className="w-4 h-4 text-gray-400" />
                <code className="bg-gray-50 px-3 py-2 rounded border border-gray-200 text-sm font-mono flex-1 text-gray-800">
                  http://localhost:8080/lti/jwks.json
                </code>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded shadow-sm p-5 text-sm text-blue-800">
          <p className="font-bold mb-1">Custom Parameters</p>
          <p className="mb-2">To link a specific corporate test to a Moodle course, add this to the "Custom parameters" box in Moodle:</p>
          <code className="block bg-blue-100/50 p-2 rounded text-xs font-mono border border-blue-200">
            test_id=corp-sec-2026
          </code>
        </div>
      </div>
    </div>
  );
}
