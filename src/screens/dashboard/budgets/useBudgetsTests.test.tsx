// tests/useBudgets.test.ts
import { act, renderHook } from '@testing-library/react';
import dayjs from 'dayjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { budgetService } from '../../../api/service/budget-service/BudgetService';
import { useAuth } from '../../../context/useAuth';

import { useBudgets } from './useBudgets';

import type { BudgetDto } from '../../../api/dto/BudgetDto';

// Mock the dependencies
vi.mock('../../../api/service/budget-service/BudgetService', () => ({
  budgetService: {
    createOrUpdateBudget: vi.fn(),
  },
}));

vi.mock('../../../context/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('dayjs', () => ({
  __esModule: true,
  default: vi.fn(),
}));

describe('useBudgets hook', () => {
  const mockUser = {
    user: {
      userId: '123',
    },
    login: vi.fn(),
    logout: vi.fn(),
  };

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

  const mockOnBudgetSaved = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Use vi.mocked() for proper typing
    vi.mocked(useAuth).mockReturnValue(mockUser);
  
    vi.mocked(dayjs).mockReturnValue({
      month: () => 4, // May (0-indexed)
      year: () => 2023,
      format: vi.fn(), // Add other dayjs methods that might be used
    } as unknown as dayjs.Dayjs);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with default state when no budget provided', () => {
    const { result } = renderHook(() => 
      useBudgets(null, 'May 2023', mockOnBudgetSaved)
    );

    expect(result.current.totalBudget).toBe(0);
    expect(result.current.categories).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('');
    expect(result.current.success).toBe('');
  });

  it('initializes with provided budget data', () => {
    const { result } = renderHook(() => 
      useBudgets(mockBudget, 'May 2023', mockOnBudgetSaved)
    );

    expect(result.current.totalBudget).toBe(1000);
    expect(result.current.categories).toEqual(mockBudget.categories);
  });

  it('updates state when budget prop changes', () => {
    type HookProps = {
      budget: BudgetDto | null;
      currentMonth: string;
      onBudgetSaved: () => void;
    };
  
    const { result, rerender } = renderHook(
      (props: HookProps) => useBudgets(props.budget, props.currentMonth, props.onBudgetSaved),
      {
        initialProps: {
          budget: null,
          currentMonth: 'May 2023',
          onBudgetSaved: mockOnBudgetSaved,
        } as HookProps, // <-- Add explicit type here
      }
    );
  
    expect(result.current.totalBudget).toBe(0);
  
    // Rerender with a budget
    rerender({
      budget: mockBudget,
      currentMonth: 'May 2023',
      onBudgetSaved: mockOnBudgetSaved,
    });
  
    expect(result.current.totalBudget).toBe(1000);
    expect(result.current.categories).toEqual(mockBudget.categories);
  });

  it('adds a new category', () => {
    const { result } = renderHook(() => 
      useBudgets(null, 'May 2023', mockOnBudgetSaved)
    );

    act(() => {
      result.current.handleAddCategory();
    });

    expect(result.current.categories).toEqual([
      { id: null, categoryName: 'Category 1', budgetAmount: 0 },
    ]);
  });

  it('does not add more than 10 categories', () => {
    const categories = Array(10).fill(0).map((_, i) => ({
      id: i + 1,
      categoryName: `Category ${i + 1}`,
      budgetAmount: 100,
    }));

    const budgetWithMaxCategories: BudgetDto = {
      ...mockBudget,
      categories,
    };

    const { result } = renderHook(() => 
      useBudgets(budgetWithMaxCategories, 'May 2023', mockOnBudgetSaved)
    );

    act(() => {
      result.current.handleAddCategory();
    });

    // Should still have only 10 categories
    expect(result.current.categories).toHaveLength(10);
  });

  it('deletes a category', () => {
    const { result } = renderHook(() => 
      useBudgets(mockBudget, 'May 2023', mockOnBudgetSaved)
    );

    act(() => {
      result.current.handleDeleteCategory(0);
    });

    expect(result.current.categories).toEqual([
      { id: 2, categoryName: 'Transport', budgetAmount: 200 },
    ]);
  });

  it('updates category amount', () => {
    const { result } = renderHook(() => 
      useBudgets(mockBudget, 'May 2023', mockOnBudgetSaved)
    );

    act(() => {
      result.current.handleCategoryAmountChange(0, 400);
    });

    expect(result.current.categories[0].budgetAmount).toBe(400);
  });

  it('updates category name', () => {
    const { result } = renderHook(() => 
      useBudgets(mockBudget, 'May 2023', mockOnBudgetSaved)
    );

    act(() => {
      result.current.handleCategoryNameChange(0, 'Groceries');
    });

    expect(result.current.categories[0].categoryName).toBe('Groceries');
  });

  it('updates total budget', () => {
    const { result } = renderHook(() => 
      useBudgets(mockBudget, 'May 2023', mockOnBudgetSaved)
    );

    act(() => {
      result.current.handleTotalBudgetChange({
        target: { value: '1500' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.totalBudget).toBe(1500);
  });

  it('shows error when total budget is not positive', async () => {
    const { result } = renderHook(() => 
      useBudgets(null, 'May 2023', mockOnBudgetSaved)
    );

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.MouseEvent<HTMLButtonElement>);
    });

    expect(result.current.error).toBe('ERROR: Total budget must be greater than zero.');
    expect(result.current.loading).toBe(false);
  });

  it('shows error when any category has zero budget', async () => {
    const budgetWithZeroCategory: BudgetDto = {
      ...mockBudget,
      totalBudget: 500,
      categories: [
        { id: 1, categoryName: 'Food', budgetAmount: 0 },
      ],
    };

    const { result } = renderHook(() => 
      useBudgets(budgetWithZeroCategory, 'May 2023', mockOnBudgetSaved)
    );

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.MouseEvent<HTMLButtonElement>);
    });

    expect(result.current.error).toBe('ERROR: All categories must have a budget greater than zero.');
    expect(result.current.loading).toBe(false);
  });

  it('shows error when category sum exceeds total budget', async () => {
    const { result } = renderHook(() => 
      useBudgets(mockBudget, 'May 2023', mockOnBudgetSaved)
    );

    // Increase one category amount to exceed total
    act(() => {
      result.current.handleCategoryAmountChange(0, 900);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.MouseEvent<HTMLButtonElement>);
    });

    expect(result.current.error).toBe('ERROR: The sum of all category budgets cannot exceed the total budget.');
    expect(result.current.loading).toBe(false);
  });

  it('shows error when user is not authenticated', async () => {
    vi.mocked(useAuth).mockReturnValue({ 
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    const { result } = renderHook(() => 
      useBudgets(mockBudget, 'May 2023', mockOnBudgetSaved)
    );

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.MouseEvent<HTMLButtonElement>);
    });

    expect(result.current.error).toBe('ERROR: User not authenticated.');
    expect(result.current.loading).toBe(false);
  });

  it('successfully saves budget and shows success message', async () => {
    // Mock with a proper BudgetDto return value
    vi.spyOn(budgetService, 'createOrUpdateBudget').mockResolvedValue(mockBudget);
  
    vi.useFakeTimers();
  
    const { result } = renderHook(() => 
      useBudgets(mockBudget, 'May 2023', mockOnBudgetSaved)
    );
  
    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.MouseEvent<HTMLButtonElement>);
    });
  
    expect(result.current.success).toBe('Budget saved successfully!');
    expect(budgetService.createOrUpdateBudget).toHaveBeenCalledWith(123, {
      ...mockBudget,
      monthNumber: 5,
      yearNumber: 2023,
    });
  
    // Advance timers to clear success message
    act(() => {
      vi.advanceTimersByTime(3000);
    });
  
    expect(result.current.success).toBe('');
    expect(mockOnBudgetSaved).toHaveBeenCalled();
  });

});
