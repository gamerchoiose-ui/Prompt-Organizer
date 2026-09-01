import React, { useState, useEffect } from 'react';
import { PromptItem, TaskCategory, PromptTemplateItem } from '../types';
import { X, Sparkles, Check, FileText, Tag as TagIcon, Bookmark, Plus } from 'lucide-react';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promptData: Omit<PromptItem, 'prompt_id' | 'date_created' | 'last_used'> & { prompt_id?: string }) => void;
  editingPrompt?: PromptItem | null;
  existingTags?: string[];
  subfoldersMap?: Record<string, string[]>;
  templates?: PromptTemplateItem[];
  onSaveTemplate?: (template: Omit<PromptTemplateItem, 'id'>) => void;
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

export const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPrompt,
  existingTags = [],
  subfoldersMap = {},
  templates = [],
  onSaveTemplate,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [promptText, setPromptText] = useState('');
  const [associatedTask, setAssociatedTask] = useState('Writing');
  const [subfolder, setSubfolder] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [exampleInput, setExampleInput] = useState('');
  const [exampleOutput, setExampleOutput] = useState('');
  const [isTagFocused, setIsTagFocused] = useState(false);
  const [isTemplatesDropdownOpen, setIsTemplatesDropdownOpen] = useState(false);

  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  const parts = tagsInput.split(',');
  const currentToken = parts[parts.length - 1].trim().toLowerCase();
  const enteredTags = parts.slice(0, -1).map((t) => t.trim().toLowerCase());

  const matchingSuggestions = existingTags
    .filter((tag) => {
      const lower = tag.toLowerCase();
      if (enteredTags.includes(lower)) return false;
      if (!currentToken) return true;
      return lower.includes(currentToken);
    })
    .slice(0, 6);

  const handleSelectSuggestion = (tag: string) => {
    const newParts = [...parts.slice(0, -1), tag, ''];
    setTagsInput(newParts.join(', '));
  };

  useEffect(() => {
    if (!isOpen) return;

    if (editingPrompt) {
      setName(editingPrompt.name);
      setDescription(editingPrompt.description);
      setPromptText(editingPrompt.prompt_text);
      setAssociatedTask(editingPrompt.associated_task || 'Writing');
      setSubfolder(editingPrompt.subfolder || '');
      setTagsInput(editingPrompt.tags ? editingPrompt.tags.join(', ') : '');
      setExampleInput(editingPrompt.example_input || '');
      setExampleOutput(editingPrompt.example_output || '');
      setHasRestoredDraft(false);
    } else {
      const savedDraft = localStorage.getItem('promptcraft_modal_draft_v1');
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          if (draft && (draft.name || draft.promptText || draft.description)) {
            setName(draft.name || '');
            setDescription(draft.description || '');
            setPromptText(draft.promptText || '');
            setAssociatedTask(draft.associatedTask || 'Writing');
            setSubfolder(draft.subfolder || '');
            setTagsInput(draft.tagsInput || '');
            setExampleInput(draft.exampleInput || '');
            setExampleOutput(draft.exampleOutput || '');
            setHasRestoredDraft(true);
          }
        } catch (e) {
          console.error('Failed to load draft', e);
        }
      } else {
        setName('');
        setDescription('');
        setPromptText('');
        setAssociatedTask('Writing');
        setSubfolder('');
        setTagsInput('');
        setExampleInput('');
        setExampleOutput('');
        setHasRestoredDraft(false);
      }
    }
  }, [editingPrompt, isOpen]);

  useEffect(() => {
    if (!isOpen || editingPrompt) return;

    const timer = setInterval(() => {
      if (name || promptText || description || tagsInput) {
        const draftData = {
          name,
          description,
          promptText,
          associatedTask,
          subfolder,
          tagsInput,
          exampleInput,
          exampleOutput,
          timestamp: new Date().toLocaleTimeString(),
        };
        localStorage.setItem('promptcraft_modal_draft_v1', JSON.stringify(draftData));
        setLastSavedTime(new Date().toLocaleTimeString());
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [isOpen, editingPrompt, name, description, promptText, associatedTask, subfolder, tagsInput, exampleInput, exampleOutput]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !promptText.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    localStorage.removeItem('promptcraft_modal_draft_v1');

    onSave({
      prompt_id: editingPrompt ? editingPrompt.prompt_id : undefined,
      name: name.trim(),
      description: description.trim(),
      prompt_text: promptText,
      associated_task: associatedTask,
      subfolder: subfolder.trim() || undefined,
      tags: tags.length > 0 ? tags : [associatedTask.toLowerCase()],
      example_input: exampleInput.trim() || undefined,
      example_output: exampleOutput.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-100 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-stone-900">
              {editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {hasRestoredDraft && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between">
              <span>Restored unsaved draft from previous session.</span>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('promptcraft_modal_draft_v1');
                  setName('');
                  setDescription('');
                  setPromptText('');
                  setAssociatedTask('Writing');
                  setSubfolder('');
                  setTagsInput('');
                  setExampleInput('');
                  setExampleOutput('');
                  setHasRestoredDraft(false);
                }}
                className="text-amber-900 font-semibold hover:underline"
              >
                Discard Draft
              </button>
            </div>
          )}
          {lastSavedTime && !hasRestoredDraft && (
            <div className="text-[11px] text-stone-400 text-right -mt-2">
              Draft saved at {lastSavedTime}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Prompt Name / Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Senior Code Reviewer & Security Audit"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all font-medium text-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Associated Category *
              </label>
              <select
                value={associatedTask}
                onChange={(e) => {
                  setAssociatedTask(e.target.value);
                  setSubfolder('');
                }}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all font-medium text-stone-900"
              >
                {TASK_OPTIONS.map((task) => (
                  <option key={task} value={task}>
                    {task}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Sub-Folder (Optional)
              </label>
              <input
                type="text"
                value={subfolder}
                onChange={(e) => setSubfolder(e.target.value)}
                placeholder="e.g., Frontend, Blog Posts"
                list="subfolder-suggestions"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all font-medium text-stone-900"
              />
              {subfoldersMap[associatedTask] && subfoldersMap[associatedTask].length > 0 && (
                <datalist id="subfolder-suggestions">
                  {subfoldersMap[associatedTask].map((sf) => (
                    <option key={sf} value={sf} />
                  ))}
                </datalist>
              )}
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Tags (Comma Separated)</span>
              {existingTags.length > 0 && (
                <span className="text-[10px] text-stone-400 font-normal">Auto-complete active</span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onFocus={() => setIsTagFocused(true)}
                onBlur={() => setTimeout(() => setIsTagFocused(false), 200)}
                placeholder="coding, typescript, security"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all font-medium text-stone-900"
              />
            </div>

            {isTagFocused && matchingSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-20 p-2 space-y-1 max-h-40 overflow-y-auto">
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2 py-1">
                  Existing Tags (Click to add)
                </div>
                {matchingSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectSuggestion(suggestion);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-stone-100 rounded-lg text-xs font-medium text-stone-700 flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <TagIcon className="w-3 h-3 text-stone-400" />
                      <span>{suggestion}</span>
                    </span>
                    <span className="text-[10px] text-stone-400">Add</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Description *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief explanation of the prompt's purpose and intended use"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all text-stone-900"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5 relative">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Prompt Text * <span className="text-xs font-normal text-stone-400">(Use {'{{variable}}'} for dynamic inputs)</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsTemplatesDropdownOpen(!isTemplatesDropdownOpen)}
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Insert Template</span>
                  </button>

                  {isTemplatesDropdownOpen && templates.length > 0 && (
                    <div className="absolute right-0 mt-1 w-72 bg-white border border-stone-200 rounded-xl shadow-xl z-30 p-2 space-y-1">
                      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2 py-1">
                        Select Template
                      </div>
                      {templates.map(tpl => (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => {
                            if (promptText.trim() && !window.confirm('Replace current prompt text with template?')) {
                              setPromptText(prev => prev + '\n\n' + tpl.template_text);
                            } else {
                              setPromptText(tpl.template_text);
                            }
                            setIsTemplatesDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-stone-50 rounded-lg transition-colors group"
                        >
                          <div className="text-xs font-semibold text-stone-900 group-hover:text-indigo-600">{tpl.name}</div>
                          <div className="text-[11px] text-stone-500 truncate">{tpl.description}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {onSaveTemplate && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!promptText.trim()) {
                        alert('Please enter prompt text first to save as a template.');
                        return;
                      }
                      const tName = prompt('Enter template name:');
                      if (!tName || !tName.trim()) return;
                      const tDesc = prompt('Enter template description (optional):') || '';
                      onSaveTemplate({
                        name: tName.trim(),
                        description: tDesc.trim(),
                        template_text: promptText,
                      });
                      alert('Template saved successfully!');
                    }}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                    title="Save current prompt as reusable template"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save as Template</span>
                  </button>
                )}
              </div>
            </div>
            <textarea
              required
              rows={6}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="You are an expert... Context: {{context}}"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all text-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Example Input (Optional)
              </label>
              <textarea
                rows={3}
                value={exampleInput}
                onChange={(e) => setExampleInput(e.target.value)}
                placeholder="Sample input data or variables"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Example Output (Optional)
              </label>
              <textarea
                rows={3}
                value={exampleOutput}
                onChange={(e) => setExampleOutput(e.target.value)}
                placeholder="Expected output response"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all text-stone-900"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{editingPrompt ? 'Update Prompt' : 'Save Prompt'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
