// src/setupTests.ts

// Add custom jest-dom matchers (toBeInTheDocument, toHaveTextContent, etc.)
import '@testing-library/jest-dom';

// (Optional) Extend globals (if you want to shorten imports)
import { cleanup } from '@testing-library/react';
import { expect, afterEach } from 'vitest';

// Automatically unmount and cleanup DOM after each test
afterEach(() => {
  cleanup();
});

// (Optional) Add custom matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor}-${ceiling}`,
        pass: true,
      };
    }
    return {
      message: () => `expected ${received} to be within range ${floor}-${ceiling}`,
      pass: false,
    };
  },
});
