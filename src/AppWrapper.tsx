import { ThemeProvider, CssBaseline } from '@mui/material';

import App from './App';
import { AuthProvider } from './context/AuthProvider';
import { muiTheme } from './theme';

function AppWrapper() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default AppWrapper;
