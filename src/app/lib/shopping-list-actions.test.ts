import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Test Zod schemas used in shopping-list-actions
describe('Shopping List Schemas', () => {
  const createListSchema = z.object({
    name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
    emoji: z.string().max(10).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  });

  describe('createListSchema', () => {
    it('should validate correct input', () => {
      const input = {
        name: 'Groceries',
        emoji: '🛒',
        color: '#FF5733',
      };

      const result = createListSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const input = { name: '' };
      const result = createListSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject invalid color', () => {
      const input = {
        name: 'Groceries',
        color: 'invalid',
      };

      const result = createListSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const input = { name: 'My List' };
      const result = createListSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });
});
