import type { BudgetDto } from '../../dto/BudgetDto';

const API_URL = 'http://localhost:8080/api/budget'; 

export const budgetService = {
  createOrUpdateBudget: async (userId: number, data: BudgetDto): Promise<BudgetDto | Error> => {
    const response = await fetch(`${API_URL}/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Unable to update budget');
    }
    
    const budget: BudgetDto = await response.json();
    return budget;
  },

  getBudgets: async (userId: number): Promise<BudgetDto[] | Error> => {
    const response = await fetch(`${API_URL}/${userId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Unable to retrieve budgets');
    }

    const budgets: BudgetDto[] = await response.json();
    return budgets;
  }
};
