"use client";
import React, { useState, useEffect } from 'react';
import { Database, FileText, CheckCircle2, XCircle, Info, Upload, Trash2, ArrowLeft } from 'lucide-react';

interface ValidationError {
  type: 'error' | 'warning';
  message: string;
}

export const TestImporter: React.FC = () => {
  const [jsonText, setJsonText] = useState<string>('');
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [validationPassed, setValidationPassed] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Check backend server database connectivity
  useEffect(() => {
    fetch('http://localhost:8080/api/tests/aws-sap-c02/start')
      .then((res) => {
        if (res.ok || res.status === 404 || res.status === 409) {
          setDbConnected(true);
        } else {
          setDbConnected(false);
        }
      })
      .catch(() => setDbConnected(false));
  }, []);

  const loadTemplate = (format: 'full' | 'varc' | 'dilr' | 'qa' | 'corp') => {
    const templates: Record<string, object> = {
      full: {
        test: { id: "mock-cat-full", title: "All-India Mock CAT 2026 - Full Paper", description: "Complete 120-min, 3-section mock.", durationMinutes: 120 },
        sections: [
          { id: "sec-varc", testId: "mock-cat-full", name: "VARC", orderIndex: 0, durationMinutes: 40 },
          { id: "sec-dilr", testId: "mock-cat-full", name: "DILR", orderIndex: 1, durationMinutes: 40 },
          { id: "sec-qa", testId: "mock-cat-full", name: "QA", orderIndex: 2, durationMinutes: 40 }
        ],
        questions: [
          { id: "qf-v1", section_id: "sec-varc", text: "[Reading Passage]\n\nThe digital era has introduced a profound fragmentation of human attention...\n\nQuestion:\nThe author most likely views hyperlinks as:", points: 3, order: 1, options: [{ id: "of-v1a", text: "A democratization tool." }, { id: "of-v1b", text: "A cognitive tax impairing retention." }, { id: "of-v1c", text: "An irrelevant construct." }], correct_option_id: "of-v1b" },
          { id: "qf-d1", section_id: "sec-dilr", text: "[Logical Reasoning]\n\nFour leads—Ankit, Priya, John, Kabir—are assigned to modules...\n\nIf Kabir is on Frontend, Priya must be on:", points: 3, order: 2, options: [{ id: "of-d1a", text: "Database Module" }, { id: "of-d1b", text: "Backend APIs" }, { id: "of-d1c", text: "QA" }], correct_option_id: "of-d1a" },
          { id: "qf-q1", section_id: "sec-qa", text: "If f(x) = 2x² - 8x + 15, find the minimum value of f(x).", points: 3, order: 3, options: [{ id: "of-q1a", text: "7" }, { id: "of-q1b", text: "15" }, { id: "of-q1c", text: "2" }], correct_option_id: "of-q1a" }
        ]
      },
      varc: {
        test: { id: "sectional-varc", title: "Sectional Test — VARC (40 min)", description: "Verbal Ability & Reading Comprehension sectional practice.", durationMinutes: 40 },
        sections: [{ id: "sec-varc-s", testId: "sectional-varc", name: "VARC", orderIndex: 0, durationMinutes: 40 }],
        questions: [
          { id: "sv-1", section_id: "sec-varc-s", text: "[Reading Passage]\n\nModern cognitive psychology distinguishes between 'System 1' (fast, intuitive) and 'System 2' (slow, deliberate) thinking...\n\nQuestion:\nThe passage suggests that overreliance on System 1 thinking leads to:", points: 3, order: 1, options: [{ id: "sv-1a", text: "More accurate snap judgements under pressure." }, { id: "sv-1b", text: "Systematic cognitive biases in complex decisions." }, { id: "sv-1c", text: "Enhanced creativity and lateral thinking." }], correct_option_id: "sv-1b" },
          { id: "sv-2", section_id: "sec-varc-s", text: "[Reading Passage]\n\nThe principle of linguistic relativity holds that language shapes thought...\n\nQuestion:\nWhich statement best captures the author's stance on linguistic determinism?", points: 3, order: 2, options: [{ id: "sv-2a", text: "Language completely determines cognitive processes." }, { id: "sv-2b", text: "Language influences but does not dictate perception." }, { id: "sv-2c", text: "Thought and language are entirely independent." }], correct_option_id: "sv-2b" }
        ]
      },
      dilr: {
        test: { id: "sectional-dilr", title: "Sectional Test — DILR (40 min)", description: "Data Interpretation & Logical Reasoning sectional practice.", durationMinutes: 40 },
        sections: [{ id: "sec-dilr-s", testId: "sectional-dilr", name: "DILR", orderIndex: 0, durationMinutes: 40 }],
        questions: [
          { id: "sd-1", section_id: "sec-dilr-s", text: "[Data Set: Sales Performance]\n\nA company tracks Q1-Q4 revenue across 4 regions...\nNorth: 120, 150, 130, 160\nSouth: 90, 110, 100, 140\n\nQuestion:\nWhich region showed the highest percentage growth from Q1 to Q4?", points: 3, order: 1, options: [{ id: "sd-1a", text: "North (33%)" }, { id: "sd-1b", text: "South (56%)" }, { id: "sd-1c", text: "Both equal" }], correct_option_id: "sd-1b" },
          { id: "sd-2", section_id: "sec-dilr-s", text: "[Logical Puzzle]\n\nFive people sit in a row. A is not adjacent to B. C sits at one end. D is between A and E.\n\nQuestion:\nWho sits in the middle?", points: 3, order: 2, options: [{ id: "sd-2a", text: "A" }, { id: "sd-2b", text: "D" }, { id: "sd-2c", text: "E" }], correct_option_id: "sd-2b" }
        ]
      }
    };
    setJsonText(JSON.stringify(templates[format], null, 2));
    setValidationErrors([]);
    setValidationPassed(false);
    setImportStatus(null);
  };

  const validateSchema = (): boolean => {
    const errors: ValidationError[] = [];
    setImportStatus(null);

    if (!jsonText.trim()) {
      errors.push({ type: 'error', message: 'Question paper JSON cannot be empty.' });
      setValidationErrors(errors);
      setValidationPassed(false);
      return false;
    }

    try {
      const parsed = JSON.parse(jsonText);

      // 1. Validate Test object
      if (!parsed.test) {
        errors.push({ type: 'error', message: 'Root level must contain a "test" metadata object.' });
      } else {
        if (!parsed.test.id) errors.push({ type: 'error', message: 'Test metadata object is missing a unique "id".' });
        if (!parsed.test.title) errors.push({ type: 'error', message: 'Test metadata object is missing a "title".' });
        if (typeof parsed.test.durationMinutes !== 'number') {
          errors.push({ type: 'error', message: 'Test durationMinutes must be a valid integer.' });
        }
        if (parsed.test.type !== undefined && typeof parsed.test.type !== 'string') {
          errors.push({ type: 'error', message: 'Test type must be a valid string.' });
        }
        if (parsed.test.passingPercentage !== undefined && typeof parsed.test.passingPercentage !== 'number') {
          errors.push({ type: 'error', message: 'Test passingPercentage must be a valid numerical integer.' });
        }
      }

      // 2. Validate Sections array
      if (!parsed.sections || !Array.isArray(parsed.sections)) {
        errors.push({ type: 'error', message: 'Root level must contain a "sections" array.' });
      } else if (parsed.sections.length === 0) {
        errors.push({ type: 'error', message: 'At least one exam section block must be defined.' });
      } else {
        parsed.sections.forEach((sec: any, idx: number) => {
          if (!sec.id) errors.push({ type: 'error', message: `Section [${idx}] is missing a unique "id".` });
          if (!sec.name) errors.push({ type: 'error', message: `Section [${idx}] is missing a "name" (e.g. VARC).` });
          if (typeof sec.orderIndex !== 'number') {
            errors.push({ type: 'error', message: `Section [${idx}] is missing a valid numerical "orderIndex".` });
          }
        });
      }

      // 3. Validate Questions array
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        errors.push({ type: 'error', message: 'Root level must contain a "questions" array.' });
      } else if (parsed.questions.length === 0) {
        errors.push({ type: 'error', message: 'At least one question must be loaded in the paper.' });
      } else {
        const sectionIds = parsed.sections ? parsed.sections.map((s: any) => s.id) : [];

        parsed.questions.forEach((q: any, idx: number) => {
          const qLabel = q.id ? `Question "${q.id}"` : `Question [${idx}]`;

          if (!q.id) errors.push({ type: 'error', message: `Question [${idx}] is missing a unique "id".` });
          if (!q.section_id) {
            errors.push({ type: 'error', message: `${qLabel} is missing a parent "section_id".` });
          } else if (sectionIds.length > 0 && !sectionIds.includes(q.section_id)) {
            errors.push({ type: 'error', message: `${qLabel} references section_id "${q.section_id}" which is not defined.` });
          }

          if (!q.text) errors.push({ type: 'error', message: `${qLabel} is missing question "text" content.` });
          if (typeof q.points !== 'number') {
            errors.push({ type: 'error', message: `${qLabel} points value must be a numerical integer.` });
          }
          if (q.type && !['MCQ', 'MSQ', 'TITA'].includes(q.type)) {
            errors.push({ type: 'error', message: `${qLabel} type must be MCQ, MSQ, or TITA.` });
          }

          if (q.type !== 'TITA') {
            if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
              errors.push({ type: 'error', message: `${qLabel} must contain a list of at least 2 multiple-choice "options".` });
            } else {
              const optionIds = q.options.map((o: any) => o.id);
              q.options.forEach((opt: any, optIdx: number) => {
                if (!opt.id) errors.push({ type: 'error', message: `${qLabel} option [${optIdx}] is missing an "id".` });
                if (!opt.text) errors.push({ type: 'error', message: `${qLabel} option [${optIdx}] has empty text.` });
              });

              if (!q.correct_option_id) {
                errors.push({ type: 'error', message: `${qLabel} is missing the "correct_option_id".` });
              } else {
                const correctIds = q.correct_option_id.split(',').map((id: string) => id.trim());
                correctIds.forEach((cid: string) => {
                  if (!optionIds.includes(cid)) {
                    errors.push({
                      type: 'error',
                      message: `${qLabel} correct_option_id "${cid}" does not match any available option IDs.`,
                    });
                  }
                });
              }
            }
          } else {
            if (!q.correct_option_id) {
              errors.push({ type: 'error', message: `${qLabel} is TITA but missing the correct answer text in "correct_option_id".` });
            }
          }
        });
      }

    } catch (e: any) {
      errors.push({ type: 'error', message: `Invalid JSON format: ${e.message}` });
    }

    setValidationErrors(errors);
    const passed = errors.length === 0;
    setValidationPassed(passed);
    return passed;
  };

  const handleImport = async () => {
    if (!validateSchema() || isSubmitting) return;

    setIsSubmitting(true);
    setImportStatus(null);

    try {
      const res = await fetch('http://localhost:8080/api/tests/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonText,
      });

      const data = await res.json();

      if (res.ok) {
        setImportStatus({
          success: true,
          message: `Success! Test "${data.test_id}" imported and activated in the CBT engine database successfully.`,
        });
      } else {
        setImportStatus({
          success: false,
          message: `Import rejected by server: ${data.message || 'Unknown server error.'}`,
        });
      }
    } catch (err: any) {
      setImportStatus({
        success: false,
        message: `Failed to contact Go REST server: ${err.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans antialiased text-gray-800 p-6 flex justify-center">
      <div className="w-full max-w-5xl flex flex-col gap-6">

        {/* Header Ribbon bar */}
        <div className="flex items-center justify-between border-b border-gray-300 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#1F70C1] text-white p-2.5 rounded shadow-sm">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Mock Exam Importer Console</h1>
              <p className="text-xs text-gray-500 font-medium font-mono">ADMIN CONTROL BOARD • DYNAMIC TEST INJECTION</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Database connectivity status pill */}
            <div className={`px-3 py-1.5 rounded-full border text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-sm ${dbConnected === true
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 animate-pulse'
                : dbConnected === false
                  ? 'bg-red-50 border-red-300 text-red-750'
                  : 'bg-gray-100 border-gray-300 text-gray-500'
              }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${dbConnected === true ? 'bg-emerald-600' : dbConnected === false ? 'bg-red-650' : 'bg-gray-400'
                }`} />
              <span>{dbConnected === true ? 'GO_REST_CONNECTED' : dbConnected === false ? 'GO_REST_DISCONNECTED' : 'CHECKING_API'}</span>
            </div>

            <button
              onClick={() => { window.location.href = '/'; }}
              className="flex items-center gap-1 bg-white hover:bg-gray-50 border border-gray-300 px-4 py-2 rounded text-xs font-bold font-sans uppercase text-gray-700 transition shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Lobby</span>
            </button>
          </div>
        </div>

        {/* Dashboard Main Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Editor pane */}
          <div className="lg:col-span-2 flex flex-col border border-gray-300 rounded bg-white shadow-sm overflow-hidden h-[620px]">

            <div className="bg-[#E5ECF4] border-b border-gray-300 px-4 py-2.5 flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#1F70C1]" />
                JSON Question Paper Editor
              </span>
              <div className="flex gap-1.5 flex-wrap">
                <button onClick={() => loadTemplate('full')} className="bg-blue-600 hover:bg-blue-700 border border-blue-700 text-white px-2.5 py-1 rounded text-[10px] font-bold uppercase transition">Full Mock (120m)</button>
                <button onClick={() => loadTemplate('varc')} className="bg-amber-500 hover:bg-amber-600 border border-amber-600 text-white px-2.5 py-1 rounded text-[10px] font-bold uppercase transition">VARC (40m)</button>
                <button onClick={() => loadTemplate('dilr')} className="bg-purple-600 hover:bg-purple-700 border border-purple-700 text-white px-2.5 py-1 rounded text-[10px] font-bold uppercase transition">DILR (40m)</button>
                <button onClick={() => loadTemplate('qa')} className="bg-teal-600 hover:bg-teal-700 border border-teal-700 text-white px-2.5 py-1 rounded text-[10px] font-bold uppercase transition">QA (40m)</button>
                <button onClick={() => loadTemplate('corp')} className="bg-indigo-600 hover:bg-indigo-700 border border-indigo-700 text-white px-2.5 py-1 rounded text-[10px] font-bold uppercase transition">Corporate (60m)</button>
                <button
                  onClick={() => { setJsonText(''); setValidationErrors([]); setValidationPassed(false); setImportStatus(null); }}
                  className="bg-white hover:bg-gray-100 border border-gray-300 text-red-600 px-2 py-1 rounded text-[10px] font-bold uppercase transition"
                  title="Clear text editor"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <textarea
              value={jsonText}
              onChange={(e) => { setJsonText(e.target.value); setValidationPassed(false); }}
              placeholder={`{\n  "test": {\n    "id": "new-exam-id",\n    "title": "Mock CAT Assessment",\n    "durationMinutes": 120\n  } ...\n}`}
              className="flex-1 w-full p-4 font-mono text-xs leading-relaxed border-0 focus:ring-0 focus:outline-none resize-none overflow-y-auto bg-gray-50/50"
            />
          </div>

          {/* Right Column: Validation checklists and controls */}
          <div className="lg:col-span-1 flex flex-col gap-6">

            {/* Control Panel panel */}
            <div className="border border-gray-300 rounded bg-white shadow-sm p-4 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2">
                Publishing Panel
              </h3>

              <div className="flex flex-col gap-2">
                <button
                  onClick={validateSchema}
                  className="w-full bg-white hover:bg-gray-55 border border-gray-300 text-gray-700 rounded py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
                >
                  Validate Schema
                </button>

                <button
                  onClick={handleImport}
                  disabled={!validationPassed || isSubmitting || dbConnected === false}
                  className={`w-full flex items-center justify-center gap-2 rounded py-3 text-xs font-bold uppercase tracking-wider border shadow transition-all ${!validationPassed || dbConnected === false
                      ? 'bg-gray-100 border-gray-205 text-gray-400 cursor-not-allowed opacity-60'
                      : 'bg-[#5CB85C] hover:bg-[#4cae4c] border-[#4cae4c] text-white cursor-pointer'
                    }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>{isSubmitting ? 'Uploading...' : 'Publish Test Paper'}</span>
                </button>
              </div>

              {/* Status Alert displays */}
              {importStatus && (
                <div className={`p-4 rounded border text-xs font-mono font-medium leading-relaxed uppercase ${importStatus.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-red-50 border-red-300 text-red-700'
                  }`}>
                  <div className="flex gap-2 items-start">
                    {importStatus.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                    )}
                    <span>{importStatus.message}</span>
                  </div>
                </div>
              )}

              {/* Launch & Take Test button — appears after successful import */}
              {importStatus?.success && (
                <button
                  onClick={async () => {
                    try {
                      const parsed = JSON.parse(jsonText);
                      const testId = parsed.test?.id;
                      if (!testId) return;
                      await fetch(`http://localhost:8080/api/tests/${testId}/launch`, { method: 'POST' });
                      localStorage.setItem('activeTestId', testId);
                      window.location.href = '/';
                    } catch { /* ignore */ }
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded py-3 text-xs font-bold uppercase tracking-wider border shadow transition-all bg-[#1F70C1] hover:bg-[#1a5fa6] border-[#1a5fa6] text-white cursor-pointer"
                >
                  Launch & Take This Test
                </button>
              )}
            </div>

            {/* Validation Checklist Panel */}
            <div className="border border-gray-300 rounded bg-white shadow-sm p-4 flex-1 flex flex-col min-h-[300px]">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2 mb-3">
                Validation Status Checklist
              </h3>

              {validationErrors.length > 0 ? (
                <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
                  {validationErrors.map((err, idx) => (
                    <div key={idx} className="p-3 rounded border bg-red-50/50 border-red-200 text-red-750 text-xs font-mono leading-relaxed uppercase flex gap-2 items-start">
                      <XCircle className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" />
                      <span>{err.message}</span>
                    </div>
                  ))}
                </div>
              ) : validationPassed ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-emerald-50/20 border border-dashed border-emerald-300 rounded">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3 animate-bounce" />
                  <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider font-mono">
                    Schema Integrity Valid!
                  </span>
                  <p className="text-[10px] text-emerald-600 font-semibold uppercase mt-1 font-mono leading-relaxed">
                    All objects, arrays, UUID bounds, section keys, and answer references match the Go storage specifications.
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50 border border-dashed border-gray-300 rounded">
                  <Info className="w-12 h-12 text-gray-400 mb-3" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider font-mono">
                    Awaiting Validation Check
                  </span>
                  <p className="text-[10px] text-gray-400 font-medium uppercase mt-1 font-mono leading-relaxed">
                    Paste your paper schema in the editor and click &quot;Validate Schema&quot; to start auditing properties.
                  </p>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
