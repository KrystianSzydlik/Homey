const MS_PER_DAY = 86_400_000;
const DEFAULT_ALPHA = 0.3;

/**
 * One step of exponential weighted average for purchase intervals.
 * Called per-event in recordPurchase — O(1), no history fetch needed.
 */
export function updateEwa(
  prevEwa: number | null,
  lastAt: Date,
  newAt: Date,
  alpha = DEFAULT_ALPHA
): number {
  const gapDays = (newAt.getTime() - lastAt.getTime()) / MS_PER_DAY;
  return prevEwa === null ? gapDays : alpha * gapDays + (1 - alpha) * prevEwa;
}

/**
 * Computes EWA from a full purchase history.
 * Use for backfills / one-time calculations over existing data.
 * Regular updates should use updateEwa instead.
 */
export function calcAverageDays(
  purchases: { purchasedAt: Date }[],
  alpha = DEFAULT_ALPHA
): number | null {
  if (purchases.length < 2) return null;
  const sorted = [...purchases].sort(
    (a, b) => a.purchasedAt.getTime() - b.purchasedAt.getTime()
  );
  let ewa: number | null = null;
  for (let i = 1; i < sorted.length; i++) {
    ewa = updateEwa(ewa, sorted[i - 1].purchasedAt, sorted[i].purchasedAt, alpha);
  }
  return ewa;
}
