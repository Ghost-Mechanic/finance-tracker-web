// ProtectedRoute.test.tsx
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

import { AuthContext } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';

const renderWithRouter = (ui: React.ReactNode, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  it('redirects to /login if no user', () => {
    renderWithRouter(
      <AuthContext.Provider value={{ user: null, login: vi.fn(), logout: vi.fn() }}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><div>Private</div></ProtectedRoute>} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children if user exists', () => {
    renderWithRouter(
      <AuthContext.Provider value={{ user: { userId: '123' }, login: vi.fn(), logout: vi.fn() }}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><div>Private</div></ProtectedRoute>} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Private')).toBeInTheDocument();
  });
});
