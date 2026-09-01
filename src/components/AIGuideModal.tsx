import React from 'react';
import { X, BookOpen, Code, Search, Database, Terminal, CheckCircle2, FileText, Sparkles } from 'lucide-react';

interface AIGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIGuideModal: React.FC<AIGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">AI Prompt Database & Organization Guide</h2>
              <p className="text-xs text-slate-500">Comprehensive instructions and master prompt templates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8 text-slate-700 text-sm leading-relaxed overflow-y-auto">
          {/* Section 1: AI Assistant Instructions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Database className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">1. Instructions for AI Assistant: Building a Searchable Prompt Database</h3>
            </div>
            <p className="text-slate-600">
              Follow these architectural and functional guidelines when building or extending a searchable prompt management system:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ingestion & Storage
                </h4>
                <ul className="text-xs space-y-1.5 text-slate-600 list-disc list-inside">
                  <li>Accept raw prompt strings and associated metadata.</li>
                  <li>Store mandatory fields: <code className="bg-slate-200 px-1 rounded">prompt_text</code>, <code className="bg-slate-200 px-1 rounded">name</code>, <code className="bg-slate-200 px-1 rounded">description</code>, <code className="bg-slate-200 px-1 rounded">tags</code>, and <code className="bg-slate-200 px-1 rounded">associated_task</code>.</li>
                  <li>Automatically stamp <code className="bg-slate-200 px-1 rounded">date_created</code> and <code className="bg-slate-200 px-1 rounded">last_used</code> timestamps on ingestion and execution.</li>
                </ul>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Search className="w-4 h-4 text-indigo-600" /> Search & Filtering Engine
                </h4>
                <ul className="text-xs space-y-1.5 text-slate-600 list-disc list-inside">
                  <li><strong>Keyword Search:</strong> Case-insensitive substring matching across prompt name, description, and full prompt text.</li>
                  <li><strong>Tag Filtering:</strong> Exact array inclusion matching for tags (e.g., <code className="bg-slate-200 px-1 rounded">#Python</code>).</li>
                  <li><strong>Task Categorization:</strong> Group and filter by task domain (Coding, Writing, Analysis, etc.).</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: Timestamp Tracking */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Terminal className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">2. Automatic <code className="text-indigo-600">last_used</code> Timestamp Lifecycle</h3>
            </div>
            <p className="text-slate-600">
              To keep track of frequently used prompts, the system automatically updates the <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs">last_used</code> ISO timestamp field whenever a prompt is:
            </p>
            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs leading-relaxed border border-slate-800">
              {`// Automatically executed on prompt retrieval, copy, or AI test execution
const updateLastUsed = (promptId: string) => {
  const now = new Date().toISOString();
  setPrompts(prev => prev.map(p => p.prompt_id === promptId ? { ...p, last_used: now } : p));
};`}
            </div>
          </div>

          {/* Section 3: Master Prompt Organiser Prompt */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">3. Master Prompt Template for User Prompt Organization</h3>
            </div>
            <p className="text-slate-600">
              Copy and use this prompt with any LLM to ingest and structure unstructured prompt notes into pristine JSON format:
            </p>
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap shadow-inner">
{`You are an expert Prompt Engineer and Library Organizer. Your task is to analyze the raw prompt notes provided below and structure them into a valid JSON object.

Extract and format the response with the exact JSON keys:
{
  "prompt_text": "The complete, polished prompt body with any variables like {{variable}} preserved",
  "name": "A concise, professional title for the prompt",
  "description": "A 1-2 sentence description explaining what the prompt achieves",
  "tags": ["relevant", "tags", "array"],
  "associated_task": "Primary task category (e.g., Writing, Coding, Brainstorming, Analysis, Marketing, Education, Productivity, Other)"
}

Raw Prompt Notes to Organize:
[INSERT YOUR UNSTRUCTURED PROMPT NOTES HERE]`}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <span className="text-xs text-slate-500">PromptVault Professional Edition • Schema V1</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
