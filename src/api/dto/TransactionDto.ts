export interface TransactionDto {
    id: number | null;
    date: Date;
    title: string;
    amount: number;
    category: string;
    budgetId: number;
};
