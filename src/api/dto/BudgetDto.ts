import type { BudgetCategoryDto } from './BudgetCategoryDto';

export interface BudgetDto {
  id: number | null;
  monthNumber: number;
  yearNumber: number;
  totalBudget: number;
  categories: BudgetCategoryDto[];
};
