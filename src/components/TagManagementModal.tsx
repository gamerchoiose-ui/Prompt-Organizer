import React, { useState } from 'react';
import { Tag, Edit2, Trash2, Check, X } from 'lucide-react';
import { PromptItem } from '../types';

interface TagManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  allTags: string[];
  prompts: PromptItem[];
  onRenameTag: (oldTag: string, newTag: string) => void;
  onDeleteTag: (tagToDelete: string) => void;
}

export const TagManagementModal: React.FC<TagManagementModalProps> = ({
  isOpen,
  onClose,
  allTags,
  prompts,
  onRenameTag,
  onDeleteTag,
}) => {
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [deleteConfirmTag, setDeleteConfirmTag] = useState<string | null>(null);

  if (!isOpen) return null;

  const getTagCount = (tag: string) => {
    return prompts.filter(p => p.tags && p.tags.includes(tag)).length;
  };

  const handleStartRename = (tag: string) => {
    setEditingTag(tag);
    setNewName(tag);
  };

  const handleSaveRename = (oldTag: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (trimmed.toLowerCase() !== oldTag.toLowerCase() && allTags.map(t => t.toLowerCase()).includes(trimmed.toLowerCase())) {
      alert('A tag with this name already exists.');
      return;
    }
    onRenameTag(oldTag, trimmed);
    setEditingTag(null);
    setNewName('');
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Tag Management</h2>
              <p className="text-xs text-stone-500">Rename or delete existing tags across all prompts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-stone-200/60 text-stone-400 hover:text-stone-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          {allTags.length === 0 ? (
            <div className="text-center py-12 text-stone-400 space-y-2">
              <Tag className="w-10 h-10 mx-auto opacity-40" />
              <p className="text-sm font-medium text-stone-600">No tags found in your library</p>
              <p className="text-xs">Add tags to your prompts to organize and filter them easily.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {allTags.map((tag) => {
                const count = getTagCount(tag);
                const isEditing = editingTag === tag;
                const isConfirmingDelete = deleteConfirmTag === tag;

                return (
                  <div
                    key={tag}
                    className="p-3.5 bg-stone-50 hover:bg-stone-100/60 rounded-xl border border-stone-200 flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-mono text-xs shrink-0 font-bold">
                        #
                      </span>
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(tag);
                              if (e.key === 'Escape') setEditingTag(null);
                            }}
                            autoFocus
                            className="w-full px-3 py-1.5 bg-white border border-indigo-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                          />
                          <button
                            onClick={() => handleSaveRename(tag)}
                            className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingTag(null)}
                            className="p-1.5 bg-stone-200 text-stone-600 rounded-lg hover:bg-stone-300 transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between flex-1 min-w-0">
                          <span className="font-semibold text-sm text-stone-800 truncate">{tag}</span>
                          <span className="text-xs bg-stone-200/80 text-stone-600 px-2 py-0.5 rounded-md font-mono shrink-0">
                            {count} {count === 1 ? 'prompt' : 'prompts'}
                          </span>
                        </div>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex items-center gap-1 shrink-0">
                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 p-1 rounded-lg">
                            <span className="text-[10px] font-bold text-rose-700 px-1">Delete?</span>
                            <button
                              onClick={() => {
                                onDeleteTag(tag);
                                setDeleteConfirmTag(null);
                              }}
                              className="px-2 py-1 bg-rose-600 text-white text-xs font-semibold rounded hover:bg-rose-700 transition-colors"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmTag(null)}
                              className="px-2 py-1 bg-stone-200 text-stone-700 text-xs font-semibold rounded hover:bg-stone-300 transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartRename(tag)}
                              className="p-2 text-stone-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                              title="Rename tag"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmTag(tag)}
                              className="p-2 text-stone-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                              title="Delete tag"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <span>Total Unique Tags: <strong className="text-stone-800">{allTags.length}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 text-white font-medium rounded-xl hover:bg-stone-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
