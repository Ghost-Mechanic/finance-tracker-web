import { AppBar, Box, Container, Tab, Tabs, Toolbar, Typography } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import Budgets from './budgets/Budgets';
import Transactions from './transactions/Transactions';
import { useDashboard } from './useDashboard';

interface TabPanelProps {
    children: React.ReactNode;
    value: number;
    index: number;
}
  
function TabPanel({ children, value, index }: TabPanelProps) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ p: 2 }}>{children}</Box>}</div>;
}
  
export default function Dashboard() {
  const {
    tab,
    selectedDate,
    selectedBudget,
    handleTransactionsChanged,
    budgetLeft,
    onBudgetSaved,
    handleTabChange,
    handleDateChange,
  } = useDashboard();
  
  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Left side: App name */}
          <Typography variant="h6" noWrap sx={{ mr: 4 }}>
            Budget Buddy
          </Typography>

          {/* Middle: Tabs */}
          <Tabs
            value={tab}
            onChange={handleTabChange}
            textColor="inherit"
            indicatorColor="secondary"
            sx={{ flexGrow: 1 }}
            centered
          >
            <Tab label="Budget" />
            <Tab label="Transactions" />
          </Tabs>
  
          {/* Right side: Global Date/Month Picker */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: {
                    borderRadius: 1,
                  },
                },
              }}
              minDate={dayjs('2020-01-01')}
              maxDate={dayjs('2026-12-31')}
            />
          </LocalizationProvider>
        </Toolbar>
      </AppBar>
  
      {/* Main Content Area */}
      <Container maxWidth="md">
        <TabPanel value={tab} index={0}>
          {/* Budget Tab */}
          {selectedBudget ? (
            <Budgets budget={selectedBudget} currentMonth={selectedDate.format('MMMM YYYY')} onBudgetSaved={onBudgetSaved} budgetLeft={budgetLeft} />
          ) : (
            <Budgets budget={null} currentMonth={selectedDate.format('MMMM YYYY')} onBudgetSaved={onBudgetSaved} budgetLeft={budgetLeft} />
          )}
        </TabPanel>
  
        <TabPanel value={tab} index={1}>
          {selectedBudget ? (
            <Transactions currentDate={selectedDate.format('MMMM DD, YYYY')} budget={selectedBudget} onTransactionsChanged={handleTransactionsChanged} />
          ) : (
            <Typography>No budget selected or created, so no transactions available.</Typography>
          )}
        </TabPanel>
      </Container>
    </>
  );
}
