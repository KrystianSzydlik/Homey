import { z } from 'zod';

/**
 * Wraps a server action function with standardized error handling.
 *
 * Catches ZodError (returns validation message) and generic errors
 * (returns generic message + console.error for debugging).
 *
 * @param actionName - Human-readable name for error logging (e.g., 'createShoppingItem')
 * @param fn - The async action function to wrap
 * @returns Wrapped function that never throws, always returns { success, ... } | { success: false, error }
 *
 * @example
 * ```ts
 * export const createItem = withServerAction(
 *   'createItem',
 *   async (input: CreateItemInput) => {
 *     const validated = createItemSchema.parse(input);
 *     const item = await prisma.shoppingItem.create({ data: validated });
 *     return { success: true as const, item };
 *   }
 * );
 * ```
 */
export function withServerAction<TInput, TResult>(
  actionName: string,
  fn: (input: TInput) => Promise<TResult>
): (input: TInput) => Promise<TResult | { success: false; error: string }> {
  return async (input: TInput) => {
    try {
      return await fn(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false as const,
          error: error.issues[0]?.message || 'Validation failed',
        };
      }
      console.error(`Error in ${actionName}:`, error);
      return {
        success: false as const,
        error: 'An unexpected error occurred',
      };
    }
  };
}
