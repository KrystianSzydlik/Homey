import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getHouseholdId, getUserId, getSessionData, SessionData } from '../auth-utils';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

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

  describe('getHouseholdId', () => {
    it('successfully returns household ID when session exists', async () => {
      mockAuth.mockResolvedValue(validSession);

      const result = await getHouseholdId();

      expect(result).toBe(mockHouseholdId);
      expect(mockAuth).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('redirects to login when session is null', async () => {
      mockAuth.mockResolvedValue(null);

      try {
        await getHouseholdId();
        expect.fail('Should have redirected');
      } catch (error) {
        expect(mockRedirect).toHaveBeenCalledWith('/login');
      }
    });

    it('redirects to login when user is null', async () => {
      mockAuth.mockResolvedValue({ user: null });

      try {
        await getHouseholdId();
        expect.fail('Should have redirected');
      } catch (error) {
        expect(mockRedirect).toHaveBeenCalledWith('/login');
      }
    });

    it('redirects to login when householdId is missing', async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: mockUserId,
          householdId: null,
        },
      });

      try {
        await getHouseholdId();
        expect.fail('Should have redirected');
      } catch (error) {
        expect(mockRedirect).toHaveBeenCalledWith('/login');
      }
    });

    it('redirects to login when householdId is undefined', async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: mockUserId,
        },
      });

      try {
        await getHouseholdId();
        expect.fail('Should have redirected');
      } catch (error) {
        expect(mockRedirect).toHaveBeenCalledWith('/login');
      }
    });

    it('redirects to login when session throws an error', async () => {
      mockAuth.mockRejectedValue(new Error('Auth failed'));

      try {
        await getHouseholdId();
        expect.fail('Should have thrown');
      } catch (error) {
        expect((error as Error).message).toBe('Auth failed');
      }
    });
  });

  describe('getUserId', () => {
    it('successfully returns user ID when session exists', async () => {
      mockAuth.mockResolvedValue(validSession);

      const result = await getUserId();

      expect(result).toBe(mockUserId);
      expect(mockAuth).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('redirects to login when session is null', async () => {
      mockAuth.mockResolvedValue(null);

      try {
        await getUserId();
        expect.fail('Should have redirected');
      } catch (error) {
        expect(mockRedirect).toHaveBeenCalledWith('/login');
      }
    });

    it('redirects to login when user is null', async () => {
      mockAuth.mockResolvedValue({ user: null });

      try {
        await getUserId();
        expect.fail('Should have redirected');
      } catch (error) {
        expect(mockRedirect).toHaveBeenCalledWith('/login');
      }
    });

    it('redirects to login when user ID is missing', async () => {
      mockAuth.mockResolvedValue({
        user: {
          householdId: mockHouseholdId,
          id: null,
        },
      });

      try {
        await getUserId();
        expect.fail('Should have redirected');
      } catch (error) {
        expect(mockRedirect).toHaveBeenCalledWith('/login');
      }
    });

    it('redirects to login when user ID is undefined', async () => {
      mockAuth.mockResolvedValue({
        user: {
          householdId: mockHouseholdId,
        },
      });

      try {
        await getUserId();
        expect.fail('Should have redirected');
      } catch (error) {
        expect(mockRedirect).toHaveBeenCalledWith('/login');
      }
    });
  });

  describe('getSessionData', () => {
    it('successfully returns session data when both ID and household ID exist', async () => {
      mockAuth.mockResolvedValue(validSession);

      const result = await getSessionData();

      expect(result).toEqual({
        householdId: mockHouseholdId,
        userId: mockUserId,
      });
      expect(mockAuth).toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('returns only required session fields', async () => {
      const minimalSession = {
        user: {
          id: 'user-789',
          householdId: 'household-456',
        },
      };
      mockAuth.mockResolvedValue(minimalSession);

      const result = await getSessionData();

      expect(result).toEqual({
        userId: 'user-789',
        householdId: 'household-456',
      });
      expect(result).not.toHaveProperty('name');
      expect(result).not.toHaveProperty('email');
    });

    it('redirects to login when session is null', async () => {
      mockAuth.mockResolvedValue(null);

      try {
        await getSessionData();
        expect.fail('Should have redirected');
      } catch (error) {
        expect(mockRedirect).toHaveBeenCalledWith('/login');
      }
    });

    it('redirects to login when user is null', async () => {
      mockAuth.mockResolvedValue({ user: null });

      try {
        await getSessionData();
        expect.fail('Should have redirected');
      } catch (error) {
        expect(mockRedirect).toHaveBeenCalledWith('/login');
      }
    });

    it('redirects to login when householdId is missing', async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: mockUserId,
          householdId: null,
        },
      });

      try {
        await getSessionData();
        expect.fail('Should have redirected');
      } catch (error) {
        expect(mockRedirect).toHaveBeenCalledWith('/login');
      }
    });

    it('redirects to login when user ID is missing', async () => {
      mockAuth.mockResolvedValue({
        user: {
          householdId: mockHouseholdId,
          id: null,
        },
      });

      try {
        await getSessionData();
        expect.fail('Should have redirected');
      } catch (error) {
        expect(mockRedirect).toHaveBeenCalledWith('/login');
      }
    });

    it('redirects to login when both IDs are missing', async () => {
      mockAuth.mockResolvedValue({
        user: {
          name: 'John Doe',
        },
      });

      try {
        await getSessionData();
        expect.fail('Should have redirected');
      } catch (error) {
        expect(mockRedirect).toHaveBeenCalledWith('/login');
      }
    });

    it('rejects when session throws an error', async () => {
      mockAuth.mockRejectedValue(new Error('Auth service unavailable'));

      try {
        await getSessionData();
        expect.fail('Should have thrown');
      } catch (error) {
        expect((error as Error).message).toBe('Auth service unavailable');
      }
    });
  });

  describe('SessionData type', () => {
    it('has required properties', async () => {
      mockAuth.mockResolvedValue(validSession);

      const data = await getSessionData();

      expect(data).toHaveProperty('householdId');
      expect(data).toHaveProperty('userId');
      expect(typeof data.householdId).toBe('string');
      expect(typeof data.userId).toBe('string');
    });
  });
});
