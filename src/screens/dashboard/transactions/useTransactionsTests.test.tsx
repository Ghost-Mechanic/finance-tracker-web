// tests/useTransactions.test.ts
import { act, renderHook, waitFor } from '@testing-library/react';
import dayjs from 'dayjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { transactionService } from '../../../api/service/transaction-service/TransactionService';

import { useTransactions } from './useTransactions';

import type { BudgetDto } from '../../../api/dto/BudgetDto';
import type { TransactionDto } from '../../../api/dto/TransactionDto';

// Mock the dependencies
vi.mock('../../../api/service/transaction-service/TransactionService', () => ({
  transactionService: {
    getTransactions: vi.fn(),
    deleteTransaction: vi.fn(),
    createTransaction: vi.fn(),
  },
}));

vi.mock('dayjs', () => ({
  __esModule: true,
  default: vi.fn(),
}));

describe('useTransactions hook', () => {
  const mockBudget: BudgetDto = {
    id: 1,
    monthNumber: 5,
    yearNumber: 2023,
    totalBudget: 1000,
    categories: [
      { id: 1, categoryName: 'Food', budgetAmount: 300 },
      { id: 2, categoryName: 'Transport', budgetAmount: 200 },
    ],
  };

  const mockTransactions: TransactionDto[] = [
    {
      id: 1,
      date: new Date('2023-05-15'),
      title: 'Groceries',
      amount: 50,
      category: 'Food',
      budgetId: 1,
    },
    {
      id: 2,
      date: new Date('2023-05-15'),
      title: 'Bus fare',
      amount: 2.5,
      category: 'Transport',
      budgetId: 1,
    },
  ];

  const mockTransactionWithInvalidCategory: TransactionDto = {
    id: 3,
    date: new Date('2023-05-15'),
    title: 'Movie',
    amount: 15,
    category: 'Entertainment', // Not in budget categories
    budgetId: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dayjs).mockImplementation(() => {
      const mockDayjs = {
        format: vi.fn().mockReturnValue('2023-05-15'),
        startOf: vi.fn().mockReturnThis(),
        toDate: vi.fn().mockReturnValue(new Date('2023-05-15')),
      };
      return mockDayjs as unknown as dayjs.Dayjs;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with default state when no budget provided', () => {
    const { result } = renderHook(() => useTransactions(null, '2023-05-15', vi.fn()));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBeNull();
    expect(result.current.transactionList).toEqual([]);
    expect(result.current.allCategories).toEqual(['No Category']);
    expect(result.current.hasChanges).toBe(false);
  });

  it('fetches transactions when budget is provided', async () => {
    vi.mocked(transactionService.getTransactions).mockResolvedValue(mockTransactions);

    const { result } = renderHook(() => useTransactions(mockBudget, '2023-05-15', vi.fn()));

    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(transactionService.getTransactions).toHaveBeenCalledWith(mockBudget.id);
    expect(result.current.transactionList).toEqual(mockTransactions);
    expect(result.current.allCategories).toEqual(['No Category', 'Food', 'Transport']);
    expect(result.current.hasChanges).toBe(false);
  });

  it('filters transactions by current date', async () => {
    const mixedDateTransactions = [
      ...mockTransactions,
      {
        id: 3,
        date: new Date('2023-05-16'), // Different date
        title: 'Dinner',
        amount: 30,
        category: 'Food',
        budgetId: 1,
      },
    ];

    vi.mocked(transactionService.getTransactions).mockResolvedValue(mixedDateTransactions);

    const { result } = renderHook(() => useTransactions(mockBudget, '2023-05-15', vi.fn()));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.transactionList).toHaveLength(3); // Only transactions from 2023-05-15
  });

  it('reassigns invalid categories to "No Category"', async () => {
    vi.mocked(transactionService.getTransactions).mockResolvedValue([
      ...mockTransactions,
      mockTransactionWithInvalidCategory,
    ]);

    const { result } = renderHook(() => useTransactions(mockBudget, '2023-05-15', vi.fn()));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const invalidCategoryTx = result.current.transactionList.find(tx => tx.id === 3);
    expect(invalidCategoryTx?.category).toBe('No Category'); // Reassigned to empty string (No Category)
  });

  it('handles category change', async () => {
    vi.mocked(transactionService.getTransactions).mockResolvedValue(mockTransactions);

    const { result } = renderHook(() => useTransactions(mockBudget, '2023-05-15', vi.fn()));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleCategoryChange(0, 'Transport');
    });

    expect(result.current.transactionList[0].category).toBe('Transport');
    expect(result.current.hasChanges).toBe(false);
  });

  it('handles amount change', async () => {
    vi.mocked(transactionService.getTransactions).mockResolvedValue(mockTransactions);

    const { result } = renderHook(() => useTransactions(mockBudget, '2023-05-15', vi.fn()));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleAmountChange(0, 75);
    });

    expect(result.current.transactionList[0].amount).toBe(75);
    expect(result.current.hasChanges).toBe(false);
  });

  it('handles title change', async () => {
    vi.mocked(transactionService.getTransactions).mockResolvedValue(mockTransactions);

    const { result } = renderHook(() => useTransactions(mockBudget, '2023-05-15', vi.fn()));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleTitleChange(0, 'Supermarket');
    });

    expect(result.current.transactionList[0].title).toBe('Supermarket');
    expect(result.current.hasChanges).toBe(false);
  });

  it('adds a new transaction', async () => {
    vi.mocked(transactionService.getTransactions).mockResolvedValue(mockTransactions);

    const { result } = renderHook(() => useTransactions(mockBudget, '2023-05-15', vi.fn()));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleAddTransaction();
    });

    expect(result.current.transactionList).toHaveLength(3);
    const newTransaction = result.current.transactionList[2];
    expect(newTransaction.id).toBeNull();
    expect(newTransaction.isNew).toBe(true);
    expect(newTransaction.title).toBe('');
    expect(newTransaction.amount).toBe(0);
    expect(newTransaction.category).toBe('Food'); // First category
    expect(result.current.hasChanges).toBe(true);
  });

  it('shows error when trying to add transaction without budget categories', () => {
    const budgetWithoutCategories = { ...mockBudget, categories: [] };
    const { result } = renderHook(() => useTransactions(budgetWithoutCategories, '2023-05-15', vi.fn()));

    act(() => {
      result.current.handleAddTransaction();
    });

    expect(result.current.error).toBe('ERROR: Cannot add transactions until budget has at least one category.');
  });

  it('deletes a transaction', async () => {
    vi.mocked(transactionService.getTransactions).mockResolvedValue(mockTransactions);
    vi.mocked(transactionService.deleteTransaction).mockResolvedValue(undefined);

    const { result } = renderHook(() => useTransactions(mockBudget, '2023-05-15', vi.fn()));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.handleDeleteTransaction(0);
    });

    expect(transactionService.deleteTransaction).toHaveBeenCalledWith(1);
    expect(result.current.transactionList).toHaveLength(1);
    expect(result.current.transactionList[0].id).toBe(2);
  });

  it('shows error when validation fails for empty title', async () => {
    vi.mocked(transactionService.getTransactions).mockResolvedValue(mockTransactions);

    const { result } = renderHook(() => useTransactions(mockBudget, '2023-05-15', vi.fn()));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Set empty title
    act(() => {
      result.current.handleTitleChange(0, '');
    });

    await act(async () => {
      await result.current.handleSaveTransactions();
    });

    expect(result.current.error).toBe('ERROR: All transactions must have a non-empty title.');
    expect(result.current.loading).toBe(false);
  });

  it('shows error when validation fails for zero amount', async () => {
    vi.mocked(transactionService.getTransactions).mockResolvedValue(mockTransactions);

    const { result } = renderHook(() => useTransactions(mockBudget, '2023-05-15', vi.fn()));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Set zero amount
    act(() => {
      result.current.handleTitleChange(0, 'Valid Title'); // Ensure title is valid
      result.current.handleAmountChange(0, 0);
    });

    await act(async () => {
      await result.current.handleSaveTransactions();
    });

    expect(result.current.error).toBe('ERROR: Transaction amounts must be greater than 0.');
    expect(result.current.loading).toBe(false);
  });

});
