import { screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, vi, expect, beforeEach } from 'vitest';

import { render } from '../../../testUtils';

import Budgets from './Budgets';
import * as useBudgetsHook from './useBudgets';

// --- Mock useBudgets hook ---
const mockHandleAddCategory = vi.fn();
const mockHandleDeleteCategory = vi.fn();
const mockHandleCategoryAmountChange = vi.fn();
const mockHandleCategoryNameChange = vi.fn();
const mockHandleTotalBudgetChange = vi.fn();
const mockHandleSubmit = vi.fn();

const mockUseBudgets = {
  loading: false,
  error: '',
  success: '',
  totalBudget: 5000,
  categories: [
    { id: 0, categoryName: 'Groceries', budgetAmount: 200 },
    { id: 1, categoryName: 'Rent', budgetAmount: 1500 },
  ],
  handleAddCategory: mockHandleAddCategory,
  handleDeleteCategory: mockHandleDeleteCategory,
  handleCategoryAmountChange: mockHandleCategoryAmountChange,
  handleCategoryNameChange: mockHandleCategoryNameChange,
  handleTotalBudgetChange: mockHandleTotalBudgetChange,
  handleSubmit: mockHandleSubmit,
  hasChanges: true,
};

vi.mock('./useBudgets', () => ({
  useBudgets: vi.fn(),
}));

const renderBudgetsComponent = (props = {}) => {
  return render(
    <MemoryRouter initialEntries={['/budgets']}>
      <Routes>
        <Route
          path="/budgets"
          element={
            <Budgets
              budget={null}
              currentMonth="September 2025"
              onBudgetSaved={vi.fn()}
              budgetLeft={3000}
              {...props}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  );
};

describe('Budgets Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useBudgetsHook, 'useBudgets').mockReturnValue(mockUseBudgets);
  });

  it('renders page header and selected month', () => {
    renderBudgetsComponent();

    expect(screen.getByText(/budget page/i)).toBeInTheDocument();
    expect(screen.getByText(/selected month: september 2025/i)).toBeInTheDocument();
  });

  it('renders total budget input with value', () => {
    renderBudgetsComponent();

    const totalBudgetInput = screen.getByLabelText(/total budget/i);
    expect(totalBudgetInput).toHaveValue(5000);
  });

  it('calls handleTotalBudgetChange on input change', () => {
    renderBudgetsComponent();

    const totalBudgetInput = screen.getByLabelText(/total budget/i);
    fireEvent.change(totalBudgetInput, { target: { value: '6000' } });

    expect(mockHandleTotalBudgetChange).toHaveBeenCalled();
  });

  it('renders categories and allows name/amount change', () => {
    renderBudgetsComponent();

    const nameInput = screen.getByLabelText(/category name 1/i);
    const amountInput = screen.getByLabelText(/budget amount 1/i);

    fireEvent.change(nameInput, { target: { value: 'Food' } });
    fireEvent.change(amountInput, { target: { value: '300' } });

    expect(mockHandleCategoryNameChange).toHaveBeenCalledWith(0, 'Food');
    expect(mockHandleCategoryAmountChange).toHaveBeenCalledWith(0, 300);
  });

  it('calls handleDeleteCategory when delete button clicked', () => {
    renderBudgetsComponent();

    const deleteBtns = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtns[0]);

    expect(mockHandleDeleteCategory).toHaveBeenCalledWith(0);
  });

  it('adds category when "Add Category" clicked', () => {
    renderBudgetsComponent();

    const addBtn = screen.getByRole('button', { name: /add category/i });
    fireEvent.click(addBtn);

    expect(mockHandleAddCategory).toHaveBeenCalled();
  });

  it('calls handleSubmit when "Save Budget" clicked', () => {
    renderBudgetsComponent();

    const saveBtn = screen.getByRole('button', { name: /save budget/i });
    fireEvent.click(saveBtn);

    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it('renders error message if error exists', () => {
    vi.spyOn(useBudgetsHook, 'useBudgets').mockReturnValue({
      ...mockUseBudgets,
      error: 'Something went wrong',
      hasChanges: true,
    });

    renderBudgetsComponent();

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('renders success message if success exists', () => {
    vi.spyOn(useBudgetsHook, 'useBudgets').mockReturnValue({
      ...mockUseBudgets,
      success: 'Budget saved!',
      hasChanges: true,
    });

    renderBudgetsComponent();

    expect(screen.getByText(/budget saved!/i)).toBeInTheDocument();
  });

  it('renders loading overlay when loading is true', () => {
    vi.spyOn(useBudgetsHook, 'useBudgets').mockReturnValue({
      ...mockUseBudgets,
      loading: true,
      hasChanges: true,
    });

    renderBudgetsComponent();

    expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
  });
});
