import React, { useState } from 'react';
import { PromptItem } from '../types';
import { X, Sparkles, Wand2, Check, RefreshCw } from 'lucide-react';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPrompt: (prompt: Omit<PromptItem, 'prompt_id' | 'date_created' | 'last_used'>) => void;
  optimizingPrompt?: PromptItem | null;
}

const TASK_OPTIONS: string[] = [
  'Writing',
  'Coding',
  'Brainstorming',
  'Summarization',
  'Analysis',
  'Marketing',
  'Education',
  'Productivity',
  'Other'
];

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({
  isOpen,
  onClose,
  onAddPrompt,
  optimizingPrompt,
}) => {
  const [instructions, setInstructions] = useState('');
  const [taskType, setTaskType] = useState('Writing');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructions.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const action = optimizingPrompt ? 'optimize' : 'generate';
      const res = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          currentPrompt: optimizingPrompt || undefined,
          instructions: instructions.trim(),
          taskType,
        }),
      });

      const data = await res.json();
      if (data.success && data.prompt) {
        onAddPrompt({
          name: data.prompt.name,
          description: data.prompt.description,
          prompt_text: data.prompt.prompt_text,
          associated_task: data.prompt.associated_task || taskType,
          tags: data.prompt.tags || [taskType.toLowerCase()],
          example_input: data.prompt.example_input,
          example_output: data.prompt.example_output,
        });
        onClose();
      } else {
        setError(data.error || 'Failed to generate prompt');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to AI server');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-100 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="border-b border-stone-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
            </div>
            <h2 className="text-lg font-bold text-stone-900">
              {optimizingPrompt ? 'Optimize Prompt with AI' : 'AI Prompt Generator'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleGenerate} className="p-6 space-y-5">
          {optimizingPrompt && (
            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-xs text-stone-600">
              <p className="font-semibold text-stone-800 mb-1">Optimizing: {optimizingPrompt.name}</p>
              <p className="line-clamp-2">{optimizingPrompt.description}</p>
            </div>
          )}

          {!optimizingPrompt && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Associated Task Category
              </label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              >
                {TASK_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              {optimizingPrompt ? 'How would you like to improve this prompt?' : 'Describe the prompt you want to create *'}
            </label>
            <textarea
              required
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={
                optimizingPrompt 
                  ? "e.g., Make it more rigorous, add error handling guidelines, and format the output as markdown tables."
                  : "e.g., Create a prompt that acts as a financial analyst evaluating tech stock balance sheets with risk metrics."
              }
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-stone-900"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
              {error}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating with Gemini...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>{optimizingPrompt ? 'Optimize Prompt' : 'Generate Prompt'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
