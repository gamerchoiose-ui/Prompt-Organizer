import React from 'react';
import { Sparkles, Plus, Download, Upload, Search, BookOpen, Layers } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenCreate: () => void;
  onOpenAIGenerator: () => void;
  onOpenImportExport: () => void;
  totalPrompts: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenCreate,
  onOpenAIGenerator,
  onOpenImportExport,
  totalPrompts,
}) => {
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-white shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
              PromptCraft <span className="text-xs font-semibold px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full border border-stone-200">Organizer</span>
            </h1>
            <p className="text-xs text-stone-500 hidden sm:block">Structured library for efficient prompt management</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts by title, text, or tags..."
              className="w-full pl-10 pr-4 py-2 bg-stone-50 hover:bg-stone-100/80 focus:bg-white border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenAIGenerator}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-medium transition-colors border border-indigo-200"
            title="Generate or optimize prompt with Gemini AI"
          >
            <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
            <span className="hidden sm:inline">AI Assistant</span>
          </button>

          <button
            onClick={onOpenImportExport}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-xl text-sm font-medium transition-colors border border-stone-200"
            title="Import / Export JSON"
          >
            <Download className="w-4 h-4 text-stone-500" />
            <span className="hidden lg:inline">JSON Data</span>
          </button>

          <button
            onClick={onOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>New Prompt</span>
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="px-4 pb-3 md:hidden">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts..."
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900/10"
          />
        </div>
      </div>
    </header>
  );
};
