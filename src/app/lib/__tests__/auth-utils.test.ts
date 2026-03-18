import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getHouseholdId, getUserId, getSessionData } from '../auth-utils';

const { mockAuth, mockRedirect } = vi.hoisted(() => {
  const mockAuth = vi.fn();
  const mockRedirect = vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  });
  return { mockAuth, mockRedirect };
});

vi.mock('@/auth', () => ({
  auth: mockAuth,
}));

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

describe('Auth Utilities', () => {
  const mockHouseholdId = 'household-123';
  const mockUserId = 'user-456';

  const validSession = {
    user: {
      id: mockUserId,
      householdId: mockHouseholdId,
      name: 'John Doe',
      email: 'john@example.com',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('happy paths', () => {
    it('getHouseholdId returns household ID from valid session', async () => {
      mockAuth.mockResolvedValue(validSession);
      expect(await getHouseholdId()).toBe(mockHouseholdId);
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('getUserId returns user ID from valid session', async () => {
      mockAuth.mockResolvedValue(validSession);
      expect(await getUserId()).toBe(mockUserId);
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('getSessionData returns both IDs from valid session', async () => {
      mockAuth.mockResolvedValue(validSession);
      const result = await getSessionData();
      expect(result).toEqual({ householdId: mockHouseholdId, userId: mockUserId });
      expect(result).not.toHaveProperty('name');
    });
  });

  describe('redirects on universally invalid sessions', () => {
    it.each([
      ['null session', null],
      ['null user', { user: null }],
      ['empty user object', { user: { name: 'John Doe' } }],
    ])('all auth functions redirect for %s', async (_label, session) => {
      for (const fn of [getHouseholdId, getUserId, getSessionData]) {
        mockAuth.mockResolvedValue(session);
        mockRedirect.mockClear();
        try {
          await fn();
          expect.fail('Should have redirected');
        } catch {
          expect(mockRedirect).toHaveBeenCalledWith('/login');
        }
      }
    });
  });

  describe('redirects on partially invalid sessions', () => {
    it('getHouseholdId redirects when householdId is missing', async () => {
      mockAuth.mockResolvedValue({ user: { id: mockUserId, householdId: null } });
      await expect(getHouseholdId()).rejects.toThrow();
      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });

    it('getUserId redirects when userId is missing', async () => {
      mockAuth.mockResolvedValue({ user: { householdId: mockHouseholdId, id: null } });
      await expect(getUserId()).rejects.toThrow();
      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });

    it('getSessionData redirects when either ID is missing', async () => {
      for (const session of [
        { user: { id: mockUserId, householdId: null } },
        { user: { householdId: mockHouseholdId, id: null } },
      ]) {
        mockAuth.mockResolvedValue(session);
        mockRedirect.mockClear();
        await expect(getSessionData()).rejects.toThrow();
        expect(mockRedirect).toHaveBeenCalledWith('/login');
      }
    });
  });

  it('propagates auth service errors', async () => {
    mockAuth.mockRejectedValue(new Error('Auth service unavailable'));
    await expect(getSessionData()).rejects.toThrow('Auth service unavailable');
  });
});
