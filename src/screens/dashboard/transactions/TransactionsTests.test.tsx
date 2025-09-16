import { screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, vi, expect, beforeEach } from 'vitest';

import { render } from '../../../testUtils';

import Transactions from './Transactions';
import * as useTransactionsHook from './useTransactions';

// --- Mock handlers ---
const mockHandleCategoryChange = vi.fn();
const mockHandleAmountChange = vi.fn();
const mockHandleTitleChange = vi.fn();
const mockHandleDeleteTransaction = vi.fn();
const mockHandleAddTransaction = vi.fn();
const mockHandleSaveTransactions = vi.fn();

const mockUseTransactions = {
  loading: false,
  error: '',
  success: '',
  transactionList: [
    { id: 1, title: 'Groceries', category: 'Food', amount: 50, isNew: true, date: new Date('2025-09-16'), budgetId: 1 },
    { id: 2, title: 'Rent', category: 'Housing', amount: 1000, isNew: false, date: new Date('2025-09-16'), budgetId: 1 },
  ],
  allCategories: ['Select Category', 'Food', 'Housing', 'Transport'],
  handleCategoryChange: mockHandleCategoryChange,
  handleAmountChange: mockHandleAmountChange,
  handleTitleChange: mockHandleTitleChange,
  handleDeleteTransaction: mockHandleDeleteTransaction,
  handleAddTransaction: mockHandleAddTransaction,
  handleSaveTransactions: mockHandleSaveTransactions,
  hasChanges: true,
};

vi.mock('./useTransactions', () => ({
  useTransactions: vi.fn(),
}));

const renderTransactionsComponent = (props = {}) => {
  return render(
    <MemoryRouter initialEntries={['/transactions']}>
      <Routes>
        <Route
          path="/transactions"
          element={
            <Transactions
              budget={{ id: 1, monthNumber: 9, yearNumber: 2025, totalBudget: 2000, categories: [] }}
              currentDate="2025-09-16"
              onTransactionsChanged={vi.fn()}
              {...props}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  );
};

describe('Transactions Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useTransactionsHook, 'useTransactions').mockReturnValue(mockUseTransactions);
  });

  it('renders page header and selected date', () => {
    renderTransactionsComponent();

    expect(screen.getByText(/transactions page/i)).toBeInTheDocument();
    expect(screen.getByText(/selected date: 2025-09-16/i)).toBeInTheDocument();
  });

  it('renders transaction list with title, category, and amount', () => {
    renderTransactionsComponent();

    expect(screen.getByDisplayValue('Groceries')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Rent')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
  });

  it('calls handleTitleChange and handleAmountChange on edit', () => {
    renderTransactionsComponent();

    const titleInput = screen.getByDisplayValue('Groceries');
    const amountInput = screen.getByLabelText(/amount 1/i);

    fireEvent.change(titleInput, { target: { value: 'Food Shopping' } });
    fireEvent.change(amountInput, { target: { value: '75' } });

    expect(mockHandleTitleChange).toHaveBeenCalledWith(0, 'Food Shopping');
    expect(mockHandleAmountChange).toHaveBeenCalledWith(0, 75);
  });

  it('calls handleCategoryChange on category select', () => {
    renderTransactionsComponent();

    const categorySelect = screen.getByDisplayValue('Food');
    fireEvent.change(categorySelect, { target: { value: 'Transport' } });

    expect(mockHandleCategoryChange).toHaveBeenCalledWith(0, 'Transport');
  });

  it('calls handleDeleteTransaction when delete clicked', () => {
    renderTransactionsComponent();

    const deleteBtns = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtns[0]);

    expect(mockHandleDeleteTransaction).toHaveBeenCalledWith(0);
  });

  it('shows "No transactions yet." if list empty', () => {
    vi.spyOn(useTransactionsHook, 'useTransactions').mockReturnValue({
      ...mockUseTransactions,
      transactionList: [],
    });

    renderTransactionsComponent();

    expect(screen.getByText(/no transactions yet/i)).toBeInTheDocument();
  });

  it('adds transaction when "Add Transaction" clicked', () => {
    renderTransactionsComponent();

    const addBtn = screen.getByRole('button', { name: /add transaction/i });
    fireEvent.click(addBtn);

    expect(mockHandleAddTransaction).toHaveBeenCalled();
  });

  it('calls handleSaveTransactions when "Save Transactions" clicked', () => {
    renderTransactionsComponent();

    const saveBtn = screen.getByRole('button', { name: /save transactions/i });
    fireEvent.click(saveBtn);

    expect(mockHandleSaveTransactions).toHaveBeenCalled();
  });

  it('renders loading, error, and success messages', () => {
    vi.spyOn(useTransactionsHook, 'useTransactions').mockReturnValue({
      ...mockUseTransactions,
      loading: true,
      error: 'Something went wrong',
      success: 'Transactions saved!',
    });

    renderTransactionsComponent();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/transactions saved!/i)).toBeInTheDocument();
  });

  it('disables "Add Transaction" and "Save Transactions" when no budget', () => {
    renderTransactionsComponent({ budget: null });

    expect(screen.getByRole('button', { name: /add transaction/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /save transactions/i })).toBeDisabled();
  });
});
