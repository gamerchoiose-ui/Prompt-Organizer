import React, { useState, useEffect, useRef } from 'react';
import { PromptItem } from '../types';
import { FolderKanban, Trash2, Star } from 'lucide-react';
import * as ReactWindow from 'react-window';
const List = (ReactWindow as any).List || (ReactWindow as any).default;

interface PromptSidebarListProps {
  filteredPrompts: PromptItem[];
  selectedPromptId: string;
  selectedPromptIds: string[];
  onSelectPrompt: (promptId: string) => void;
  onToggleSelectAll: () => void;
  onCheckboxChange: (promptId: string, e: React.MouseEvent) => void;
  onToggleFavorite: (promptId: string, e?: React.MouseEvent) => void;
  onDuplicate: (promptId: string) => void;
  selectedTask: string;
  getTaskColorClass: (task: string) => string;
  handleBulkDelete: () => void;
  handleBulkMove: (targetCategory: string) => void;
  handleBulkMoveSubfolder: (targetSubfolder: string) => void;
  TASK_CATEGORIES: string[];
  subFolders: Record<string, string[]>;
  onDeselectAll: () => void;
  onReorderPrompts: (draggedId: string, targetId: string) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onResetFilters?: () => void;
}

interface RowProps {
  filteredPrompts: PromptItem[];
  selectedPromptId: string;
  selectedPromptIds: string[];
  onSelectPrompt: (promptId: string) => void;
  onCheckboxChange: (promptId: string, e: React.MouseEvent) => void;
  onToggleFavorite: (promptId: string, e?: React.MouseEvent) => void;
  onDuplicate: (promptId: string) => void;
  getTaskColorClass: (task: string) => string;
  onReorderPrompts: (draggedId: string, targetId: string) => void;
  searchQuery?: string;
}

const highlightText = (text: string, query?: string) => {
  if (!query || !query.trim()) return text;
  try {
    const parts = text.split(new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === (query || '').toLowerCase() ? (
        <mark key={i} className="bg-amber-200 text-stone-900 rounded px-0.5 font-semibold not-italic">
          {part}
        </mark>
      ) : (
        part
      )
    );
  } catch (e) {
    return text;
  }
};

const RowComponent = ({
  index,
  style,
  filteredPrompts,
  selectedPromptId,
  selectedPromptIds,
  onSelectPrompt,
  onCheckboxChange,
  onToggleFavorite,
  onDuplicate,
  getTaskColorClass,
  onReorderPrompts,
  searchQuery,
}: {
  index: number;
  style: React.CSSProperties;
} & RowProps) => {
  const p = filteredPrompts[index];
  if (!p) return null;
  const isSelected = selectedPromptId === p.prompt_id;
  const isChecked = selectedPromptIds.includes(p.prompt_id);
  const [showContextMenu, setShowContextMenu] = useState(false);

  useEffect(() => {
    if (!showContextMenu) return;
    const handleClickOutside = () => setShowContextMenu(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [showContextMenu]);

  return (
    <div style={style} className="px-3 py-1.5 relative">
      <div
        draggable
        onDragStart={(e) => e.dataTransfer.setData('text/plain', p.prompt_id)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const draggedId = e.dataTransfer.getData('text/plain');
          if (draggedId) {
            onReorderPrompts(draggedId, p.prompt_id);
          }
        }}
        onClick={() => onSelectPrompt(p.prompt_id)}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowContextMenu(true);
        }}
        className={`p-3.5 rounded-xl cursor-grab active:cursor-grabbing transition-all border relative group h-full flex flex-col justify-between ${
          isSelected
            ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
            : 'bg-white hover:bg-slate-50 border-slate-200/80'
        }`}
      >
        <div>
          <div className="flex justify-between items-start mb-1.5">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isChecked}
                onClick={(e) => onCheckboxChange(p.prompt_id, e)}
                onChange={() => {}}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer shrink-0"
              />
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getTaskColorClass(p.associated_task)}`}>
                {p.associated_task}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowContextMenu(!showContextMenu);
                }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200/60 transition-colors"
                title="Sidebar context options"
              >
                ⋮
              </button>
              <button
                onClick={(e) => onToggleFavorite(p.prompt_id, e)}
                className="text-slate-300 hover:text-amber-500 p-0.5"
              >
                <Star className={`w-3.5 h-3.5 ${p.is_favorite ? 'text-amber-500 fill-amber-500' : ''}`} />
              </button>
            </div>
          </div>

          <h3 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {highlightText(p.name, searchQuery)}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {highlightText(p.description, searchQuery)}
          </p>
        </div>

        {p.tags && p.tags.length > 0 && (
          <div className="mt-2 flex items-center gap-1 flex-wrap">
            {p.tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                #{highlightText(tag, searchQuery)}
              </span>
            ))}
          </div>
        )}

        {/* Context Menu Dropdown */}
        {showContextMenu && (
          <div className="absolute right-3 top-10 w-44 bg-white rounded-xl shadow-xl border border-stone-200 z-30 py-1.5 text-xs animate-in fade-in duration-150">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowContextMenu(false);
                onDuplicate(p.prompt_id);
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-stone-50 text-stone-700 font-medium flex items-center gap-2"
            >
              <span>📋</span> Duplicate Prompt
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowContextMenu(false);
                navigator.clipboard.writeText(p.prompt_text);
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-stone-50 text-stone-700 font-medium flex items-center gap-2"
            >
              <span>✂️</span> Copy Prompt Text
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowContextMenu(false);
                onToggleFavorite(p.prompt_id, e);
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-stone-50 text-stone-700 font-medium flex items-center gap-2"
            >
              <span>⭐</span> {p.is_favorite ? 'Remove Favorite' : 'Mark Favorite'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const PromptSidebarList: React.FC<PromptSidebarListProps> = React.memo(({
  filteredPrompts,
  selectedPromptId,
  selectedPromptIds,
  onSelectPrompt,
  onToggleSelectAll,
  onCheckboxChange,
  onToggleFavorite,
  onDuplicate,
  selectedTask,
  getTaskColorClass,
  handleBulkDelete,
  handleBulkMove,
  handleBulkMoveSubfolder,
  TASK_CATEGORIES,
  subFolders,
  onDeselectAll,
  onReorderPrompts,
  searchQuery,
  setSearchQuery,
  onResetFilters,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(400);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setListHeight(entry.contentRect.height);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const selectedPromptsList = filteredPrompts.filter(p => selectedPromptIds.includes(p.prompt_id));
  const primaryCategory = selectedTask !== 'All Tasks' 
    ? selectedTask 
    : (selectedPromptsList.length > 0 ? selectedPromptsList[0].associated_task : 'Coding');
  const availableSubfolders = subFolders[primaryCategory] || [];

  const rowProps = React.useMemo(() => ({
    filteredPrompts,
    selectedPromptId,
    selectedPromptIds,
    onSelectPrompt,
    onCheckboxChange,
    onToggleFavorite,
    onDuplicate,
    getTaskColorClass,
    onReorderPrompts,
    searchQuery,
  }), [
    filteredPrompts,
    selectedPromptId,
    selectedPromptIds,
    onSelectPrompt,
    onCheckboxChange,
    onToggleFavorite,
    onDuplicate,
    getTaskColorClass,
    onReorderPrompts,
    searchQuery,
  ]);

  return (
    <aside className="w-80 border-r border-slate-200 bg-white shrink-0 flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500 font-medium shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filteredPrompts.length > 0 && selectedPromptIds.length === filteredPrompts.length}
            onChange={onToggleSelectAll}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
            title="Select All"
          />
          <span>{filteredPrompts.length} Prompts found</span>
        </div>
        {selectedTask !== 'All Tasks' && (
          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-semibold">
            {selectedTask}
          </span>
        )}
      </div>

      {/* Bulk Action Toolbar if items selected */}
      {selectedPromptIds.length > 0 && (
        <div className="bg-indigo-900 text-white p-3 border-b border-indigo-800 space-y-2 text-xs shadow-md shrink-0">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5">
              <span className="w-5 h-5 bg-indigo-700 rounded-full flex items-center justify-center text-[10px]">
                {selectedPromptIds.length}
              </span>
              Selected
            </span>
            <button
              onClick={onDeselectAll}
              className="text-indigo-300 hover:text-white font-semibold"
            >
              Deselect All
            </button>
          </div>
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkMove(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="bg-indigo-800 border border-indigo-700 text-white rounded px-2 py-1 text-xs focus:outline-hidden flex-1"
            >
              <option value="" disabled>Move to category...</option>
              {TASK_CATEGORIES.filter(t => t !== 'All Tasks').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {availableSubfolders.length > 0 && (
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkMoveSubfolder(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="bg-indigo-800 border border-indigo-700 text-white rounded px-2 py-1 text-xs focus:outline-hidden flex-1"
              >
                <option value="" disabled>Move to sub-folder...</option>
                <option value="__none__">No Sub-folder</option>
                {availableSubfolders.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            )}

            <button
              onClick={handleBulkDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1 shrink-0"
              title="Delete selected prompts"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>
      )}

      <div ref={containerRef} className="flex-1 overflow-hidden w-full">
        {filteredPrompts.length > 0 ? (
          React.createElement(List as any, {
            height: listHeight || 400,
            rowCount: filteredPrompts.length,
            rowHeight: 136,
            width: "100%",
            rowComponent: RowComponent,
            rowProps: rowProps,
            className: "focus:outline-hidden"
          })
        ) : (
          <div className="text-center py-12 px-4 space-y-3">
            <FolderKanban className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-medium text-slate-700">No prompts found</p>
            <p className="text-xs text-slate-400">Try adjusting your filters or search query.</p>
            {(searchQuery || onResetFilters) && (
              <button
                onClick={() => {
                  if (setSearchQuery) setSearchQuery('');
                  if (onResetFilters) onResetFilters();
                }}
                className="mt-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors border border-indigo-200 inline-block"
              >
                Clear Search & Reset Filters
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
});
