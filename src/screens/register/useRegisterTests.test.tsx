// tests/useRegister.test.ts
import { act, renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { authService } from '../../api/service/auth-service/AuthService';

import { useRegister } from './useRegister';

import type React from 'react';

vi.mock('../../src/api/service/auth-service/AuthService', () => ({
  authService: {
    register: vi.fn(),
  },
}));

describe('useRegister hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useRegister());

    expect(result.current.data).toEqual({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    expect(result.current.showPassword).toBe(false);
    expect(result.current.showConfirmPassword).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('');
    expect(result.current.success).toBe(false);
  });

  it('toggles password visibility', () => {
    const { result } = renderHook(() => useRegister());

    act(() => result.current.handleClickShowPassword());
    expect(result.current.showPassword).toBe(true);

    act(() => result.current.handleClickShowConfirmPassword());
    expect(result.current.showConfirmPassword).toBe(true);
  });

  it('updates data on input change', () => {
    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.handleInputChange({
        target: { name: 'username', value: 'testuser' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.data.username).toBe('testuser');
  });

  it('shows error if passwords do not match', async () => {
    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.handleInputChange({
        target: { name: 'password', value: 'Password1!' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleInputChange({
        target: { name: 'confirmPassword', value: 'NotMatching1!' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    const fakeEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;
      
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.error).toBe('Passwords do not match');
    expect(result.current.loading).toBe(false);
    expect(result.current.success).toBe(false);
  });

  it('shows error if passwords are less than 8 characters', async () => {
    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.handleInputChange({
        target: { name: 'password', value: 'Passwor' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleInputChange({
        target: { name: 'confirmPassword', value: 'Passwor' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    const fakeEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;
      
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.error).toBe('Password must be at least 8 characters long');
    expect(result.current.loading).toBe(false);
    expect(result.current.success).toBe(false);
  });

  it('shows error if passwords do not contain a lowercase letter', async () => {
    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.handleInputChange({
        target: { name: 'password', value: 'PASSWORD' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleInputChange({
        target: { name: 'confirmPassword', value: 'PASSWORD' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    const fakeEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;
      
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.error).toBe('Password must contain at least one lowercase letter');
    expect(result.current.loading).toBe(false);
    expect(result.current.success).toBe(false);
  });

  it('shows error if passwords do not contain an uppercase letter', async () => {
    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.handleInputChange({
        target: { name: 'password', value: 'password' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleInputChange({
        target: { name: 'confirmPassword', value: 'password' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    const fakeEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;
      
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.error).toBe('Password must contain at least one uppercase letter');
    expect(result.current.loading).toBe(false);
    expect(result.current.success).toBe(false);
  });

  it('shows error if passwords do not contain a number', async () => {
    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.handleInputChange({
        target: { name: 'password', value: 'passwordD' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleInputChange({
        target: { name: 'confirmPassword', value: 'passwordD' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    const fakeEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;
      
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.error).toBe('Password must contain at least one number');
    expect(result.current.loading).toBe(false);
    expect(result.current.success).toBe(false);
  });

  it('sets success on successful registration', async () => {
    vi.spyOn(authService, 'register').mockResolvedValue({ status: 'SUCCESS' });

    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.handleInputChange({
        target: { name: 'password', value: 'Password1!' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleInputChange({
        target: { name: 'confirmPassword', value: 'Password1!' },
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
    vi.spyOn(authService, 'register').mockResolvedValue({ status: 'USERNAME_TAKEN' });

    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.handleInputChange({
        target: { name: 'password', value: 'Password1!' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleInputChange({
        target: { name: 'confirmPassword', value: 'Password1!' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    const fakeEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;
          
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.error).toBe('Username already in use');
  });

  it('shows email taken error', async () => {
    vi.spyOn(authService, 'register').mockResolvedValue({ status: 'EMAIL_TAKEN' });

    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.handleInputChange({
        target: { name: 'password', value: 'Password1!' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleInputChange({
        target: { name: 'confirmPassword', value: 'Password1!' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    const fakeEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;
          
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.error).toBe('Email already in use');
  });

  it('handles validationErrors from server', async () => {
    vi.spyOn(authService, 'register').mockResolvedValue({ 
      status: 'VALIDATION_ERROR',
      validationErrors: { email: 'Invalid email format' }
    });

    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.handleInputChange({
        target: { name: 'password', value: 'Password1!' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleInputChange({
        target: { name: 'confirmPassword', value: 'Password1!' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    const fakeEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;
      
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.error).toBe('Invalid email format');
  });

  it('handles unexpected exception', async () => {
    vi.spyOn(authService, 'register').mockResolvedValue({ status: 'ERROR' });

    const { result } = renderHook(() => useRegister());

    act(() => {
      result.current.handleInputChange({
        target: { name: 'password', value: 'Password1!' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleInputChange({
        target: { name: 'confirmPassword', value: 'Password1!' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    const fakeEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>;
          
    await act(async () => {
      await result.current.handleSubmit(fakeEvent);
    });

    expect(result.current.error).toBe('An unknown error occurred. Please try again');
    expect(result.current.success).toBe(false);
  });
});
