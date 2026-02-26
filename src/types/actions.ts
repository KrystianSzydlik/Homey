/**
 * Generic discriminated union for server action results.
 *
 * Usage:
 *   ActionResult<{ item: ShoppingItemWithCreator }>
 *   ActionResult<{ deletedCount: number }>
 *   ActionResult (void success — no payload)
 */
export type ActionResult<T extends Record<string, unknown> = Record<string, never>> =
  | ({ success: true } & T)
  | { success: false; error: string };
