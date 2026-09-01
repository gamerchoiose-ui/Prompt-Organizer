import React, { useState } from 'react';
import { PromptItem } from '../types';
import { X, Download, Upload, Check, FileJson, FileText, FileSpreadsheet, AlertCircle, CheckSquare, Square, Search } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompts: PromptItem[];
  onImportPrompts: (imported: PromptItem[]) => void;
}

type ExportFormat = 'json' | 'csv' | 'pdf';

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  prompts,
  onImportPrompts,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [selectedPromptIds, setSelectedPromptIds] = useState<Set<string>>(() => new Set(prompts.map(p => p.prompt_id)));
  const [searchQuery, setSearchQuery] = useState('');

  // Update selectedPromptIds when prompts change or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedPromptIds(new Set(prompts.map(p => p.prompt_id)));
    }
  }, [isOpen, prompts]);

  if (!isOpen) return null;

  const filteredPromptsForExport = prompts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.associated_task.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.tags && p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const isAllSelected = filteredPromptsForExport.length > 0 && filteredPromptsForExport.every(p => selectedPromptIds.has(p.prompt_id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const next = new Set(selectedPromptIds);
      filteredPromptsForExport.forEach(p => next.delete(p.prompt_id));
      setSelectedPromptIds(next);
    } else {
      const next = new Set(selectedPromptIds);
      filteredPromptsForExport.forEach(p => next.add(p.prompt_id));
      setSelectedPromptIds(next);
    }
  };

  const handleTogglePrompt = (id: string) => {
    const next = new Set(selectedPromptIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedPromptIds(next);
  };

  const handleExportBatch = () => {
    const promptsToExport = prompts.filter(p => selectedPromptIds.has(p.prompt_id));
    if (promptsToExport.length === 0) {
      alert('Please select at least one prompt to export.');
      return;
    }

    const dateStr = new Date().toISOString().split('T')[0];

    if (exportFormat === 'json') {
      const dataStr = JSON.stringify(promptsToExport, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `promptcraft_export_${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'csv') {
      const headers = ['ID', 'Name', 'Task Domain', 'Subfolder', 'Tags', 'Prompt Text', 'Example Input', 'Example Output', 'Date Created', 'Is Favorite'];
      const rows = promptsToExport.map(p => [
        p.prompt_id,
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${(p.associated_task || '').replace(/"/g, '""')}"`,
        `"${(p.subfolder || '').replace(/"/g, '""')}"`,
        `"${(p.tags || []).join(', ').replace(/"/g, '""')}"`,
        `"${(p.prompt_text || '').replace(/"/g, '""')}"`,
        `"${(p.example_input || '').replace(/"/g, '""')}"`,
        `"${(p.example_output || '').replace(/"/g, '""')}"`,
        `"${p.date_created || ''}"`,
        p.is_favorite ? 'true' : 'false'
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `promptcraft_export_${dateStr}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'pdf') {
      const doc = new jsPDF();
      let y = 20;

      doc.setFontSize(22);
      doc.setTextColor(30, 41, 59);
      doc.text('PromptCraft - Prompt Library Export', 20, y);
      y += 8;

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated on ${new Date().toLocaleDateString()} — Total Prompts: ${promptsToExport.length}`, 20, y);
      y += 12;

      promptsToExport.forEach((p, idx) => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text(`${idx + 1}. ${p.name}`, 20, y);
        y += 6;

        doc.setFontSize(9);
        doc.setTextColor(79, 70, 229);
        doc.text(`Category: ${p.associated_task}${p.subfolder ? ` / ${p.subfolder}` : ''} | Tags: ${(p.tags || []).join(', ')}`, 20, y);
        y += 6;

        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        const splitText = doc.splitTextToSize(p.prompt_text, 170);
        doc.text(splitText, 20, y);
        y += splitText.length * 4 + 8;

        if (p.example_input) {
          if (y > 260) { doc.addPage(); y = 20; }
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text('Example Input:', 20, y);
          y += 5;
          const splitInput = doc.splitTextToSize(p.example_input, 170);
          doc.text(splitInput, 20, y);
          y += splitInput.length * 4 + 6;
        }

        if (p.example_output) {
          if (y > 260) { doc.addPage(); y = 20; }
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text('Example Output:', 20, y);
          y += 5;
          const splitOutput = doc.splitTextToSize(p.example_output, 170);
          doc.text(splitOutput, 20, y);
          y += splitOutput.length * 4 + 10;
        }

        y += 4;
      });

      doc.save(`promptcraft_batch_export_${dateStr}.pdf`);
    }
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const parsed = JSON.parse(jsonText);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      const validItems: PromptItem[] = items.map((item: any, idx: number) => ({
        prompt_id: item.prompt_id || `imported-${Date.now()}-${idx}`,
        name: item.name || 'Untitled Prompt',
        description: item.description || 'No description provided',
        prompt_text: item.prompt_text || '',
        tags: Array.isArray(item.tags) ? item.tags : ['imported'],
        associated_task: item.associated_task || 'Other',
        subfolder: item.subfolder || undefined,
        date_created: item.date_created || new Date().toISOString(),
        last_used: item.last_used || new Date().toISOString(),
        example_input: item.example_input,
        example_output: item.example_output,
        is_favorite: Boolean(item.is_favorite),
      }));

      onImportPrompts(validItems);
      setSuccess(`Successfully imported ${validItems.length} prompt(s)!`);
      setJsonText('');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(`Invalid JSON format: ${err.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setJsonText(content);
        setError(null);
      } catch (err: any) {
        setError('Failed to read file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-100 animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-stone-200 px-6 py-4 flex items-center justify-between shrink-0 bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-stone-900">Import & Batch Export</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Export Section */}
          <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Batch Export Prompts</h3>
              <p className="text-xs text-stone-500">Select format and choose which prompts to include in your export file.</p>
            </div>

            {/* Format Selector */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setExportFormat('json')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  exportFormat === 'json'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <FileJson className="w-5 h-5" />
                <span className="text-xs font-semibold">JSON</span>
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  exportFormat === 'csv'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span className="text-xs font-semibold">CSV Spreadsheet</span>
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('pdf')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  exportFormat === 'pdf'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs font-semibold">PDF Document</span>
              </button>
            </div>

            {/* Prompt Selection Checklist */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Select Prompts ({selectedPromptIds.size} of {prompts.length} selected)
                </span>
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  {isAllSelected ? 'Deselect All' : 'Select All Filtered'}
                </button>
              </div>

              {/* Search filter for prompts */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Filter prompts to export..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900/10"
                />
              </div>

              {/* Prompt list */}
              <div className="max-h-48 overflow-y-auto space-y-1.5 bg-white p-2 rounded-xl border border-stone-200">
                {filteredPromptsForExport.length === 0 ? (
                  <div className="text-center py-6 text-stone-400 text-xs">No matching prompts found.</div>
                ) : (
                  filteredPromptsForExport.map(p => {
                    const isSelected = selectedPromptIds.has(p.prompt_id);
                    return (
                      <div
                        key={p.prompt_id}
                        onClick={() => handleTogglePrompt(p.prompt_id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                          isSelected ? 'bg-indigo-50/60 text-indigo-900' : 'hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <button type="button" className="text-indigo-600 shrink-0">
                            {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-stone-400" />}
                          </button>
                          <span className="font-semibold truncate">{p.name}</span>
                          <span className="text-[10px] bg-stone-200/70 text-stone-600 px-1.5 py-0.5 rounded shrink-0 font-mono">
                            {p.associated_task}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportBatch}
              disabled={selectedPromptIds.size === 0}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export {selectedPromptIds.size} Prompt(s) as {exportFormat.toUpperCase()}</span>
            </button>
          </div>

          {/* Import Section */}
          <div className="border-t border-stone-200 pt-5">
            <form onSubmit={handleImport} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-stone-900">Import Prompts (JSON)</label>
                  <label className="text-xs font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload JSON file</span>
                    <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
                <p className="text-xs text-stone-500 mb-2">Paste JSON matching the prompt schema or upload a file.</p>
                <textarea
                  rows={5}
                  required
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder="[ { 'prompt_id': '...', 'name': '...', 'prompt_text': '...' } ]"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 text-stone-900"
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-medium transition-colors shadow-xs flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import Prompts</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
