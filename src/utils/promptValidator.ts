import { PromptItem, PromptVersion } from '../types';

export interface ValidationResult {
  valid: boolean;
  prompts: PromptItem[];
  errors: string[];
}

/**
 * Validates raw JSON input against the PromptItem schema.
 * Handles schema parsing errors, missing fields, and type mismatches.
 */
export function validateAndParsePromptImport(rawJsonString: string): ValidationResult {
  const errors: string[] = [];
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawJsonString);
  } catch (err: unknown) {
    return {
      valid: false,
      prompts: [],
      errors: [`Invalid JSON syntax: ${err instanceof Error ? err.message : 'Unknown error'}`],
    };
  }

  const items = Array.isArray(parsed) ? parsed : [parsed];
  const validPrompts: PromptItem[] = [];

  items.forEach((rawItem, index) => {
    const prefix = `Item [${index}]`;
    if (!rawItem || typeof rawItem !== 'object') {
      errors.push(`${prefix}: Must be a valid JSON object.`);
      return;
    }

    const item = rawItem as Record<string, unknown>;

    if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
      errors.push(`${prefix}: Missing or invalid 'name' field.`);
    }

    if (!item.prompt_text || typeof item.prompt_text !== 'string') {
      errors.push(`${prefix}: Missing or invalid 'prompt_text' field.`);
    }

    if (!item.associated_task || typeof item.associated_task !== 'string') {
      errors.push(`${prefix}: Missing or invalid 'associated_task' field.`);
    }

    if (errors.length === 0 || errors.length === validPrompts.length * 2) {
      // If no critical errors for this item, normalize and push
      const normalizedItem: PromptItem = {
        prompt_id: (item.prompt_id as string) || `imported_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: String(item.name || 'Untitled Prompt'),
        description: item.description ? String(item.description) : String(item.name || ''),
        associated_task: String(item.associated_task || 'General'),
        subfolder: item.subfolder ? String(item.subfolder) : undefined,
        tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
        prompt_text: String(item.prompt_text || ''),
        example_input: item.example_input ? String(item.example_input) : undefined,
        example_output: item.example_output ? String(item.example_output) : undefined,
        date_created: item.date_created ? String(item.date_created) : new Date().toISOString().split('T')[0],
        last_used: item.last_used ? String(item.last_used) : new Date().toISOString(),
        is_favorite: Boolean(item.is_favorite),
        versions: Array.isArray(item.versions) ? (item.versions as PromptVersion[]) : [],
        use_count: typeof item.use_count === 'number' ? item.use_count : 0,
      };
      validPrompts.push(normalizedItem);
    }
  });

  return {
    valid: errors.length === 0 && validPrompts.length > 0,
    prompts: validPrompts,
    errors,
  };
}
