import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

import { transactionService } from '../../../api/service/transaction-service/TransactionService';

import type { BudgetDto } from '../../../api/dto/BudgetDto';
import type { TransactionDto } from '../../../api/dto/TransactionDto';

interface EditableTransaction extends TransactionDto {
  isNew?: boolean;
}

interface useTransactions {
    loading: boolean;
    error: string | null;
    success: string | null;
    transactionList: EditableTransaction[];
    allCategories: string[];
    handleCategoryChange: (index: number, value: string) => void;
    handleAmountChange: (index: number, value: number) => void;
    handleTitleChange: (index: number, value: string) => void;
    handleDeleteTransaction: (index: number) => void;
    handleAddTransaction: () => void;
    handleSaveTransactions: () => Promise<void>;
    hasChanges: boolean;
};

export const useTransactions = (budget: BudgetDto | null, currentDate: string, onTransactionsChanged: () => Promise<void>): useTransactions => {
  const [originalTransactions, setOriginalTransactions] = useState<EditableTransaction[]>([]);
  const [transactionList, setTransactionList] = useState<EditableTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const allCategories = ['No Category', ...(budget?.categories?.map(c => c.categoryName) || [])];

  const hasChanges = useMemo(() => {
    if (transactionList.length !== originalTransactions.length) return true;
    
    for (let i = 0; i < transactionList.length; i++) {
      const tx = transactionList[i];
      const orig = originalTransactions[i];
    
      if (
        tx.title !== orig.title ||
          tx.amount !== orig.amount ||
          (tx.category || '') !== (orig.category || '')
      ) {
        return true;
      }
    }
    
    return false;
  }, [transactionList, originalTransactions]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!budget) return;
      setLoading(true);
      setError(null);
    
      try {
        if (!budget.id) throw new Error('Budget ID is missing');
    
        const transactions = await transactionService.getTransactions(budget.id) as TransactionDto[];
    
        // Filter by date
        const filteredTransactions = transactions.filter(tx => {
          const txDate = dayjs(tx.date).format('YYYY-MM-DD');
          const selectedDateFormatted = dayjs(currentDate).format('YYYY-MM-DD');
          return txDate === selectedDateFormatted;
        });
    
        // Build valid category set
        const validCategoryNames = new Set(budget.categories?.map(c => c.categoryName) || []);
    
        // Reassign invalid categories → "No Category"
        const cleanedTransactions = filteredTransactions.map(tx => {
          if (!tx.category || validCategoryNames.has(tx.category)) {
            return tx;
          }
          return {
            ...tx,
            category: 'No Category',
          };
        });
    
        setTransactionList(cleanedTransactions);
        setOriginalTransactions(cleanedTransactions);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError('Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [budget, currentDate]);  

  const handleCategoryChange = (index: number, value: string) => {
    const newList = [...transactionList];
    newList[index].category = value === 'No Category' ? '' : value;
    setTransactionList(newList);
  };
  
  const handleAmountChange = (index: number, value: number) => {
    const newList = [...transactionList];
    newList[index].amount = value;
    setTransactionList(newList);
  };
  
  const handleTitleChange = (index: number, value: string) => {
    const newList = [...transactionList];
    newList[index].title = value;
    setTransactionList(newList);
  };
  
  const handleDeleteTransaction = async (index: number) => {
    const transactionToDelete = transactionList[index];
  
    try {
      if (transactionToDelete.id) {
        await transactionService.deleteTransaction(transactionToDelete.id);
      }
  
      const newList = transactionList.filter((_, i) => i !== index);
      setTransactionList(newList);
      await onTransactionsChanged(); // refresh Dashboard
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Failed to delete transaction');
    }
  };
  
  const handleAddTransaction = () => {
    if (!budget?.id) return;
    if (!budget.categories || budget.categories.length === 0) {
      setError('ERROR: Cannot add transactions until budget has at least one category.');
      return;
    }
    
    const newTransaction: EditableTransaction = {
      id: null,
      date: dayjs(currentDate).startOf('day').toDate(),
      title: '',
      amount: 0,
      category: allCategories[1] || '', // default to first category
      budgetId: budget.id,
      isNew: true,
    };
    
    setTransactionList([...transactionList, newTransaction]);
  };  
  
  const handleSaveTransactions = async () => {
    if (!budget) return;
  
    setLoading(true);
    setError(null);
    setSuccess(null); // reset success
  
    // Validation: amount >= 0 and title non-empty
    for (const tx of transactionList) {
      if (!tx.title || tx.title.trim() === '') {
        setError('ERROR: All transactions must have a non-empty title.');
        setLoading(false);
        return;
      }
      if (tx.amount <= 0) {
        setError('ERROR: Transaction amounts must be greater than 0.');
        setLoading(false);
        return;
      }
    }
  
    try {
      const savedTransactions: EditableTransaction[] = [];
  
      for (const tx of transactionList) {
        if (!tx.id) {
          const created = await transactionService.createTransaction(tx);
          if ('id' in created && 'date' in created) {
            savedTransactions.push({ ...created, isNew: false });
          } else {
            console.error('Failed to create transaction:', created);
          }
        } else {
          savedTransactions.push({ ...tx, isNew: false });
        }
      }
  
      setTransactionList(savedTransactions);
      setSuccess('Transactions saved successfully!'); // <-- set success message
      await onTransactionsChanged(); // refresh Dashboard

      // auto-clear success after 3 seconds
      setTimeout(() => setSuccess(null), 3000);  
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Failed to save transactions');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    success,
    transactionList,
    allCategories,
    handleCategoryChange,
    handleAmountChange,
    handleTitleChange,
    handleDeleteTransaction,
    handleAddTransaction,
    handleSaveTransactions,
    hasChanges,
  };
};
