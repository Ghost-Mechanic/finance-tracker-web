import type { BudgetCategoryDto } from './BudgetCategoryDto';

export interface BudgetDto {
  budgetId: number;
  monthNumber: number;
  yearNumber: number;
  totalBudget: number;
  categories: BudgetCategoryDto[];
};
