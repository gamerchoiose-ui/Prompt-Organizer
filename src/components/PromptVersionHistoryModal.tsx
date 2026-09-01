import React, { useState } from 'react';
import { PromptItem, PromptVersion } from '../types';
import { X, History, RotateCcw, Clock, FileCode, Check, Eye } from 'lucide-react';

interface PromptVersionHistoryModalProps {
  prompt: PromptItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRevert: (promptId: string, version: PromptVersion) => void;
}

export const PromptVersionHistoryModal: React.FC<PromptVersionHistoryModalProps> = ({
  prompt,
  isOpen,
  onClose,
  onRevert,
}) => {
  if (!isOpen || !prompt) return null;

  const versions = prompt.versions || [
    {
      version_id: `v-${prompt.prompt_id}-1`,
      version_number: 1,
      prompt_text: prompt.prompt_text,
      timestamp: prompt.date_created || new Date().toISOString(),
      change_summary: 'Initial version',
    },
  ];

  const [selectedVersionId, setSelectedVersionId] = useState<string>(versions[versions.length - 1]?.version_id || versions[0].version_id);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedVersion = versions.find((v) => v.version_id === selectedVersionId) || versions[0];

  const handleRevert = () => {
    onRevert(prompt.prompt_id, selectedVersion);
    setSuccessMessage(`Successfully reverted to Version ${selectedVersion.version_number}!`);
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Version History</h2>
              <p className="text-xs text-slate-500">Track, compare, and revert previous versions of <span className="font-semibold text-slate-700">{prompt.name}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
          {/* Versions List Sidebar */}
          <div className="border-r border-slate-200 pr-4 overflow-y-auto space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Saved Versions ({versions.length})</div>
            {[...versions].reverse().map((ver) => {
              const isSelected = ver.version_id === selectedVersionId;
              const isCurrent = ver.prompt_text === prompt.prompt_text;
              return (
                <div
                  key={ver.version_id}
                  onClick={() => setSelectedVersionId(ver.version_id)}
                  className={`p-3.5 rounded-2xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-300 shadow-2xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">
                      Version {ver.version_number}
                      {isCurrent && <span className="ml-2 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] rounded font-medium">Current</span>}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ver.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium line-clamp-1">{ver.change_summary || 'Prompt text revision'}</p>
                </div>
              );
            })}
          </div>

          {/* Version Detail & Preview Pane */}
          <div className="md:col-span-2 flex flex-col space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <div className="text-xs font-bold text-slate-900">
                  Version {selectedVersion.version_number} Details
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" /> Saved on {new Date(selectedVersion.timestamp).toLocaleString()}
                </div>
              </div>
              {selectedVersion.prompt_text !== prompt.prompt_text ? (
                <button
                  onClick={handleRevert}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Revert to this Version
                </button>
              ) : (
                <div className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Active Version
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-indigo-600" /> Prompt Text Snapshot
              </div>
              <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-xs leading-relaxed whitespace-pre-wrap overflow-x-auto border border-slate-800 shadow-inner max-h-96">
                {selectedVersion.prompt_text}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-200 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
