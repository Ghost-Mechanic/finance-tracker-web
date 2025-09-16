// useAuth.test.tsx
import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('throws error if used outside AuthProvider', () => {
    // Wrap renderHook in a function so Vitest can catch the throw
    const renderOutside = () => renderHook(() => useAuth());
  
    expect(renderOutside).toThrowError('useAuth must be used within an AuthProvider');
  });
});
