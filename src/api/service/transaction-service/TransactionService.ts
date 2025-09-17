import type { TransactionDto } from '../../dto/TransactionDto';

const API_URL = `${import.meta.env.VITE_API_URL}/api/transaction`;

export const transactionService = {
  createTransaction: async (data: TransactionDto): Promise<TransactionDto | Error> => {
    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Unable to update transaction');
    }
        
    const transaction: TransactionDto = await response.json();
    return transaction;
  },

  getTransactions: async (budgetId: number): Promise<TransactionDto[] | Error> => {
    const response = await fetch(`${API_URL}/budget/${budgetId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
      
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Unable to retrieve transactions');
    }
          
    const transactions: TransactionDto[] = await response.json();
    return transactions;
  },

  deleteTransaction: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Unable to delete transaction');
    }
  }
};
