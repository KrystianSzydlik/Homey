import { z } from 'zod';

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
