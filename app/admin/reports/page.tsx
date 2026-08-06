"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldAlert, CheckCircle, AlertTriangle, ShieldX, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

interface InfractionSummary {
  reason: string;
  count: number;
}

interface StudentReport {
  attemptId: string;
  userId: string;
  userName: string;
  email: string;
  score: number;
  percentage: number;
  status: string;
  timeTakenSeconds: number;
  infractions: InfractionSummary[] | null;
  trustScore: number;
}

export default function ReportsDashboard() {
  const [testId, setTestId] = useState('corp-sec-2026');
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const fetchReports = async () => {
    if (!testId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8080/api/reports/tests/${testId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch reports. Ensure the test ID exists.');
      }
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const getTrustBadge = (score: number) => {
    if (score >= 80) return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> High Trust ({score}%)</span>;
    if (score >= 50) return <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Medium ({score}%)</span>;
    return <span className="bg-red-100 text-red-800 border border-red-200 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><ShieldX className="w-3 h-3"/> Low Trust ({score}%)</span>;
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans antialiased text-gray-800 p-6 flex justify-center">
      <div className="w-full max-w-6xl flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-300 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#1F70C1] text-white p-2.5 rounded shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Proctoring Trust Reports</h1>
              <p className="text-xs text-gray-500 font-medium font-mono">ADMINISTRATOR DASHBOARD</p>
            </div>
          </div>
          <button
            onClick={() => { window.location.href = '/'; }}
            className="flex items-center gap-1 bg-white hover:bg-gray-50 border border-gray-300 px-4 py-2 rounded text-xs font-bold font-sans uppercase text-gray-700 transition shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Lobby</span>
          </button>
        </div>

        {/* Controls */}
        <div className="bg-white border border-gray-300 rounded shadow-sm p-4 flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Test ID</label>
            <input 
              type="text" 
              value={testId} 
              onChange={e => setTestId(e.target.value)} 
              placeholder="e.g. corp-sec-2026 or mock-cat-full"
              className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <button 
            onClick={fetchReports}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition flex items-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Generate Report
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded text-sm font-bold">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 border-b border-gray-200 text-xs uppercase font-extrabold text-gray-600 tracking-wider">
              <tr>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Time Taken</th>
                <th className="px-4 py-3">Trust Score</th>
                <th className="px-4 py-3 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 font-medium">
                    No attempts found for this Test ID.
                  </td>
                </tr>
              )}
              {reports.map(report => {
                const isExpanded = expandedRow === report.attemptId;
                const totalInfractions = report.infractions?.reduce((acc, curr) => acc + curr.count, 0) || 0;
                
                return (
                  <React.Fragment key={report.attemptId}>
                    <tr className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900">{report.userName}</div>
                        <div className="text-xs text-gray-500 font-mono">{report.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${report.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                          {report.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold">
                        {report.percentage.toFixed(1)}% <span className="text-gray-400 text-xs">({report.score} pts)</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {Math.floor(report.timeTakenSeconds / 60)}m {report.timeTakenSeconds % 60}s
                      </td>
                      <td className="px-4 py-3">
                        {getTrustBadge(report.trustScore)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => setExpandedRow(isExpanded ? null : report.attemptId)}
                          className="text-gray-500 hover:text-gray-800 transition p-1"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-50 border-t-0">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="border border-gray-200 bg-white rounded p-4 shadow-sm">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3 border-b border-gray-100 pb-2">
                              Proctoring Infraction Breakdown ({totalInfractions} total incidents)
                            </h4>
                            {totalInfractions === 0 ? (
                              <p className="text-sm text-emerald-600 font-medium flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Perfect session. No infractions recorded.
                              </p>
                            ) : (
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {report.infractions?.map((inf, i) => (
                                  <li key={i} className="flex justify-between items-center text-sm border-b border-gray-100 pb-1 last:border-0">
                                    <span className="text-gray-700">{inf.reason}</span>
                                    <span className="font-mono bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">{inf.count} times</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
