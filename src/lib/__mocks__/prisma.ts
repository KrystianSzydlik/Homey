import { PrismaClient } from '@prisma/client';
import { beforeEach, vi } from 'vitest';
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

export const prismaMock = mockDeep<PrismaClient>();

beforeEach(() => {
  mockReset(prismaMock);
});

export type MockPrismaClient = DeepMockProxy<PrismaClient>;
