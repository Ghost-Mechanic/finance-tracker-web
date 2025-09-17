import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState, useMemo } from 'react';

import { budgetService } from '../../api/service/budget-service/BudgetService';
import { transactionService } from '../../api/service/transaction-service/TransactionService';
import { useAuth } from '../../context/useAuth';

import type { BudgetDto } from '../../api/dto/BudgetDto';
import type { TransactionDto } from '../../api/dto/TransactionDto';

interface useDashboard {
    tab: number;
    selectedDate: Dayjs;
    selectedBudget: BudgetDto | null;
    budgetLeft: number;
    handleTransactionsChanged: () => Promise<void>;
    onBudgetSaved: (savedBudget: BudgetDto) => Promise<void>;
    handleTabChange: (event: React.SyntheticEvent, newValue: number) => void;
    handleDateChange: (date: Dayjs | null) => void; // Optional, if date picker is added
}

export const useDashboard = (): useDashboard => {
  const [tab, setTab] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [budgets, setBudgets] = useState<BudgetDto[]>([]);
  const [transactions, setTransactions] = useState<TransactionDto[]>([]);

  const user = useAuth();

  useEffect(() => {
    const userId = user?.user?.userId;
    
    if (!userId) return; // No user ID yet, skip fetch
    
    const fetchData = async () => {
      try {
        const [budgetsData] = await Promise.all([
          budgetService.getBudgets(Number(userId)),
        ]);
      
        setBudgets(budgetsData as BudgetDto[]);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    
    fetchData();
  }, [user]);
    
  const budgetMap = useMemo(() => {
    const map = new Map<string, BudgetDto>();
    
    budgets.forEach((budget: BudgetDto) => {
      // Create a key like "2025-09" for September 2025
      const key = `${budget.yearNumber}-${budget.monthNumber.toString().padStart(2, '0')}`;
      map.set(key, budget);
    });
    
    return map;
  }, [budgets]);
    
  // Get the budget for the currently selected date
  const selectedKey = `${selectedDate.year()}-${(selectedDate.month() + 1)
    .toString()
    .padStart(2, '0')}`;
    
  const selectedBudget = budgetMap.get(selectedKey);
    
  const fetchTransactions = async (budgetId: number) => {
    try {
      const txs = await transactionService.getTransactions(budgetId);
      setTransactions(txs as TransactionDto[]);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };
      
  useEffect(() => {
    if (!selectedBudget?.id) {
      setTransactions([]);
      return;
    }
    fetchTransactions(selectedBudget.id);
  }, [selectedBudget]);
      
  // Callback for child components
  const handleTransactionsChanged = async () => {
    if (selectedBudget?.id) {
      await fetchTransactions(selectedBudget.id);
    }
  };  
    
  const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const budgetLeft = selectedBudget ? selectedBudget.totalBudget - totalSpent : 0; 
    
  const onBudgetSaved = async (savedBudget: BudgetDto) => {
    setBudgets((prev) => {
      const otherBudgets = prev.filter(
        (b) => b.monthNumber !== savedBudget.monthNumber || b.yearNumber !== savedBudget.yearNumber
      );
      return [...otherBudgets, savedBudget];
    });
  };  
      
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      if (date.isBefore(dayjs('2020-01-01'))) {
        setSelectedDate(dayjs('2020-01-01'));
      } else if (date.isAfter(dayjs('2026-12-31'))) {
        setSelectedDate(dayjs('2026-12-31'));
      } else {
        setSelectedDate(date);
      }
    }
  };

  return {
    tab,
    selectedDate,
    selectedBudget: selectedBudget || null,
    handleTransactionsChanged,
    budgetLeft,
    onBudgetSaved,
    handleTabChange,
    handleDateChange,
  };
};
