/**
 * Safely extract error messages from unknown error types.
 * Replaces unsafe error handling patterns like:
 *   catch (error) { console.error(error.message) }
 */

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as Record<string, unknown>).message;
    return typeof msg === 'string' ? msg : JSON.stringify(error);
  }
  if (error && typeof error === 'object') {
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }
  return String(error);
}

export function logError(context: string, error: unknown): void {
  const message = getErrorMessage(error);
  console.error(`[${context}] ${message}`, error);
}

/**
 * Type guard for Zod validation errors.
 * Used to properly narrow error types in catch blocks.
 */
export function isZodError(
  error: unknown
): error is { issues: Array<{ message: string }> } {
  if (typeof error !== 'object' || error === null) return false;
  if (!('issues' in error)) return false;
  const issues = (error as Record<string, unknown>).issues;
  return Array.isArray(issues);
}
