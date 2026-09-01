import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PromptItem, PromptVersion, PromptTemplateItem } from './types';
import { INITIAL_PROMPTS } from './data/initialPrompts';
import { PromptModal } from './components/PromptModal';
import { PromptDetailModal } from './components/PromptDetailModal';
import { AIGeneratorModal } from './components/AIGeneratorModal';
import { ImportExportModal } from './components/ImportExportModal';
import { AIGuideModal } from './components/AIGuideModal';
import { PromptUsageChart } from './components/PromptUsageChart';
import { PromptVersionHistoryModal } from './components/PromptVersionHistoryModal';
import { TagManagementModal } from './components/TagManagementModal';
import { PromptSidebarList } from './components/PromptSidebarList';
import { PromptDetailView } from './components/PromptDetailView';
import { jsPDF } from 'jspdf';
import { 
  Sparkles, Plus, BookOpen, Star, Search, Clock, Code, 
  FileText, Terminal, Copy, Check, Play, Trash2, Edit3, Tag, Download, RefreshCw, FolderKanban, BarChart3, History, Cloud, User, LogOut
} from 'lucide-react';

const TASK_CATEGORIES: string[] = [
  'All Tasks',
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

export default function App() {
  const [prompts, setPrompts] = useState<PromptItem[]>(() => {
    const saved = localStorage.getItem('promptcraft_library_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved prompts', e);
      }
    }
    return INITIAL_PROMPTS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const [selectedTask, setSelectedTask] = useState<string>('All Tasks');
  const [selectedSubFolder, setSelectedSubFolder] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showRecentOnly, setShowRecentOnly] = useState(false);
  
  const [subFolders, setSubFolders] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('promptcraft_subfolders_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved subfolders', e);
      }
    }
    return {
      Coding: ['Frontend', 'Backend', 'API'],
      Writing: ['Blog Posts', 'Emails'],
      Analysis: ['Financial', 'Data Science']
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('promptcraft_subfolders_v1', JSON.stringify(subFolders));
    } catch (e) {
      console.error('Failed to save subfolders to localStorage (quota exceeded or restricted):', e);
    }
  }, [subFolders]);

  const [templates, setTemplates] = useState<PromptTemplateItem[]>(() => {
    const saved = localStorage.getItem('promptcraft_templates_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved templates', e);
      }
    }
    return [
      {
        id: 't-1',
        name: 'Expert Role & Task Structure',
        description: 'Establishes a professional persona and clear task instructions with placeholders',
        template_text: 'You are an expert {{role}}. Your task is to help me with {{topic}}. Please provide rigorous detail, best practices, and clear explanations.'
      },
      {
        id: 't-2',
        name: 'Step-by-Step Analytical Breakdown',
        description: 'Instructs the model to dissect a complex subject methodically',
        template_text: 'Act as a {{role}}. Analyze the following {{subject}} by breaking it down into structured, step-by-step actionable insights:\n\n{{input}}'
      },
      {
        id: 't-3',
        name: 'Senior Code Review & Security Audit',
        description: 'Comprehensive software engineering code analysis',
        template_text: 'Review the following code snippet for bugs, security vulnerabilities, and performance bottlenecks as a senior {{language}} engineer:\n\n{{code}}'
      },
      {
        id: 't-4',
        name: 'Executive Summary & Key Takeaways',
        description: 'Condenses dense text into clear, bulleted takeaways',
        template_text: 'Summarize the following text into 3 key bullet points, critical insights, and a concise conclusion:\n\n{{text}}'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('promptcraft_templates_v1', JSON.stringify(templates));
    } catch (e) {
      console.error('Failed to save templates to localStorage:', e);
    }
  }, [templates]);

  const handleSaveTemplate = (newTpl: Omit<PromptTemplateItem, 'id'>) => {
    const item: PromptTemplateItem = {
      ...newTpl,
      id: `tpl-${Date.now()}`
    };
    setTemplates(prev => [item, ...prev]);
  };

  const handleAddSubFolder = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const subName = prompt(`Enter new sub-folder name under "${category}":`);
    if (!subName || !subName.trim()) return;
    const trimmed = subName.trim();
    setSubFolders(prev => {
      const existing = prev[category] || [];
      if (existing.map(s => s.toLowerCase()).includes(trimmed.toLowerCase())) return prev;
      return {
        ...prev,
        [category]: [...existing, trimmed],
      };
    });
  };
  
  // Selected prompt for detail view in the split pane
  const [selectedPromptId, setSelectedPromptId] = useState<string>(prompts[0]?.prompt_id || '');
  const [selectedPromptIds, setSelectedPromptIds] = useState<string[]>([]);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // full modal for test playground
  const [modalPrompt, setModalPrompt] = useState<PromptItem | null>(null);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [optimizingPrompt, setOptimizingPrompt] = useState<PromptItem | null>(null);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isAIGuideOpen, setIsAIGuideOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isTagManagementOpen, setIsTagManagementOpen] = useState(false);

  const handleRenameTag = (oldTag: string, newTag: string) => {
    setPrompts((prev) =>
      prev.map((p) => {
        if (!p.tags || !p.tags.includes(oldTag)) return p;
        const updatedTags = p.tags.map((t) => (t === oldTag ? newTag : t));
        return { ...p, tags: Array.from(new Set(updatedTags)) };
      })
    );
    if (selectedTag === oldTag) {
      setSelectedTag(newTag);
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setPrompts((prev) =>
      prev.map((p) => {
        if (!p.tags || !p.tags.includes(tagToDelete)) return p;
        return { ...p, tags: p.tags.filter((t) => t !== tagToDelete) };
      })
    );
    if (selectedTag === tagToDelete) {
      setSelectedTag(null);
    }
  };

  // Cloud Sync & Auth State
  const [currentUser, setCurrentUser] = useState<{ uid: string; email: string; name: string } | null>(() => {
    const savedUser = localStorage.getItem('promptcraft_auth_user');
    return savedUser ? JSON.parse(savedUser) : { uid: 'user-demo-123', email: 'gamerchoiose@gmail.com', name: 'Gamer Choi' };
  });
  const [lastSynced, setLastSynced] = useState<string>(() => {
    return localStorage.getItem('promptcraft_last_synced') || new Date().toISOString();
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('promptcraft_auth_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('promptcraft_auth_user');
      }
    } catch (e) {
      console.error('Failed to save auth user to localStorage:', e);
    }
  }, [currentUser]);

  const handleManualSync = async () => {
    if (!currentUser) {
      alert('Please sign in to sync your prompt library to the cloud.');
      return;
    }
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const now = new Date().toISOString();
      localStorage.setItem('promptcraft_library_v1', JSON.stringify(prompts));
      localStorage.setItem('promptcraft_last_synced', now);
      setLastSynced(now);
      setSyncMessage('Successfully synced to cloud storage');
      setTimeout(() => setSyncMessage(null), 3000);
    } catch (err) {
      console.error('Sync failed', err);
      setSyncMessage('Sync failed. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const formatLastSynced = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Never';
    }
  };

  // Copy state for main view
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('promptcraft_library_v1', JSON.stringify(prompts));
    } catch (e) {
      console.error('Failed to save prompts library to localStorage (quota exceeded):', e);
      alert('Storage quota exceeded! Please use the JSON Export/Import feature to back up your prompt collection.');
    }
  }, [prompts]);

  // Ensure selectedPromptId is valid
  useEffect(() => {
    if (prompts.length > 0 && (!selectedPromptId || !prompts.some(p => p.prompt_id === selectedPromptId))) {
      setSelectedPromptId(prompts[0].prompt_id);
    }
  }, [prompts, selectedPromptId]);

  const allTags = useMemo(() => {
    return Array.from(
      new Set(prompts.flatMap((p) => p.tags || []))
    ).sort();
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    let taskFilter: string | null = null;
    let tagFilter: string | null = null;
    let favFilter: boolean | null = null;
    let freeTextQuery = debouncedSearchQuery.trim();

    const taskMatch = freeTextQuery.match(/\btask:([^\s]+)/i);
    if (taskMatch) {
      taskFilter = taskMatch[1].replace(/['"]/g, '');
      freeTextQuery = freeTextQuery.replace(taskMatch[0], '').trim();
    }

    const tagMatch = freeTextQuery.match(/\btag:([^\s]+)/i);
    if (tagMatch) {
      tagFilter = tagMatch[1].replace(/['"]/g, '');
      freeTextQuery = freeTextQuery.replace(tagMatch[0], '').trim();
    }

    const favMatch = freeTextQuery.match(/\b(fav|is:favorite):(true|yes|1)/i);
    if (favMatch) {
      favFilter = true;
      freeTextQuery = freeTextQuery.replace(favMatch[0], '').trim();
    }

    return prompts.filter((p) => {
      const matchesFreeText =
        freeTextQuery === '' ||
        p.name.toLowerCase().includes(freeTextQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(freeTextQuery.toLowerCase()) ||
        p.prompt_text.toLowerCase().includes(freeTextQuery.toLowerCase()) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(freeTextQuery.toLowerCase())));

      const matchesTaskOp =
        !taskFilter || p.associated_task.toLowerCase().includes(taskFilter.toLowerCase());

      const matchesTagOp =
        !tagFilter || (p.tags && p.tags.some(t => t.toLowerCase().includes(tagFilter.toLowerCase())));

      const matchesFavOp =
        favFilter === null || p.is_favorite === favFilter;

      const matchesTask =
        selectedTask === 'All Tasks' ||
        p.associated_task.toLowerCase() === selectedTask.toLowerCase();

      const matchesSubFolder =
        !selectedSubFolder ||
        (p.associated_task.toLowerCase() === selectedTask.toLowerCase() &&
         p.subfolder?.toLowerCase() === selectedSubFolder.toLowerCase());

      const matchesTag =
        selectedTag === null || (p.tags && p.tags.includes(selectedTag));

      const matchesFavorite = !showFavoritesOnly || p.is_favorite;

      const matchesRecent = !showRecentOnly || true; // Can sort or filter by recent if needed

      return matchesFreeText && matchesTaskOp && matchesTagOp && matchesFavOp && matchesTask && matchesSubFolder && matchesTag && matchesFavorite && matchesRecent;
    });
  }, [prompts, debouncedSearchQuery, selectedTask, selectedSubFolder, selectedTag, showFavoritesOnly, showRecentOnly]);

  const currentSelectedPrompt = useMemo(() => {
    return prompts.find(p => p.prompt_id === selectedPromptId) || filteredPrompts[0] || prompts[0];
  }, [prompts, selectedPromptId, filteredPrompts]);

  // When a prompt is retrieved or selected, automatically update its last_used timestamp
  const handleSelectPrompt = (promptId: string) => {
    setSelectedPromptId(promptId);
    const now = new Date().toISOString();
    setPrompts((prev) =>
      prev.map((p) =>
        p.prompt_id === promptId ? { ...p, last_used: now } : p
      )
    );
  };

  const handleReorderPrompts = (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;
    setPrompts((prev) => {
      const draggedIndex = prev.findIndex(p => p.prompt_id === draggedId);
      const targetIndex = prev.findIndex(p => p.prompt_id === targetId);
      if (draggedIndex < 0 || targetIndex < 0) return prev;
      const newPrompts = [...prev];
      const [removed] = newPrompts.splice(draggedIndex, 1);
      newPrompts.splice(targetIndex, 0, removed);
      return newPrompts;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedPromptIds.length === filteredPrompts.length) {
      setSelectedPromptIds([]);
    } else {
      setSelectedPromptIds(filteredPrompts.map(p => p.prompt_id));
    }
  };

  const handleCheckboxChange = (promptId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPromptIds(prev =>
      prev.includes(promptId) ? prev.filter(id => id !== promptId) : [...prev, promptId]
    );
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedPromptIds.length} selected prompt(s)?`)) {
      setPrompts(prev => prev.filter(p => !selectedPromptIds.includes(p.prompt_id)));
      setSelectedPromptIds([]);
    }
  };

  const handleBulkMove = (targetCategory: string) => {
    if (!targetCategory) return;
    setPrompts(prev =>
      prev.map(p => selectedPromptIds.includes(p.prompt_id) ? { ...p, associated_task: targetCategory } : p)
    );
    setSelectedPromptIds([]);
  };

  const handleBulkMoveSubfolder = (targetSubfolder: string) => {
    if (!targetSubfolder) return;
    setPrompts(prev =>
      prev.map(p => selectedPromptIds.includes(p.prompt_id) ? { ...p, subfolder: targetSubfolder === '__none__' ? undefined : targetSubfolder } : p)
    );
    setSelectedPromptIds([]);
  };

  const handleDuplicatePrompt = (promptId: string) => {
    const target = prompts.find(p => p.prompt_id === promptId);
    if (!target) return;
    const now = new Date().toISOString();
    const duplicated: PromptItem = {
      ...target,
      prompt_id: `prompt-${Date.now()}`,
      name: `${target.name} - Copy`,
      date_created: now,
      last_used: now,
      versions: [
        {
          version_id: `v-${Date.now()}`,
          version_number: 1,
          prompt_text: target.prompt_text,
          timestamp: now,
          change_summary: 'Initial duplicate copy',
        }
      ]
    };
    setPrompts(prev => [duplicated, ...prev]);
    setSelectedPromptId(duplicated.prompt_id);
  };

  const handleSavePrompt = (promptData: Omit<PromptItem, 'prompt_id' | 'date_created' | 'last_used'> & { prompt_id?: string }) => {
    const now = new Date().toISOString();
    if (promptData.prompt_id) {
      setPrompts((prev) =>
        prev.map((p) => {
          if (p.prompt_id === promptData.prompt_id) {
            const versions = p.versions || [];
            const textChanged = p.prompt_text !== promptData.prompt_text;
            let updatedVersions = versions;
            if (textChanged || versions.length === 0) {
              const newVer = {
                version_id: `v-${promptData.prompt_id}-${Date.now()}`,
                version_number: (versions[versions.length - 1]?.version_number || 0) + 1,
                prompt_text: promptData.prompt_text,
                timestamp: now,
                change_summary: textChanged ? 'Updated prompt text' : 'Updated prompt metadata',
              };
              updatedVersions = [...versions, newVer];
            }
            return {
              ...p,
              ...promptData,
              versions: updatedVersions,
              last_used: now,
            };
          }
          return p;
        })
      );
    } else {
      const newItemId = `prompt-${Date.now()}`;
      const newItem: PromptItem = {
        prompt_id: newItemId,
        name: promptData.name,
        description: promptData.description,
        prompt_text: promptData.prompt_text,
        associated_task: promptData.associated_task,
        tags: promptData.tags,
        date_created: now,
        last_used: now,
        example_input: promptData.example_input,
        example_output: promptData.example_output,
        is_favorite: false,
        versions: [
          {
            version_id: `v-${newItemId}-1`,
            version_number: 1,
            prompt_text: promptData.prompt_text,
            timestamp: now,
            change_summary: 'Initial version',
          }
        ],
      };
      setPrompts((prev) => [newItem, ...prev]);
      setSelectedPromptId(newItem.prompt_id);
    }
  };

  const handleRevertVersion = (promptId: string, version: PromptVersion) => {
    setPrompts((prev) =>
      prev.map((p) => {
        if (p.prompt_id === promptId) {
          const versions = p.versions || [];
          const newVersion = {
            version_id: `v-${promptId}-${Date.now()}`,
            version_number: (versions[versions.length - 1]?.version_number || 0) + 1,
            prompt_text: version.prompt_text,
            timestamp: new Date().toISOString(),
            change_summary: `Reverted to Version ${version.version_number}`,
          };
          return {
            ...p,
            prompt_text: version.prompt_text,
            versions: [...versions, newVersion],
            last_used: new Date().toISOString(),
          };
        }
        return p;
      })
    );
  };

  const handleDeletePrompt = (promptId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Are you sure you want to delete this prompt?')) {
      setPrompts((prev) => prev.filter((p) => p.prompt_id !== promptId));
    }
  };

  const handleToggleFavorite = (promptId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPrompts((prev) =>
      prev.map((p) =>
        p.prompt_id === promptId ? { ...p, is_favorite: !p.is_favorite } : p
      )
    );
  };

  const handleCopyPromptText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = (prompt: PromptItem) => {
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

  const getTaskColorClass = (task: string) => {
    const t = task.toLowerCase();
    if (t.includes('cod')) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (t.includes('writ')) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (t.includes('brain')) return 'text-amber-600 bg-amber-50 border-amber-200';
    if (t.includes('analy')) return 'text-purple-600 bg-purple-50 border-purple-200';
    return 'text-indigo-600 bg-indigo-50 border-indigo-200';
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Dark Sidebar */}
      <nav className="w-64 bg-slate-900 text-white flex flex-col shrink-0 border-r border-slate-800">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-md">
            P
          </div>
          <div>
            <span className="font-semibold text-base tracking-tight block">PromptVault</span>
            <span className="text-[10px] text-slate-400">Professional Edition</span>
          </div>
        </div>

        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">Library</div>
          
          <button
            onClick={() => {
              setSelectedTask('All Tasks');
              setSelectedSubFolder(null);
              setSelectedTag(null);
              setShowFavoritesOnly(false);
              setShowRecentOnly(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedTask === 'All Tasks' && !showFavoritesOnly && !showRecentOnly && !selectedTag && !selectedSubFolder
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <span className="opacity-70">📁</span> All Prompts ({prompts.length})
          </button>

          <button
            onClick={() => {
              setShowFavoritesOnly(!showFavoritesOnly);
              setShowRecentOnly(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showFavoritesOnly ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <span className="opacity-70">⭐</span> Favorites ({prompts.filter(p => p.is_favorite).length})
          </button>

          <button
            onClick={() => {
              setIsAIGeneratorOpen(true);
              setOptimizingPrompt(null);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-800 text-slate-300 rounded-lg text-sm font-medium transition-colors"
          >
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" /> AI Prompt Assistant
          </button>

          <button
            onClick={() => setIsAIGuideOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-800 text-slate-300 rounded-lg text-sm font-medium transition-colors"
          >
            <BookOpen className="w-4 h-4 text-amber-400" /> AI Guide & Instructions
          </button>

          <button
            onClick={() => setIsAnalyticsOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-800 text-slate-300 rounded-lg text-sm font-medium transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" /> Usage Analytics
          </button>

          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2 mt-8">Task Categories</div>
          
          {TASK_CATEGORIES.filter(t => t !== 'All Tasks').map((task) => {
            const count = prompts.filter(p => p.associated_task.toLowerCase() === task.toLowerCase()).length;
            const taskSubfolders = subFolders[task] || [];
            const isCategorySelected = selectedTask === task && !showFavoritesOnly;

            return (
              <div key={task} className="space-y-0.5">
                <div className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                  isCategorySelected && !selectedSubFolder
                    ? 'bg-indigo-600 text-white'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}>
                  <button
                    onClick={() => {
                      setSelectedTask(task);
                      setSelectedSubFolder(null);
                      setShowFavoritesOnly(false);
                      setShowRecentOnly(false);
                    }}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      task === 'Coding' ? 'bg-blue-400' :
                      task === 'Writing' ? 'bg-emerald-400' :
                      task === 'Analysis' ? 'bg-purple-400' :
                      task === 'Brainstorming' ? 'bg-amber-400' : 'bg-indigo-400'
                    }`} />
                    <span>{task}</span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleAddSubFolder(task, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-opacity"
                      title={`Add sub-folder under ${task}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs text-slate-500 font-mono">{count}</span>
                  </div>
                </div>

                {/* Subfolders list */}
                {taskSubfolders.length > 0 && (
                  <div className="pl-6 space-y-0.5 my-1">
                    {taskSubfolders.map((sf) => {
                      const sfCount = prompts.filter(p => p.associated_task.toLowerCase() === task.toLowerCase() && p.subfolder?.toLowerCase() === sf.toLowerCase()).length;
                      const isSubSelected = isCategorySelected && selectedSubFolder?.toLowerCase() === sf.toLowerCase();
                      return (
                        <button
                          key={sf}
                          onClick={() => {
                            setSelectedTask(task);
                            setSelectedSubFolder(sf);
                            setShowFavoritesOnly(false);
                            setShowRecentOnly(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            isSubSelected
                              ? 'bg-indigo-700 text-white'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-slate-500">└</span>
                            <span>{sf}</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{sfCount}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2 mt-8 flex items-center justify-between">
            <span>Filter by Tag</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTagManagementOpen(true)}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-normal flex items-center gap-1"
                title="Manage tags"
              >
                ⚙️ Manage
              </button>
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-normal lowercase"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="px-2 flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
            {allTags.map((tag) => {
              const count = prompts.filter(p => p.tags && p.tags.includes(tag)).length;
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isSelected ? null : tag)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50'
                  }`}
                >
                  <span>#{tag}</span>
                  <span className="text-[10px] opacity-60 font-mono">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => setIsImportExportOpen(true)}
            className="w-full py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5" /> JSON Import / Export
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="relative w-96">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts (e.g. task:coding tag:frontend)..."
              className="w-full pl-10 pr-12 py-2 bg-slate-100 border-transparent rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all"
            />
            <span className="absolute left-3.5 top-2.5 opacity-40">🔍</span>
            <kbd className="absolute right-3 top-2 px-1.5 py-0.5 text-[10px] font-mono text-stone-400 bg-stone-200/60 rounded border border-stone-300/60 hidden sm:inline-block">⌘K</kbd>
          </div>

          <div className="flex items-center gap-3">
            {/* Cloud Sync & Auth Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <Cloud className={`w-3.5 h-3.5 ${currentUser ? 'text-indigo-600' : 'text-slate-400'}`} />
              <div className="hidden sm:flex flex-col">
                <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                  {currentUser ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                      <span>Synced ({currentUser.email})</span>
                    </>
                  ) : (
                    <span>Not Signed In</span>
                  )}
                </span>
                <span className="text-[9px] text-slate-400">Last Synced: {formatLastSynced(lastSynced)}</span>
              </div>
              
              <button
                onClick={handleManualSync}
                disabled={isSyncing || !currentUser}
                className={`ml-1 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                  !currentUser
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs'
                }`}
                title={currentUser ? "Sync library to cloud storage" : "Sign in to enable cloud sync"}
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
              </button>

              {currentUser ? (
                <button
                  onClick={() => setCurrentUser(null)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors ml-1"
                  title="Sign out"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              ) : (
                <button
                  onClick={() => setCurrentUser({ uid: 'user-demo-123', email: 'gamerchoiose@gmail.com', name: 'Gamer Choi' })}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold ml-1 transition-colors"
                  title="Sign in"
                >
                  Sign In
                </button>
              )}
            </div>

            {syncMessage && (
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 animate-in fade-in">
                {syncMessage}
              </span>
            )}

            <button
              onClick={() => {
                setEditingPrompt(null);
                setIsCreateOpen(true);
              }}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> + New Prompt
            </button>
          </div>
        </header>

        {/* Split Pane: Left List Sidebar + Right Content Area */}
        <div className="flex-1 flex overflow-hidden">
          <PromptSidebarList
            filteredPrompts={filteredPrompts}
            selectedPromptId={selectedPromptId}
            selectedPromptIds={selectedPromptIds}
            onSelectPrompt={handleSelectPrompt}
            onToggleSelectAll={handleToggleSelectAll}
            onCheckboxChange={handleCheckboxChange}
            onToggleFavorite={handleToggleFavorite}
            onDuplicate={handleDuplicatePrompt}
            selectedTask={selectedTask}
            getTaskColorClass={getTaskColorClass}
            handleBulkDelete={handleBulkDelete}
            handleBulkMove={handleBulkMove}
            handleBulkMoveSubfolder={handleBulkMoveSubfolder}
            TASK_CATEGORIES={TASK_CATEGORIES}
            subFolders={subFolders}
            onDeselectAll={() => setSelectedPromptIds([])}
            onReorderPrompts={handleReorderPrompts}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onResetFilters={() => {
              setSelectedTask('All Tasks');
              setSelectedSubFolder(null);
              setSelectedTag(null);
              setShowFavoritesOnly(false);
            }}
          />

          <PromptDetailView
            currentSelectedPrompt={currentSelectedPrompt}
            onTest={(p) => {
              setModalPrompt(p);
              setIsDetailModalOpen(true);
            }}
            onOptimize={(p) => {
              setOptimizingPrompt(p);
              setIsAIGeneratorOpen(true);
            }}
            onExportPDF={handleExportPDF}
            onOpenHistory={() => setIsVersionHistoryOpen(true)}
            onEdit={(p) => {
              setEditingPrompt(p);
              setIsCreateOpen(true);
            }}
            onDelete={handleDeletePrompt}
            onDuplicate={handleDuplicatePrompt}
            getTaskColorClass={getTaskColorClass}
            copied={copied}
            onCopy={handleCopyPromptText}
          />
        </div>
      </main>

      {/* Modals */}
      <PromptModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleSavePrompt}
        editingPrompt={editingPrompt}
        existingTags={allTags}
        subfoldersMap={subFolders}
        templates={templates}
        onSaveTemplate={handleSaveTemplate}
      />

      <PromptDetailModal
        prompt={modalPrompt || currentSelectedPrompt}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onOpenAIOptimize={(p) => {
          setIsDetailModalOpen(false);
          setOptimizingPrompt(p);
          setIsAIGeneratorOpen(true);
        }}
      />

      <AIGeneratorModal
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        onAddPrompt={handleSavePrompt}
        optimizingPrompt={optimizingPrompt}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        prompts={prompts}
        onImportPrompts={(imported) => {
          setPrompts((prev) => {
            const existingIds = new Set(prev.map(p => p.prompt_id));
            const newItems = imported.filter(p => !existingIds.has(p.prompt_id));
            return [...newItems, ...prev];
          });
        }}
      />

      <AIGuideModal
        isOpen={isAIGuideOpen}
        onClose={() => setIsAIGuideOpen(false)}
      />

      <PromptUsageChart
        prompts={prompts}
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      <PromptVersionHistoryModal
        prompt={currentSelectedPrompt}
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
        onRevert={handleRevertVersion}
      />

      <TagManagementModal
        isOpen={isTagManagementOpen}
        onClose={() => setIsTagManagementOpen(false)}
        allTags={allTags}
        prompts={prompts}
        onRenameTag={handleRenameTag}
        onDeleteTag={handleDeleteTag}
      />
    </div>
  );
}

