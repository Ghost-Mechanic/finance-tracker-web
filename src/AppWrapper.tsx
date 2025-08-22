import { ThemeProvider, CssBaseline } from '@mui/material';

import App from './App';
import { muiTheme } from './theme';

function AppWrapper() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

export default AppWrapper;
