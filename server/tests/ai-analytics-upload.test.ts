import { describe, expect, it } from 'vitest';
import { classifyIssue, scorePriority } from '../src/services/aiService.js';

describe('AI fallback scoring and classification', () => {
  it('classifies common infrastructure keywords', () => {
    const result = classifyIssue('Garbage pile in lane', 'Waste is overflowing and smells bad');
    expect(result.category).toBe('sanitation');
    expect(result.source).toContain('fallback');
  });

  it('scores critical public safety items higher', () => {
    const score = scorePriority('critical', 'public_safety');
    expect(score.score).toBeGreaterThanOrEqual(90);
  });
});
