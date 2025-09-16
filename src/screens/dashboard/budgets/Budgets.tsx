import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, TextField, Typography, IconButton } from '@mui/material';
import Grid from '@mui/material/Grid';

import LoadingOverlay from '../../component/LoadingOverlay';

import { useBudgets } from './useBudgets';

import type { BudgetDto } from '../../../api/dto/BudgetDto';

interface BudgetProps {
  budget: BudgetDto | null;
  currentMonth: string;
  onBudgetSaved: (savedBudget: BudgetDto) => Promise<void>; // Callback to refresh data after saving
  budgetLeft: number;
}

export default function Budgets({ budget, currentMonth, onBudgetSaved, budgetLeft }: BudgetProps) {
  const {
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
  } = useBudgets(budget, currentMonth, onBudgetSaved);

  return (
    <>
      {loading && <LoadingOverlay />}
      <Box>
        <Typography variant="h5">Budget Page</Typography>
        <Typography>
          Set monthly budgets and categories here.
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          Selected Month: {currentMonth}
        </Typography>

        <Box mt={3}>
          <TextField
            label="Total Budget"
            type="number"
            fullWidth
            value={totalBudget}
            onChange={(e) => handleTotalBudgetChange(e)}
          />
        </Box>

        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Total Budget Left: ${budgetLeft}
        </Typography>

        <Box mt={3}>
          <Typography variant="h6">Categories</Typography>
          {categories.map((category, index) => (
            <Grid
              display="flex"
              gap={2}
              key={index}
              alignItems="center"
              mt={1}
            >
              <TextField
                label={`Category Name ${index + 1}`}
                value={category.categoryName}
                onChange={(e) => handleCategoryNameChange(index, e.target.value)}
                sx={{ flex: 6 }}
              />
              <TextField
                label={`Budget Amount ${index + 1}`}
                type="number"
                value={category.budgetAmount}
                onChange={(e) => handleCategoryAmountChange(index, Number(e.target.value))}
                sx={{ flex: 4 }}
              />
              <IconButton
                onClick={() => handleDeleteCategory(index)}
                aria-label="delete"
                sx={{ flex: 2 }}
              >
                <DeleteIcon />
              </IconButton>
            </Grid>
          ))}
          {categories.length < 10 && (
            <Box mt={2}>
              <Button variant="outlined" onClick={handleAddCategory}>
              Add Category
              </Button>
            </Box>
          )}
        </Box>

        <Box mt={3}>
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={!hasChanges || loading}>
            Save Budget
          </Button>
        </Box>

        {error && (
          <Typography color="error" mt={2}>
            {error}
          </Typography>
        )}

        {success && (
          <Typography color="primary" mt={2}>
            {success}
          </Typography>
        )}
      </Box>
    </>
  );
}
