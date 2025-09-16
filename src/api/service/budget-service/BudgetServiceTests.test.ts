import { describe, it, expect, beforeEach, vi } from 'vitest';

import { budgetService } from './BudgetService';

import type { BudgetDto } from '../../dto/BudgetDto';

// Mock the global fetch
globalThis.fetch = vi.fn();

describe('budgetService', () => {
  const mockUserId = 1;
  const mockBudget: BudgetDto = {
    id: 123,
    totalBudget: 1000,
    monthNumber: 1,
    yearNumber: 2020,
    categories: [],
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('createOrUpdateBudget', () => {
    it('should create or update a budget successfully', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockBudget,
      } as Response);

      const result = await budgetService.createOrUpdateBudget(mockUserId, mockBudget);

      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:8080/api/budget/${mockUserId}`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockBudget),
        })
      );

      expect(result).toEqual(mockBudget);
    });

    it('should throw an error if the request fails', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        text: async () => 'Bad request',
      } as Response);

      await expect(budgetService.createOrUpdateBudget(mockUserId, mockBudget))
        .rejects
        .toThrow('Bad request');
    });
  });

  describe('getBudgets', () => {
    it('should fetch budgets successfully', async () => {
      const mockBudgets: BudgetDto[] = [mockBudget];

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockBudgets,
      } as Response);

      const result = await budgetService.getBudgets(mockUserId);

      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:8080/api/budget/${mockUserId}`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockBudgets);
    });

    it('should throw an error if the request fails', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        text: async () => 'Not found',
      } as Response);

      await expect(budgetService.getBudgets(mockUserId))
        .rejects
        .toThrow('Not found');
    });
  });
});
