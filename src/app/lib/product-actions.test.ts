import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductSuggestions,
  incrementProductUsage,
} from './product-actions';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { ShoppingCategory } from '@prisma/client';
import { createMockProduct } from '@/test/factories';

const { mockPrisma, mockAuth } = vi.hoisted(() => {
  const mockAuth = vi.fn();
  const mockPrisma = {
    product: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    shoppingItem: {
      findMany: vi.fn(),
    },
  };
  return { mockPrisma, mockAuth };
});

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));
vi.mock('@/auth', () => ({
  auth: mockAuth,
}));
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('Product Actions', () => {
  const mockUserId = 'user-123';
  const mockHouseholdId = 'household-123';

  beforeEach(() => {
    vi.resetAllMocks();
    mockAuth.mockResolvedValue({
      user: {
        id: mockUserId,
        householdId: mockHouseholdId,
      },
    });
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const input = {
        name: 'Milk',
        emoji: '🥛',
        defaultCategory: ShoppingCategory.DAIRY,
        defaultUnit: 'liter',
      };

      const mockProduct = createMockProduct({
        id: 'product-1',
        name: input.name,
        emoji: input.emoji,
        defaultCategory: input.defaultCategory,
        defaultUnit: input.defaultUnit,
        householdId: mockHouseholdId,
        createdById: mockUserId,
      });

      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.product.create).mockResolvedValue(mockProduct);

      const result = await createProduct(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.product).toEqual(mockProduct);
      }
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: {
          name_householdId: {
            name: input.name,
            householdId: mockHouseholdId,
          },
        },
      });
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: {
          name: input.name,
          emoji: input.emoji,
          defaultCategory: input.defaultCategory,
          defaultUnit: input.defaultUnit,
          householdId: mockHouseholdId,
          createdById: mockUserId,
        },
      });
    });

    it('should fail validation with empty name', async () => {
      const input = {
        name: '',
      };

      const result = await createProduct(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Name is required');
      }
    });

    it('should fail validation with name too long', async () => {
      const input = {
        name: 'a'.repeat(101),
      };

      const result = await createProduct(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it('should return error if product already exists', async () => {
      const input = {
        name: 'Milk',
      };

      vi.mocked(prisma.product.findUnique).mockResolvedValue(createMockProduct({
        id: 'existing-product',
        name: 'Milk',
      }));

      const result = await createProduct(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Product already exists');
      }
      expect(prisma.product.create).not.toHaveBeenCalled();
    });

    it('should default to OTHER category if not provided', async () => {
      const input = {
        name: 'Milk',
      };

      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.product.create).mockResolvedValue(createMockProduct({
        id: 'product-1',
        name: 'Milk',
        defaultCategory: 'OTHER',
      }));

      const result = await createProduct(input);

      expect(result.success).toBe(true);
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          defaultCategory: 'OTHER',
        }),
      });
    });
  });

  describe('updateProduct', () => {
    it('should update a product successfully', async () => {
      const productId = 'product-1';
      const input = {
        name: 'Updated Milk',
        emoji: '🥛',
      };

      vi.mocked(prisma.product.findFirst).mockResolvedValue(createMockProduct({
        id: productId,
        householdId: mockHouseholdId,
      }));

      const mockUpdatedProduct = createMockProduct({
        id: productId,
        name: input.name,
        emoji: input.emoji,
        householdId: mockHouseholdId,
      });

      vi.mocked(prisma.product.update).mockResolvedValue(mockUpdatedProduct);

      const result = await updateProduct(productId, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.product).toEqual(mockUpdatedProduct);
      }
      expect(prisma.product.findFirst).toHaveBeenCalledWith({
        where: { id: productId, householdId: mockHouseholdId },
      });
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: expect.objectContaining({
          name: input.name,
          emoji: input.emoji,
        }),
      });
    });

    it('should return error if product not found', async () => {
      vi.mocked(prisma.product.findFirst).mockResolvedValue(null);

      const result = await updateProduct('product-999', { name: 'New' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Product not found or access denied');
      }
      expect(prisma.product.update).not.toHaveBeenCalled();
    });

    it('should only update provided fields', async () => {
      const productId = 'product-1';
      const input = { name: 'New Name' };

      vi.mocked(prisma.product.findFirst).mockResolvedValue(createMockProduct({
        id: productId,
        householdId: mockHouseholdId,
      }));
      vi.mocked(prisma.product.update).mockResolvedValue(createMockProduct({
        id: productId,
        name: input.name,
      }));

      await updateProduct(productId, input);

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: { name: 'New Name' },
      });
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product successfully', async () => {
      const productId = 'product-1';

      vi.mocked(prisma.product.findFirst).mockResolvedValue(createMockProduct({
        id: productId,
        householdId: mockHouseholdId,
      }));
      vi.mocked(prisma.product.delete).mockResolvedValue(createMockProduct({ id: productId }));

      const result = await deleteProduct(productId);

      expect(result.success).toBe(true);
      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });

    it('should return error if product not found', async () => {
      vi.mocked(prisma.product.findFirst).mockResolvedValue(null);

      const result = await deleteProduct('product-999');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Product not found or access denied');
      }
      expect(prisma.product.delete).not.toHaveBeenCalled();
    });

    it('should scope deletion to household', async () => {
      const productId = 'product-1';

      vi.mocked(prisma.product.findFirst).mockResolvedValue(createMockProduct({
        id: productId,
        householdId: mockHouseholdId,
      }));
      vi.mocked(prisma.product.delete).mockResolvedValue(createMockProduct({ id: productId }));

      await deleteProduct(productId);

      expect(prisma.product.findFirst).toHaveBeenCalledWith({
        where: { id: productId, householdId: mockHouseholdId },
      });
    });
  });

  describe('searchProducts', () => {
    it('should search products by name', async () => {
      const query = 'milk';
      const mockProducts = [
        createMockProduct({ id: '1', name: 'Milk', householdId: mockHouseholdId }),
        createMockProduct({ id: '2', name: 'Almond Milk', householdId: null }),
      ];

      vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts);

      const result = await searchProducts(query);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.products).toEqual(mockProducts);
      }
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: query,
            mode: 'insensitive',
          },
          OR: [{ householdId: mockHouseholdId }, { householdId: null }],
        },
        take: 10,
      });
    });

    it('should include both household and global products', async () => {
      const query = 'milk';

      vi.mocked(prisma.product.findMany).mockResolvedValue([]);

      await searchProducts(query);

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { householdId: mockHouseholdId },
              { householdId: null },
            ],
          }),
        })
      );
    });

    it('should limit results to 10', async () => {
      vi.mocked(prisma.product.findMany).mockResolvedValue([]);

      await searchProducts('milk');

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        })
      );
    });

    it('should fail validation with empty query', async () => {
      const result = await searchProducts('');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('getProductSuggestions', () => {
    it('should return catalog suggestions', async () => {
      const query = 'milk';
      const mockCatalogProducts = [
        createMockProduct({
          id: 'product-1',
          name: 'Milk',
          emoji: '🥛',
          defaultCategory: ShoppingCategory.DAIRY,
          defaultUnit: 'liter',
          householdId: mockHouseholdId,
        }),
      ];

      vi.mocked(prisma.product.findMany).mockResolvedValue(mockCatalogProducts);
      vi.mocked(prisma.shoppingItem.findMany).mockResolvedValue([]);

      const result = await getProductSuggestions(query);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toMatchObject({
        id: 'product-1',
        name: 'Milk',
        emoji: '🥛',
        category: ShoppingCategory.DAIRY,
        defaultUnit: 'liter',
        source: 'catalog',
      });
      expect(result[0].score).toBeGreaterThan(0);
    });

    it('should return history suggestions', async () => {
      const query = 'bread';
      const mockRecentProducts = [
        createMockProduct({
          id: 'product-1',
          name: 'Bread',
          emoji: '🍞',
          defaultCategory: ShoppingCategory.BAKERY,
          defaultUnit: 'piece',
          purchaseCount: 5,
          lastPurchasedAt: new Date(),
          averageDaysBetweenPurchases: null,
        }),
      ];

      vi.mocked(prisma.product.findMany)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(mockRecentProducts)
        .mockResolvedValueOnce([]);

      const result = await getProductSuggestions(query);

      expect(result.length).toBeGreaterThan(0);
      const historySuggestion = result.find((s) => s.source === 'history');
      expect(historySuggestion).toBeDefined();
      expect(historySuggestion?.name).toBe('Bread');
    });

    it('should deduplicate suggestions by name and keep highest score', async () => {
      const query = 'milk';
      const mockCatalogProducts = [
        createMockProduct({
          id: 'product-1',
          name: 'Milk',
          emoji: '🥛',
          defaultCategory: ShoppingCategory.DAIRY,
          defaultUnit: 'liter',
          householdId: mockHouseholdId,
        }),
      ];
      const mockRecentProducts = [
        createMockProduct({
          id: 'product-2',
          name: 'Milk',
          emoji: '🥛',
          defaultCategory: ShoppingCategory.DAIRY,
          defaultUnit: 'liter',
          purchaseCount: 2,
          lastPurchasedAt: new Date(),
          averageDaysBetweenPurchases: null,
        }),
      ];

      vi.mocked(prisma.product.findMany)
        .mockResolvedValueOnce(mockCatalogProducts)
        .mockResolvedValueOnce(mockRecentProducts);

      const result = await getProductSuggestions(query);

      const milkSuggestions = result.filter((s) => s.name === 'Milk');
      expect(milkSuggestions.length).toBe(1);
    });

    it('should sort results by score descending', async () => {
      const query = 'milk';
      const mockCatalogProducts = [
        {
          id: 'product-1',
          name: 'Milk',
          emoji: '🥛',
          defaultCategory: ShoppingCategory.DAIRY,
          defaultUnit: 'liter',
          householdId: mockHouseholdId,
        },
        {
          id: 'product-2',
          name: 'Milk Chocolate',
          emoji: '🍫',
          defaultCategory: ShoppingCategory.SWEETS,
          defaultUnit: 'bar',
          householdId: mockHouseholdId,
        },
      ];

      vi.mocked(prisma.product.findMany).mockResolvedValue(mockCatalogProducts.map(p => createMockProduct(p)));
      vi.mocked(prisma.shoppingItem.findMany).mockResolvedValue([]);

      const result = await getProductSuggestions(query);

      expect(result.length).toBeGreaterThan(1);
      for (let i = 1; i < result.length; i++) {
        expect(result[i - 1].score).toBeGreaterThanOrEqual(result[i].score);
      }
    });

    it('should limit results to 10', async () => {
      const query = 'a';
      const mockProducts = Array.from({ length: 15 }, (_, i) =>
        createMockProduct({
          id: `product-${i}`,
          name: `Product ${i}`,
          emoji: null,
          defaultCategory: ShoppingCategory.OTHER,
          defaultUnit: null,
          householdId: mockHouseholdId,
        })
      );

      vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts.slice(0, 5));
      vi.mocked(prisma.shoppingItem.findMany).mockResolvedValue([]);

      const result = await getProductSuggestions(query);

      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should return empty array on error', async () => {
      vi.mocked(prisma.product.findMany).mockRejectedValue(new Error('DB error'));

      const result = await getProductSuggestions('milk');

      expect(result).toEqual([]);
    });
  });

  describe('incrementProductUsage', () => {
    it('should increment product usage count', async () => {
      const productId = 'product-1';

      vi.mocked(prisma.product.findFirst).mockResolvedValue(createMockProduct({
        id: productId,
        householdId: mockHouseholdId,
      }));
      vi.mocked(prisma.product.update).mockResolvedValue(createMockProduct({
        id: productId,
        usageCount: 1,
      }));

      await incrementProductUsage(productId);

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: {
          usageCount: { increment: 1 },
          lastUsedAt: expect.any(Date),
        },
      });
    });

    it('should not increment if product not found', async () => {
      vi.mocked(prisma.product.findFirst).mockResolvedValue(null);

      await incrementProductUsage('product-999');

      expect(prisma.product.update).not.toHaveBeenCalled();
    });

    it('should verify household access before incrementing', async () => {
      const productId = 'product-1';

      vi.mocked(prisma.product.findFirst).mockResolvedValue(createMockProduct({
        id: productId,
        householdId: mockHouseholdId,
      }));
      vi.mocked(prisma.product.update).mockResolvedValue(createMockProduct({ id: productId }));

      await incrementProductUsage(productId);

      expect(prisma.product.findFirst).toHaveBeenCalledWith({
        where: { id: productId, householdId: mockHouseholdId },
      });
    });
  });
});
