import { describe, it, expect } from 'vitest';
import { validateAndParsePromptImport } from '../utils/promptValidator';

describe('Prompt JSON Schema Validation & Error Handling', () => {
  it('should successfully validate and parse correct prompt JSON', () => {
    const validJson = JSON.stringify([
      {
        prompt_id: 'p1',
        name: 'Test Prompt',
        associated_task: 'Writing',
        prompt_text: 'Summarize this text: {{text}}',
        tags: ['summary'],
      },
    ]);

    const result = validateAndParsePromptImport(validJson);
    expect(result.valid).toBe(true);
    expect(result.prompts).toHaveLength(1);
    expect(result.prompts[0].name).toBe('Test Prompt');
    expect(result.errors).toHaveLength(0);
  });

  it('should catch invalid JSON syntax and return descriptive errors', () => {
    const invalidJson = '{ invalid json syntax }';
    const result = validateAndParsePromptImport(invalidJson);

    expect(result.valid).toBe(false);
    expect(result.prompts).toHaveLength(0);
    expect(result.errors[0]).toContain('Invalid JSON syntax');
  });

  it('should catch missing required fields like name and prompt_text', () => {
    const incompleteJson = JSON.stringify([
      {
        associated_task: 'Coding',
      },
    ]);

    const result = validateAndParsePromptImport(incompleteJson);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
