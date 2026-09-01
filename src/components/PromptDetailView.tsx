import React from 'react';
import { PromptItem } from '../types';
import { 
  Play, Sparkles, FileText, History, Edit3, Trash2, Copy, Check, FolderKanban 
} from 'lucide-react';

interface PromptDetailViewProps {
  currentSelectedPrompt: PromptItem | null;
  onTest: (prompt: PromptItem) => void;
  onOptimize: (prompt: PromptItem) => void;
  onExportPDF: (prompt: PromptItem) => void;
  onOpenHistory: () => void;
  onEdit: (prompt: PromptItem) => void;
  onDelete: (promptId: string, e?: React.MouseEvent) => void;
  onDuplicate: (promptId: string) => void;
  getTaskColorClass: (task: string) => string;
  copied: boolean;
  onCopy: (text: string) => void;
}

export const PromptDetailView: React.FC<PromptDetailViewProps> = React.memo(({
  currentSelectedPrompt,
  onTest,
  onOptimize,
  onExportPDF,
  onOpenHistory,
  onEdit,
  onDelete,
  onDuplicate,
  getTaskColorClass,
  copied,
  onCopy,
}) => {
  return (
    <section className="flex-1 bg-white p-8 overflow-y-auto">
      {currentSelectedPrompt ? (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
          {/* Title & Actions Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${getTaskColorClass(currentSelectedPrompt.associated_task)}`}>
                  {currentSelectedPrompt.associated_task}
                </span>
                {currentSelectedPrompt.subfolder && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 border border-stone-200 flex items-center gap-1">
                    📁 {currentSelectedPrompt.subfolder}
                  </span>
                )}
                {currentSelectedPrompt.tags?.map((tag, idx) => (
                  <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                    #{tag}
                  </span>
                ))}
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{currentSelectedPrompt.name}</h2>
              <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">{currentSelectedPrompt.description}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onTest(currentSelectedPrompt)}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200 transition-colors flex items-center gap-1.5 shadow-2xs"
                title="Test with Gemini AI"
              >
                <Play className="w-3.5 h-3.5 fill-indigo-700" /> Test AI
              </button>

              <button
                onClick={() => onOptimize(currentSelectedPrompt)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
                title="Optimize prompt with Gemini AI"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Optimize
              </button>

              <button
                onClick={() => onExportPDF(currentSelectedPrompt)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
                title="Export as formatted PDF"
              >
                <FileText className="w-3.5 h-3.5 text-rose-400" /> Export PDF
              </button>

              <button
                onClick={onOpenHistory}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-200 shadow-2xs"
                title="View version history and revert changes"
              >
                <History className="w-3.5 h-3.5 text-indigo-600" /> History
                {currentSelectedPrompt.versions && currentSelectedPrompt.versions.length > 1 && (
                  <span className="ml-0.5 px-1.5 py-0.2 bg-indigo-600 text-white rounded-full text-[10px]">
                    {currentSelectedPrompt.versions.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => onDuplicate(currentSelectedPrompt.prompt_id)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 border border-slate-200 transition-colors"
                title="Duplicate prompt"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                onClick={() => onEdit(currentSelectedPrompt)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 border border-slate-200 transition-colors"
                title="Edit prompt"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => onDelete(currentSelectedPrompt.prompt_id, e)}
                className="p-2 hover:bg-rose-50 rounded-lg text-rose-500 border border-slate-200 transition-colors"
                title="Delete prompt"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Metadata Grid Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Task Domain</div>
              <div className="text-sm font-semibold text-slate-800">{currentSelectedPrompt.associated_task}</div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date Created</div>
              <div className="text-sm font-semibold text-slate-800">
                {currentSelectedPrompt.date_created ? new Date(currentSelectedPrompt.date_created).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Last Used</div>
              <div className="text-sm font-semibold text-slate-800">
                {currentSelectedPrompt.last_used ? new Date(currentSelectedPrompt.last_used).toLocaleDateString() : 'Never'}
              </div>
            </div>
          </div>

          {/* Prompt Text Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prompt Text</div>
              <button
                onClick={() => onCopy(currentSelectedPrompt.prompt_text)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Prompt'}</span>
              </button>
            </div>
            <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl font-mono text-sm leading-relaxed border border-slate-800 shadow-inner whitespace-pre-wrap overflow-x-auto">
              {currentSelectedPrompt.prompt_text}
            </div>
          </div>

          {/* Example Input / Output */}
          {(currentSelectedPrompt.example_input || currentSelectedPrompt.example_output) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {currentSelectedPrompt.example_input && (
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Example Input</div>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs font-mono text-slate-700 whitespace-pre-wrap shadow-2xs">
                    {currentSelectedPrompt.example_input}
                  </div>
                </div>
              )}
              {currentSelectedPrompt.example_output && (
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Example Output</div>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs font-mono text-slate-700 whitespace-pre-wrap shadow-2xs">
                    {currentSelectedPrompt.example_output}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-center p-12">
          <div className="space-y-3 max-w-sm">
            <FolderKanban className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No prompt selected</h3>
            <p className="text-sm text-slate-500">Choose a prompt from the left sidebar or create a new one.</p>
          </div>
        </div>
      )}
    </section>
  );
});
