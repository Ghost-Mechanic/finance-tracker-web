import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

import { budgetService } from '../../../api/service/budget-service/BudgetService';
import { useAuth } from '../../../context/useAuth';

import type { BudgetCategoryDto } from '../../../api/dto/BudgetCategoryDto';
import type { BudgetDto } from '../../../api/dto/BudgetDto';

interface useBudgets {
    loading: boolean;
    error: string;
    success: string;
    totalBudget: number;
    categories: BudgetCategoryDto[];
    handleAddCategory: () => void;
    handleDeleteCategory: (index: number) => void;
    handleCategoryAmountChange: (index: number, value: number) => void;
    handleCategoryNameChange: (index: number, value: string) => void;
    handleTotalBudgetChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleSubmit: (event: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
    hasChanges: boolean;
};

export const useBudgets = (budget: BudgetDto | null, currentMonth: string, onBudgetSaved: (savedBudget: BudgetDto) => void): useBudgets => {
  const [totalBudget, setTotalBudget] = useState<number>(budget?.totalBudget || 0);
  const [categories, setCategories] = useState<BudgetCategoryDto[]>(budget?.categories || []);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const user = useAuth();

  // Parse the currentMonth prop to extract monthNumber and yearNumber
  const parsedDate = dayjs(currentMonth, 'MMMM YYYY');
  const monthNumber = parsedDate.month() + 1; // dayjs months are 0-indexed, so add 1
  const yearNumber = parsedDate.year();
  
  useEffect(() => {
    // Update state when the `budget` prop changes
    setTotalBudget(budget?.totalBudget || 0);
    setCategories(budget?.categories || []);
  }, [budget]);
  
  const handleAddCategory = () => {
    if (categories.length < 10) {
      setCategories(
        [...categories, 
          { 
            id: null,
            categoryName: `Category ${categories.length + 1}`,
            budgetAmount: 0 
          }
        ]
      );
    }
  };
  
  const handleDeleteCategory = (index: number) => {
    const updatedCategories = categories.filter((_, i) => i !== index);
    setCategories(updatedCategories);
  };
  
  const handleCategoryAmountChange = (index: number, value: number) => {
    const updatedCategories = [...categories];
    updatedCategories[index] = {
      ...updatedCategories[index],
      budgetAmount: value,
    };
    setCategories(updatedCategories);
  };
  
  const handleCategoryNameChange = (index: number, value: string) => {
    const updatedCategories = [...categories];
    updatedCategories[index] = {
      ...updatedCategories[index],
      categoryName: value,
    };
    setCategories(updatedCategories);
  };

  const hasChanges = useMemo(() => {
    if (!budget) {
      // If no budget exists yet, any value counts as change
      return totalBudget > 0 || categories.length > 0;
    }
  
    // Check if totalBudget changed
    if (totalBudget !== budget.totalBudget) return true;
  
    // Check if categories changed
    if (categories.length !== budget.categories.length) return true;
  
    for (let i = 0; i < categories.length; i++) {
      const c = categories[i];
      const b = budget.categories[i];
      if (c.categoryName !== b.categoryName || c.budgetAmount !== b.budgetAmount) {
        return true;
      }
    }
  
    return false;
  }, [totalBudget, categories, budget]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
  
    // ensure budget is a positive number
    if (totalBudget <= 0) {
      setError('ERROR: Total budget must be greater than zero.');
      setLoading(false);
      return;
    }
  
    // ensure all categories have a budget >= 0
    const invalidCategory = categories.find((category) => category.budgetAmount <= 0);
    if (invalidCategory) {
      setError('ERROR: All categories must have a budget greater than zero.');
      setLoading(false);
      return;
    }
  
    // ensure the sum of all category budgets does not exceed the total budget
    const totalCategoryBudget = categories.reduce((sum, category) => sum + category.budgetAmount, 0);
    if (totalCategoryBudget > totalBudget) {
      setError('ERROR: The sum of all category budgets cannot exceed the total budget.');
      setLoading(false);
      return;
    }
  
    try {
      const userId = user?.user?.userId;
  
      if (!userId) {
        setError('ERROR: User not authenticated.');
        setLoading(false);
        return;
      }
  
      const newBudget: BudgetDto = {
        id: budget?.id || null, // Use existing ID if updating, or 0 for new budgets
        monthNumber: monthNumber, // Replace with the actual month
        yearNumber: yearNumber, // Replace with the actual year
        totalBudget,
        categories,
      };
  
      budgetService.createOrUpdateBudget(Number(userId), newBudget);
      setSuccess('Budget saved successfully!');
  
      // Automatically clear the success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
      onBudgetSaved(newBudget); // Notify parent to refresh data
    } catch (err) {
      console.error('Failed to save budget:', err);
      setError('ERROR: Failed to save budget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTotalBudgetChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = Number(event.target.value); // Extract the value from the event
    setTotalBudget(value);
  };

  return {
    loading,
    error,
    success,
    totalBudget,
    categories,
    handleAddCategory,
    handleDeleteCategory,
    handleCategoryAmountChange,
    handleCategoryNameChange,
    handleTotalBudgetChange,
    handleSubmit,
    hasChanges,
  };
};
