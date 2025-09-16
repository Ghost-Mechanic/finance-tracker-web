// AuthProvider.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';

import { AuthProvider } from './AuthProvider';
import { useAuth } from './useAuth';

const TestComponent = () => {
  const { user, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="user">{user ? user.userId : 'null'}</div>
      <button onClick={() => login('123')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads user from localStorage', () => {
    localStorage.setItem('user', JSON.stringify({ userId: 'abc' }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('abc');
  });

  it('logs in and saves to localStorage', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    screen.getByText('Login').click();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('123');
    });

    expect(localStorage.getItem('user')).toBe(JSON.stringify({ userId: '123' }));
  });

  it('logs out and clears localStorage', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    screen.getByText('Login').click();
    screen.getByText('Logout').click();
    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(localStorage.getItem('user')).toBeNull();
  });
});
