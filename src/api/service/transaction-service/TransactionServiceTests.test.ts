import { describe, it, expect, beforeEach, vi } from 'vitest';

import { transactionService } from './TransactionService';

import type { TransactionDto } from '../../dto/TransactionDto';

// Mock the global fetch
globalThis.fetch = vi.fn();

describe('transactionService', () => {
  const mockBudgetId = 123;
  const mockTransaction: TransactionDto = {
    id: 123,
    date: new Date('01-01-2020'),
    amount: 1000,
    title: 'Burger',
    category: 'Food',
    budgetId: 1,
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('createTransaction', () => {
    it('should create a transaction successfully', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockTransaction,
      } as Response);

      const result = await transactionService.createTransaction(mockTransaction);
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/transaction',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockTransaction),
        })
      );
      
      expect(result).toEqual(mockTransaction);
    });

    it('should throw an error if the request fails', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        text: async () => 'Bad request',
      } as Response);
    
      await expect(transactionService.createTransaction(mockTransaction))
        .rejects
        .toThrow('Bad request');
    });
  });

  describe('getTransactions', () => {
    it('should fetch transactions successfully', async () => {
      const mockTransactions: TransactionDto[] = [mockTransaction];
  
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockTransactions,
      } as Response);
  
      const result = await transactionService.getTransactions(mockBudgetId);
  
      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:8080/api/transaction/budget/${mockBudgetId}`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockTransactions);
    });
  
    it('should throw an error if the request fails', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        text: async () => 'Not found',
      } as Response);
  
      await expect(transactionService.getTransactions(mockBudgetId))
        .rejects
        .toThrow('Not found');
    });
  });

  describe('deleteTransaction', () => {
    it('should delete a transaction successfully', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
      } as Response);

      await transactionService.deleteTransaction(123);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/transaction/123',
        expect.objectContaining({
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should throw an error if the delete fails', async () => {
      // Mock failed DELETE response
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        text: async () => 'Delete failed',
      } as Response);
    
      await expect(transactionService.deleteTransaction(123))
        .rejects
        .toThrow('Delete failed');
    });
  });
});
