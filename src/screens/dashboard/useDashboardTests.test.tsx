// tests/useDashboard.test.ts
import { act, renderHook, waitFor } from '@testing-library/react';
import dayjs from 'dayjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { budgetService } from '../../api/service/budget-service/BudgetService';
import { transactionService } from '../../api/service/transaction-service/TransactionService';
import { useAuth } from '../../context/useAuth';

import { useDashboard } from './useDashboard';

import type { BudgetDto } from '../../api/dto/BudgetDto';
import type { TransactionDto } from '../../api/dto/TransactionDto';

// Mock dependencies
vi.mock('../../api/service/budget-service/BudgetService', () => ({
  budgetService: {
    getBudgets: vi.fn(),
  },
}));
vi.mock('../../api/service/transaction-service/TransactionService', () => ({
  transactionService: {
    getTransactions: vi.fn(),
  },
}));
vi.mock('../../context/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('useDashboard hook', () => {
  const mockUser = { user: { userId: '123' }, login: vi.fn(), logout: vi.fn() };

  const mockBudgets: BudgetDto[] = [
    {
      id: 1,
      monthNumber: 9,
      yearNumber: 2025,
      totalBudget: 1000,
      categories: [],
    },
    {
      id: 2,
      monthNumber: 8,
      yearNumber: 2025,
      totalBudget: 500,
      categories: [],
    },
  ];

  const mockTransactions: TransactionDto[] = [
    { id: 1, title: 'Coffee', amount: 100, category: 'Food', date: new Date('2025-09-16'), budgetId: 1 },
    { id: 2, title: 'Lunch', amount: 200, category: 'Food', date: new Date('2025-09-16'), budgetId: 1 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue(mockUser);
    vi.mocked(budgetService.getBudgets).mockResolvedValue(mockBudgets);
    vi.mocked(transactionService.getTransactions).mockResolvedValue(mockTransactions);
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useDashboard());

    expect(result.current.tab).toBe(0);
    expect(dayjs.isDayjs(result.current.selectedDate)).toBe(true);
    expect(result.current.selectedBudget).toBeNull();
    expect(result.current.budgetLeft).toBe(0);
  });

  it('fetches budgets on mount when user is authenticated', async () => {
    renderHook(() => useDashboard());

    await waitFor(() => {
      expect(budgetService.getBudgets).toHaveBeenCalledWith(123);
    });
  });

  it('maps budgets and selects correct budget for current date', async () => {
    const { result } = renderHook(() => useDashboard());

    await waitFor(() => {
      // Assuming today is Sept 2025
      expect(result.current.selectedBudget?.id).toBe(1);
    });
  });

  it('fetches transactions when selectedBudget changes', async () => {
    const { result } = renderHook(() => useDashboard());

    await waitFor(() => {
      expect(transactionService.getTransactions).toHaveBeenCalledWith(1);
    });

    // Budget left = 1000 - (100+200)
    expect(result.current.budgetLeft).toBe(700);
  });

  it('clears transactions when no selectedBudget', async () => {
    vi.mocked(budgetService.getBudgets).mockResolvedValue([]);
    const { result } = renderHook(() => useDashboard());

    await waitFor(() => {
      expect(result.current.selectedBudget).toBeNull();
      expect(result.current.budgetLeft).toBe(0);
    });
  });

  it('handleTransactionsChanged refetches transactions', async () => {
    const { result } = renderHook(() => useDashboard());

    await waitFor(() => {
      expect(transactionService.getTransactions).toHaveBeenCalledWith(1);
    });

    vi.mocked(transactionService.getTransactions).mockResolvedValue([
      { id: 3, title: 'Dinner', amount: 300, category: 'Food', date: new Date('2025-09-16'), budgetId: 1 },
    ]);

    await act(async () => {
      await result.current.handleTransactionsChanged();
    });

    expect(transactionService.getTransactions).toHaveBeenCalledTimes(2);
  });

  it('onBudgetSaved replaces or adds budget correctly', async () => {
    const { result } = renderHook(() => useDashboard());

    await waitFor(() => {
      expect(result.current.selectedBudget?.id).toBe(1);
    });

    const newBudget: BudgetDto = {
      id: 3,
      monthNumber: 9,
      yearNumber: 2025,
      totalBudget: 2000,
      categories: [],
    };

    await act(async () => {
      await result.current.onBudgetSaved(newBudget);
    });

    expect(result.current.selectedBudget?.totalBudget).toBe(2000);
  });

  it('handleTabChange updates the tab state', () => {
    const { result } = renderHook(() => useDashboard());

    act(() => {
      result.current.handleTabChange({} as React.SyntheticEvent, 1);
    });

    expect(result.current.tab).toBe(1);
  });

  it('handleDateChange clamps date between 2020-01-01 and 2026-12-31', () => {
    const { result } = renderHook(() => useDashboard());

    act(() => {
      result.current.handleDateChange(dayjs('2010-01-01'));
    });
    expect(result.current.selectedDate.format('YYYY-MM-DD')).toBe('2020-01-01');

    act(() => {
      result.current.handleDateChange(dayjs('2030-01-01'));
    });
    expect(result.current.selectedDate.format('YYYY-MM-DD')).toBe('2026-12-31');

    act(() => {
      result.current.handleDateChange(dayjs('2025-05-01'));
    });
    expect(result.current.selectedDate.format('YYYY-MM-DD')).toBe('2025-05-01');
  });
});
