import { describe, it, expect } from 'vitest';
import { updateEwa, calcAverageDays } from '../purchase-stats';

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 86_400_000);
}

describe('updateEwa', () => {
  it('returns the gap when prevEwa is null (first data point)', () => {
    expect(updateEwa(null, daysAgo(7), daysAgo(0))).toBeCloseTo(7);
  });

  it('blends new gap with previous EWA using alpha', () => {
    expect(updateEwa(7, daysAgo(3), daysAgo(0))).toBeCloseTo(5.8);
  });

  it('higher alpha reacts faster to new gaps', () => {
    const highAlpha = updateEwa(7, daysAgo(3), daysAgo(0), 0.8);
    const lowAlpha = updateEwa(7, daysAgo(3), daysAgo(0), 0.2);
    expect(highAlpha).toBeLessThan(lowAlpha);
  });
});

describe('calcAverageDays', () => {
  it('returns null for fewer than 2 purchases', () => {
    expect(calcAverageDays([])).toBeNull();
    expect(calcAverageDays([{ purchasedAt: new Date() }])).toBeNull();
  });

  it('returns the single gap for exactly 2 purchases', () => {
    const purchases = [
      { purchasedAt: new Date('2024-01-01') },
      { purchasedAt: new Date('2024-01-08') },
    ];
    expect(calcAverageDays(purchases)).toBeCloseTo(7);
  });

  it('adapts toward new rhythm — masło example', () => {
    const dates = [0, 7, 14, 17, 20, 23].map((offset) => {
      const d = new Date('2024-01-01');
      d.setDate(d.getDate() + offset);
      return { purchasedAt: d };
    });
    const result = calcAverageDays(dates)!;
    expect(result).toBeLessThan(4.6);
    expect(result).toBeGreaterThan(3);
  });

  it('sorts out-of-order input before computing', () => {
    const purchases = [
      { purchasedAt: new Date('2024-01-08') },
      { purchasedAt: new Date('2024-01-01') },
    ];
    expect(calcAverageDays(purchases)).toBeCloseTo(7);
  });

  it('reuses updateEwa — same result as manual iteration', () => {
    const purchases = [
      { purchasedAt: new Date('2024-01-01') },
      { purchasedAt: new Date('2024-01-08') },
      { purchasedAt: new Date('2024-01-11') },
    ];
    expect(calcAverageDays(purchases)).toBeCloseTo(5.8);
  });
});
