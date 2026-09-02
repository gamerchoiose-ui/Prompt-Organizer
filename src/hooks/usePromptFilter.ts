import { useState, useEffect, useMemo } from 'react';
import { PromptItem } from '../types';

export function usePromptFilter(
  prompts: PromptItem[],
  searchQuery: string,
  selectedTask: string,
  selectedSubFolder: string | null,
  selectedTag: string | null,
  showFavoritesOnly: boolean,
  showRecentOnly: boolean
) {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(searchQuery), 200);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  return useMemo(() => {
    let taskFilter: string | null = null;
    let tagFilter: string | null = null;
    let favFilter: boolean | null = null;
    let freeTextQuery = debouncedQuery.trim();

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
        !freeTextQuery ||
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

      const matchesRecent = !showRecentOnly || (
        Boolean(p.last_used) && 
        (Date.now() - new Date(p.last_used).getTime()) < 7 * 24 * 60 * 60 * 1000
      );

      return matchesFreeText && matchesTaskOp && matchesTagOp && matchesFavOp && matchesTask && matchesSubFolder && matchesTag && matchesFavorite && matchesRecent;
    });
  }, [prompts, debouncedQuery, selectedTask, selectedSubFolder, selectedTag, showFavoritesOnly, showRecentOnly]);
}
