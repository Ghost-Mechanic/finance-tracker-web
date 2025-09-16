// tests/useLogin.test.ts
import { ThemeProvider, CssBaseline } from '@mui/material';
import { act, renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { authService } from '../../api/service/auth-service/AuthService';
import { AuthProvider } from '../../context/AuthProvider';
import { muiTheme } from '../../theme';

import { useLogin } from './useLogin';

import type { ReactNode } from 'react';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider theme={muiTheme}>
    <CssBaseline />
    <AuthProvider>{children}</AuthProvider>
  </ThemeProvider>
);

vi.mock('../../src/api/service/auth-service/AuthService', () => ({
  authService: {
    login: vi.fn(),
  },
}));

describe('useLogin hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useLogin(), { wrapper: Wrapper });

    expect(result.current.data).toEqual({
      email: '',
      password: '',
    });
    expect(result.current.showPassword).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('');
    expect(result.current.success).toBe(false);
  });

  it('toggles password visibility', () => {
    const { result } = renderHook(() => useLogin(), { wrapper: Wrapper });

    act(() => result.current.handleClickShowPassword());
    expect(result.current.showPassword).toBe(true);
  });

  it('updates data on input change', () => {
    const { result } = renderHook(() => useLogin(), { wrapper: Wrapper });

    act(() => {
      result.current.handleInputChange({
        target: { name: 'email', value: 'testuser' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.data.email).toBe('testuser');
  });

  it('sets success on successful login', async () => {
    const fakeJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMifQ.signature';
    vi.spyOn(authService, 'login').mockResolvedValue({ token: fakeJwt });

    const { result } = renderHook(() => useLogin(), { wrapper: Wrapper });

    act(() => {
      result.current.handleInputChange({
        target: { name: 'password', value: 'Password1!' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    const fakeEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;
        
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.success).toBe(true);
    expect(result.current.error).toBe('');
  });

  it('shows username taken error', async () => {
    vi.spyOn(authService, 'login').mockResolvedValue({ error: 'invalid' });

    const { result } = renderHook(() => useLogin(), { wrapper: Wrapper });

    act(() => {
      result.current.handleInputChange({
        target: { name: 'password', value: 'Password1!' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    const fakeEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;
          
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.error).toBe('Invalid credentials');
  });

});
