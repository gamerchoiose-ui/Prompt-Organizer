export interface PromptVersion {
  version_id: string;
  version_number: number;
  prompt_text: string;
  timestamp: string;
  change_summary?: string;
}

export interface PromptItem {
  prompt_id: string;
  name: string;
  description: string;
  prompt_text: string;
  tags: string[];
  associated_task: string;
  subfolder?: string;
  date_created: string;
  last_used: string;
  example_input?: string;
  example_output?: string;
  is_favorite?: boolean;
  versions?: PromptVersion[];
}

export type TaskCategory = 
  | 'All Tasks'
  | 'Writing'
  | 'Coding'
  | 'Brainstorming'
  | 'Summarization'
  | 'Analysis'
  | 'Marketing'
  | 'Education'
  | 'Productivity'
  | 'Other';

export interface PromptTemplate {
  name: string;
  description: string;
  prompt_text: string;
  tags: string[];
  associated_task: string;
  example_input?: string;
  example_output?: string;
}

export interface PromptTemplateItem {
  id: string;
  name: string;
  description: string;
  template_text: string;
}
