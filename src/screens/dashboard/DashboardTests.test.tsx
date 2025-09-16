// tests/Dashboard.test.tsx
import { screen, fireEvent } from '@testing-library/react';
import dayjs from 'dayjs';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, vi, expect, beforeEach } from 'vitest';

import { render } from '../../testUtils';

import Dashboard from './Dashboard';
import * as useDashboardHook from './useDashboard';

// Mock child components to simplify testing
vi.mock('./budgets/Budgets', () => ({
  default: vi.fn(() => <div data-testid="budgets-component">Budgets Component</div>),
}));
vi.mock('./transactions/Transactions', () => ({
  default: vi.fn(() => <div data-testid="transactions-component">Transactions Component</div>),
}));

const mockHandleTransactionsChanged = vi.fn();
const mockOnBudgetSaved = vi.fn();
const mockHandleTabChange = vi.fn();
const mockHandleDateChange = vi.fn();

const mockUseDashboard = {
  tab: 0,
  selectedDate: dayjs('2025-09-01'),
  selectedBudget: null,
  handleTransactionsChanged: mockHandleTransactionsChanged,
  budgetLeft: 2500,
  onBudgetSaved: mockOnBudgetSaved,
  handleTabChange: mockHandleTabChange,
  handleDateChange: mockHandleDateChange,
};

vi.mock('./useDashboard', () => ({
  useDashboard: vi.fn(),
}));

const renderDashboard = () => {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useDashboardHook, 'useDashboard').mockReturnValue(mockUseDashboard);
  });

  it('renders app bar with title', () => {
    renderDashboard();

    expect(screen.getByText(/budget buddy/i)).toBeInTheDocument();
  });

  it('renders tabs for Budget and Transactions', () => {
    renderDashboard();

    expect(screen.getByRole('tab', { name: /budget/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /transactions/i })).toBeInTheDocument();
  });

  it('renders Budgets component when tab = 0', () => {
    renderDashboard();

    expect(screen.getByTestId('budgets-component')).toBeInTheDocument();
    expect(screen.queryByTestId('transactions-component')).not.toBeInTheDocument();
  });

  it('renders Transactions component when tab = 1 and budget exists', () => {
    vi.spyOn(useDashboardHook, 'useDashboard').mockReturnValue({
      ...mockUseDashboard,
      tab: 1,
      selectedBudget: { id: 1, totalBudget: 5000, monthNumber: 1, yearNumber: 2022, categories: [] },
    });

    renderDashboard();

    expect(screen.getByTestId('transactions-component')).toBeInTheDocument();
    expect(screen.queryByTestId('budgets-component')).not.toBeInTheDocument();
  });

  it('renders fallback message when tab = 1 and no budget selected', () => {
    vi.spyOn(useDashboardHook, 'useDashboard').mockReturnValue({
      ...mockUseDashboard,
      tab: 1,
      selectedBudget: null,
    });

    renderDashboard();

    expect(screen.getByText(/no budget selected or created/i)).toBeInTheDocument();
  });

  it('calls handleTabChange when a tab is clicked', () => {
    renderDashboard();

    const transactionsTab = screen.getByRole('tab', { name: /transactions/i });
    fireEvent.click(transactionsTab);

    expect(mockHandleTabChange).toHaveBeenCalled();
  });

  it('renders DatePicker with selected date', () => {
    renderDashboard();

    expect(screen.getAllByLabelText(/select date/i)[0]).toBeInTheDocument();
  });

  it('calls handleDateChange when date is changed', () => {
    renderDashboard();

    const dateInput = screen.getAllByLabelText(/select date/i)[1];
    fireEvent.change(dateInput, { target: { value: '2025-10-01' } });

    expect(mockHandleDateChange).toHaveBeenCalled();
  });
});
