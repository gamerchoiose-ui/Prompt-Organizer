import React, { useState, useEffect } from 'react';
import { PromptItem } from '../types';
import { jsPDF } from 'jspdf';
import { X, Copy, Check, Play, Sparkles, Code, FileText, Calendar, Clock, Tag, Download, RefreshCw } from 'lucide-react';

interface PromptDetailModalProps {
  prompt: PromptItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAIOptimize: (prompt: PromptItem) => void;
  onAction?: () => void;
}

export const PromptDetailModal: React.FC<PromptDetailModalProps> = ({
  prompt,
  isOpen,
  onClose,
  onOpenAIOptimize,
  onAction,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTab, setActiveTab] = useState<'view' | 'json' | 'test'>('view');

  // Extract variables like {{variable}} from prompt_text
  useEffect(() => {
    if (prompt?.prompt_text) {
      const matches = prompt.prompt_text.match(/\{\{([^}]+)\}\}/g);
      const vars: Record<string, string> = {};
      if (matches) {
        matches.forEach((m) => {
          const varName = m.replace(/\{\{|\}\}/g, '').trim();
          vars[varName] = '';
        });
      }
      setVariables(vars);
      setTestOutput(null);
    }
  }, [prompt]);

  if (!isOpen || !prompt) return null;

  const handleCopyText = () => {
    navigator.clipboard.writeText(prompt.prompt_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onAction?.();
  };

  const handleCopyAndClose = () => {
    navigator.clipboard.writeText(prompt.prompt_text);
    onAction?.();
    onClose();
  };

  const handleCopyJson = () => {
    const jsonStr = JSON.stringify(prompt, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.text(prompt.name, 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Category: ${prompt.associated_task}`, 20, y);
    y += 6;
    doc.text(`Prompt ID: ${prompt.prompt_id}`, 20, y);
    y += 6;
    if (prompt.tags && prompt.tags.length > 0) {
      doc.text(`Tags: ${prompt.tags.map(t => '#' + t).join(', ')}`, 20, y);
      y += 6;
    }
    doc.text(`Created: ${new Date(prompt.date_created).toLocaleDateString()}`, 20, y);
    y += 10;

    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.text('Description:', 20, y);
    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    const descLines = doc.splitTextToSize(prompt.description || '', pageWidth - 40);
    doc.text(descLines, 20, y);
    y += descLines.length * 6 + 10;

    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.text('Prompt Text:', 20, y);
    y += 6;

    doc.setFont('courier');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    const textLines = doc.splitTextToSize(prompt.prompt_text || '', pageWidth - 40);
    const boxHeight = textLines.length * 5 + 10;
    doc.setFillColor(248, 250, 252);
    doc.setLineWidth(0.5);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(20, y, pageWidth - 40, boxHeight, 3, 3, 'FD');
    doc.text(textLines, 24, y + 7);

    doc.save(`${prompt.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_prompt.pdf`);
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(prompt, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prompt.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_prompt.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestOutput(null);
    try {
      const res = await fetch('/api/test-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: prompt.prompt_text,
          inputValues: variables,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestOutput(data.output);
        onAction?.();
      } else {
        setTestOutput(`Error: ${data.error}`);
      }
    } catch (err: unknown) {
      setTestOutput(`Error: ${err instanceof Error ? err.message : 'Failed to connect to AI server'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const variableKeys = Object.keys(variables);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-100 flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 line-clamp-1">{prompt.name}</h2>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span className="font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                  {prompt.associated_task}
                </span>
                <span>•</span>
                <span>ID: {prompt.prompt_id}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAIOptimize(prompt)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Optimize with AI</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-stone-200 flex items-center gap-6 bg-stone-50/50">
          <button
            onClick={() => setActiveTab('view')}
            className={`py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'view'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Prompt Details & Content
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'test'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Live AI Playground
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'json'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            JSON Schema View
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'view' && (
            <div className="space-y-6">
              {/* Description & Meta */}
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Description</h4>
                  <p className="text-stone-800 text-sm leading-relaxed">{prompt.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-stone-200/60 text-xs">
                  <div className="flex items-center gap-2 text-stone-600">
                    <Calendar className="w-4 h-4 text-stone-400" />
                    <span>Created: <strong className="text-stone-800">{new Date(prompt.date_created).toLocaleString()}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-600">
                    <Clock className="w-4 h-4 text-stone-400" />
                    <span>Last Used: <strong className="text-stone-800">{prompt.last_used ? new Date(prompt.last_used).toLocaleString() : 'Never'}</strong></span>
                  </div>
                </div>

                {prompt.tags && prompt.tags.length > 0 && (
                  <div className="pt-2 flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-stone-500">Tags:</span>
                    {prompt.tags.map((tag, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs bg-white text-stone-700 border border-stone-200 shadow-2xs">
                        <Tag className="w-3 h-3 text-stone-400" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Prompt Text Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                    Prompt Text
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyAndClose}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-colors shadow-xs"
                      title="Copy prompt text and close modal"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy & Close</span>
                    </button>
                    <button
                      onClick={handleCopyText}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium transition-colors shadow-xs"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy Prompt'}</span>
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-stone-900 text-stone-100 rounded-2xl font-mono text-sm leading-relaxed whitespace-pre-wrap overflow-x-auto border border-stone-800 shadow-inner">
                  {prompt.prompt_text}
                </div>
              </div>

              {/* Example Input / Output if present */}
              {(prompt.example_input || prompt.example_output) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {prompt.example_input && (
                    <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
                      <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Example Input</h4>
                      <pre className="text-xs font-mono text-stone-800 whitespace-pre-wrap bg-white p-3 rounded-xl border border-stone-200">
                        {prompt.example_input}
                      </pre>
                    </div>
                  )}
                  {prompt.example_output && (
                    <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
                      <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Example Output</h4>
                      <pre className="text-xs font-mono text-stone-800 whitespace-pre-wrap bg-white p-3 rounded-xl border border-stone-200">
                        {prompt.example_output}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'test' && (
            <div className="space-y-6">
              <div className="bg-indigo-50/60 rounded-2xl p-4 border border-indigo-100 text-sm text-indigo-900">
                <p className="font-semibold mb-1">Live AI Test Playground</p>
                <p className="text-xs text-indigo-700">
                  Fill in the variable placeholders detected in your prompt and test it live against Gemini AI.
                </p>
              </div>

              {variableKeys.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Detected Variables</h4>
                  {variableKeys.map((vKey) => (
                    <div key={vKey}>
                      <label className="block text-xs font-medium text-stone-700 mb-1 font-mono">
                        {`{{${vKey}}}`}
                      </label>
                      <input
                        type="text"
                        value={variables[vKey] || ''}
                        onChange={(e) => setVariables({ ...variables, [vKey]: e.target.value })}
                        placeholder={`Enter value for ${vKey}...`}
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-stone-900"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-stone-500 italic">No variables (like {'{{topic}}'}) detected in this prompt. You can test it directly.</p>
              )}

              <button
                onClick={handleRunTest}
                disabled={isTesting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Running with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Run Prompt Test</span>
                  </>
                )}
              </button>

              {testOutput !== null && (
                <div className="space-y-2 mt-4 animate-in fade-in duration-200">
                  <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center justify-between">
                    <span>AI Test Output Response</span>
                    <span className="text-xs font-normal text-emerald-600">Generated successfully</span>
                  </h4>
                  <div className="p-4 bg-stone-900 text-stone-100 rounded-2xl font-mono text-sm leading-relaxed whitespace-pre-wrap overflow-x-auto border border-stone-800 shadow-inner max-h-96">
                    {testOutput}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                  Requested JSON Output Schema Structure
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyJson}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium transition-colors"
                  >
                    {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedJson ? 'Copied JSON' : 'Copy JSON'}</span>
                  </button>
                  <button
                    onClick={handleDownloadJson}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON</span>
                  </button>
                </div>
              </div>

              <pre className="p-5 bg-stone-900 text-emerald-400 rounded-2xl font-mono text-xs leading-relaxed overflow-x-auto border border-stone-800 shadow-inner">
                {JSON.stringify(prompt, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 px-6 py-4 bg-stone-50/50 flex items-center justify-between">
          <div className="text-xs text-stone-500">
            Prompt ID: <span className="font-mono">{prompt.prompt_id}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-medium transition-colors shadow-xs flex items-center gap-1.5"
              title="Export as formatted PDF"
            >
              <FileText className="w-4 h-4 text-rose-400" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={handleCopyAndClose}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Copy className="w-4 h-4" />
              <span>Copy & Close</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
