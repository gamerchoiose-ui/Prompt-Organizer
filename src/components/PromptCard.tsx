import React, { useState } from 'react';
import { PromptItem } from '../types';
import { Copy, Check, Play, Edit3, Trash2, Star, Tag, Calendar, Clock, Code, Terminal, FileText, Sparkles } from 'lucide-react';

interface PromptCardProps {
  prompt: PromptItem;
  onEdit: (prompt: PromptItem) => void;
  onDelete: (promptId: string) => void;
  onTest: (prompt: PromptItem) => void;
  onViewDetails: (prompt: PromptItem) => void;
  onToggleFavorite: (promptId: string) => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  onEdit,
  onDelete,
  onTest,
  onViewDetails,
  onToggleFavorite,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.prompt_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTaskIcon = (task: string) => {
    const t = task.toLowerCase();
    if (t.includes('cod')) return <Code className="w-3.5 h-3.5 text-blue-600" />;
    if (t.includes('writ')) return <FileText className="w-3.5 h-3.5 text-emerald-600" />;
    if (t.includes('brain')) return <Sparkles className="w-3.5 h-3.5 text-amber-600" />;
    return <Terminal className="w-3.5 h-3.5 text-purple-600" />;
  };

  return (
    <div 
      onClick={() => onViewDetails(prompt)}
      className="group bg-white rounded-2xl border border-stone-200/80 hover:border-stone-300 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden"
    >
      {/* Top row */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
              {getTaskIcon(prompt.associated_task)}
              {prompt.associated_task}
            </span>
            {prompt.tags?.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-stone-50 text-stone-600 border border-stone-100">
                <Tag className="w-3 h-3 text-stone-400" />
                {tag}
              </span>
            ))}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(prompt.prompt_id);
            }}
            className="text-stone-300 hover:text-amber-500 transition-colors p-1"
            title={prompt.is_favorite ? "Remove favorite" : "Mark as favorite"}
          >
            <Star className={`w-4 h-4 ${prompt.is_favorite ? 'text-amber-500 fill-amber-500' : ''}`} />
          </button>
        </div>

        <h3 className="text-base font-semibold text-stone-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1.5">
          {prompt.name}
        </h3>

        <p className="text-stone-600 text-sm line-clamp-2 mb-4 leading-relaxed">
          {prompt.description}
        </p>
      </div>

      {/* Footer / Metadata & Actions */}
      <div>
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400 mb-4">
          <span className="flex items-center gap-1" title={`Created: ${prompt.date_created}`}>
            <Calendar className="w-3.5 h-3.5" />
            {prompt.date_created ? new Date(prompt.date_created).toLocaleDateString() : 'N/A'}
          </span>
          <span className="flex items-center gap-1" title={`Last used: ${prompt.last_used}`}>
            <Clock className="w-3.5 h-3.5" />
            {prompt.last_used ? new Date(prompt.last_used).toLocaleDateString() : 'Never'}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-medium transition-colors border border-stone-200"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-500" />
                <span>Copy Prompt</span>
              </>
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onTest(prompt);
            }}
            className="flex items-center justify-center gap-1 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-medium transition-colors border border-indigo-200"
            title="Test prompt with Gemini AI"
          >
            <Play className="w-3.5 h-3.5 fill-indigo-700" />
            <span>Test</span>
          </button>

          <div className="flex items-center gap-1 border-l border-stone-200 pl-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(prompt);
              }}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
              title="Edit prompt"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(prompt.prompt_id);
              }}
              className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete prompt"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
