// test-utils.tsx

import { ThemeProvider, CssBaseline } from '@mui/material';
import { render } from '@testing-library/react';

import { muiTheme } from '../src/theme';

import type { RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

/**
 * Renders a React component with the custom TestWrapper, automatically providing
 * the Material-UI ThemeProvider and CssBaseline. This streamlines testing
 * by ensuring components are rendered in the correct thematic context.
 *
 * @param {ReactElement} ui - The React component to render.
 * @param {RenderOptions} [options] - Optional rendering options for @testing-library/react.
 * @returns {RenderResult} An object containing utilities for querying the rendered component.
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: TestWrapper, ...options });

// Re-export everything from @testing-library/react for convenience,
// and export the custom render method as default.
export { customRender as render };
