import { AppBar, Box, Container, Tab, Tabs, Toolbar, Typography } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}
  
export default function Dashboard() {
  const [tab, setTab] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };
  
  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Left side: App name */}
          <Typography variant="h6" noWrap sx={{ mr: 4 }}>
            Ledger
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
              onChange={(newValue) => {
                if (newValue) {
                  if (newValue.isBefore(dayjs('2020-01-01'))) {
                    setSelectedDate(dayjs('2020-01-01'));
                  } else if (newValue.isAfter(dayjs('2026-12-31'))) {
                    setSelectedDate(dayjs('2026-12-31'));
                  } else {
                    setSelectedDate(newValue);
                  }
                }
              }}
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
          <Typography variant="h5">Budget Page</Typography>
          <Typography>
            Set monthly budgets and categories here. (Selected Month:{' '}
            {selectedDate.format('MMMM YYYY')})
          </Typography>
        </TabPanel>
  
        <TabPanel value={tab} index={1}>
          <Typography variant="h5">Transactions Page</Typography>
          <Typography>
            View and add transactions for {selectedDate.format('MMMM D, YYYY')}.
          </Typography>
        </TabPanel>
      </Container>
    </>
  );
}
