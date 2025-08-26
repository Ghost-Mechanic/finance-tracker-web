// tests/useLogin.test.ts
import { act, renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { authService } from '../../api/service/auth-service/AuthService';

import { useLogin } from './useLogin';

import type React from 'react';

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
    const { result } = renderHook(() => useLogin());

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
    const { result } = renderHook(() => useLogin());

    act(() => result.current.handleClickShowPassword());
    expect(result.current.showPassword).toBe(true);
  });

  it('updates data on input change', () => {
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.handleInputChange({
        target: { name: 'email', value: 'testuser' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.data.email).toBe('testuser');
  });

  it('sets success on successful login', async () => {
    vi.spyOn(authService, 'login').mockResolvedValue({ token: 'SUCCESS' });

    const { result } = renderHook(() => useLogin());

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

    const { result } = renderHook(() => useLogin());

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
