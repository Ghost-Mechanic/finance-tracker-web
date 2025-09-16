import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Grid, TextField, Typography, IconButton, Button, MenuItem, Select } from '@mui/material';

import { useTransactions } from './useTransactions';

import type { BudgetDto } from '../../../api/dto/BudgetDto';

interface TransactionProps {
  currentDate: string;
  budget: BudgetDto | null;
  onTransactionsChanged: () => Promise<void>; // Callback to refresh data after saving
}

export default function Transactions({ currentDate, budget, onTransactionsChanged }: TransactionProps) {
  const {
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
  } = useTransactions(budget, currentDate, onTransactionsChanged);

  return (
    <Box>
      <Typography variant="h5">Transactions Page</Typography>
      <Typography>Add and view daily transactions here.</Typography>
      <Typography variant="subtitle1" sx={{ mt: 1 }}>
        Selected Date: {currentDate}
      </Typography>

      {loading && <Typography color="primary">Loading...</Typography>}
      {error && <Typography color="error" mt={1}>{error}</Typography>}
      {success && <Typography color="primary" mt={1}>{success}</Typography>}

      <Box mt={3}>
        <Typography variant="h6">Transactions</Typography>
        {transactionList.length > 0 ? (
          transactionList.map((transaction, index) => {
            const isEditable = transaction.isNew;

            return (
              <Grid display="flex" gap={2} key={transaction.id ?? index} alignItems="center" mt={1}>
                <TextField
                  label="Title"
                  value={transaction.title}
                  onChange={(e) => handleTitleChange(index, e.target.value)}
                  slotProps={{ input: { readOnly: !isEditable } }}
                  sx={{ flex: 4 }}
                />
                <Select
                  value={transaction.category || allCategories[0]} // fallback to first category if empty
                  onChange={(e) => handleCategoryChange(index, e.target.value)}
                  sx={{
                    flex: 4,
                    pointerEvents: isEditable ? 'auto' : 'none',
                    color: 'text.primary',
                    '& .MuiSelect-icon': { display: isEditable ? 'block' : 'none' }
                  }}
                  slotProps={{ input: { readOnly: !isEditable } }}
                >
                  {allCategories.slice(1).map((category, idx) => (
                    <MenuItem key={idx} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                <TextField
                  label={`Amount ${index + 1}`}
                  type="number"
                  value={transaction.amount}
                  onChange={(e) => handleAmountChange(index, Number(e.target.value))}
                  slotProps={{ input: { readOnly: !isEditable } }}
                  sx={{ flex: 4 }}
                />
                <IconButton onClick={() => handleDeleteTransaction(index)} aria-label="delete" sx={{ flex: 2 }}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            );
          })
        ) : (
          <Typography mt={1}>No transactions yet.</Typography>
        )}

        <Box mt={2}>
          <Button variant="outlined" onClick={handleAddTransaction} disabled={!budget}>
            Add Transaction
          </Button>
        </Box>

        <Box mt={3}>
          <Button variant="contained" color="primary" onClick={handleSaveTransactions} disabled={!budget || loading || !hasChanges}>
            Save Transactions
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
