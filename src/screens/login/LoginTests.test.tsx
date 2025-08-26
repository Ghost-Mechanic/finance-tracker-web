import { screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, vi, expect, beforeEach } from 'vitest';

import { render } from '../../testUtils';

import Login from './Login';
import * as useLogin from './useLogin';

// Import the custom render function from your test-utils file

// --- Mock useLogin hook ---
vi.mock('../src/screens/login/useLogin', () => ({
  useLogin: vi.fn(),
}));

// --- Mock react-router-dom's useNavigate safely ---
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockHandleSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());

vi.mock('./useLogin', () => ({
  useLogin: () => ({
    data: { email: '', password: '' },
    showPassword: false,
    loading: false,
    error: '',
    success: false,
    handleClickShowPassword: vi.fn(),
    handleMouseDownPassword: vi.fn(),
    handleInputChange: vi.fn((e: React.ChangeEvent<HTMLInputElement>) => { 
      e.preventDefault();
    }),
    handleSubmit: mockHandleSubmit,
  }),
}));

// --- Default mock values for useLogin ---
const mockUseLogin = {
  data: { email: '', password: '' },
  showPassword: false,
  loading: false,
  error: '',
  success: false,
  handleClickShowPassword: vi.fn(),
  handleMouseDownPassword: vi.fn(),
  handleInputChange: vi.fn((e: React.ChangeEvent<HTMLInputElement>) => { 
    e.preventDefault();
  }),
  handleSubmit: vi.fn((e: React.FormEvent) => {
    e.preventDefault();
    return Promise.resolve();
  }),
};

// Helper function to render the login component within a proper routing context
const renderloginComponent = () => {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // The 'useLogin as Mock' cast is fine, but the underlying 'useLogin' needs to be the actual mock.
    // The path corrections below should resolve the 'not a function' error.
    vi.spyOn(useLogin, 'useLogin').mockReturnValue(mockUseLogin);
  });

  it('renders all form fields and login button', () => {
    renderloginComponent();

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    
    const passwordInput = screen.getByTestId('password-input');
    expect(passwordInput).toHaveAttribute('type', 'password');

    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('calls handleInputChange when typing in fields', () => {
    renderloginComponent();

    const emailField = screen.getByLabelText(/email address/i);
    fireEvent.change(emailField, { target: { name: 'email', value: 'test@example.com' } });
    expect(mockUseLogin.handleInputChange).toHaveBeenCalled();
  });

  it('toggles password visibility when icon clicked', async () => {
    const { rerender } = renderloginComponent();

    const toggleBtn = screen.getByLabelText(/show password/i);
    fireEvent.click(toggleBtn);
    expect(mockUseLogin.handleClickShowPassword).toHaveBeenCalledOnce();

    // Simulate the state change after click for the input type to change
    vi.spyOn(useLogin, 'useLogin').mockReturnValue({
      ...mockUseLogin,
      showPassword: true,
    });

    rerender(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    const passwordInput = screen.getByTestId('password-input');
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('displays error message if error exists', () => {
    vi.spyOn(useLogin, 'useLogin').mockReturnValue({
      ...mockUseLogin,
      error: 'Something went wrong',
    });

    renderloginComponent();
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('displays success message and navigates after timeout', async () => {
    vi.useFakeTimers();

    vi.spyOn(useLogin, 'useLogin').mockReturnValue({
      ...mockUseLogin,
      success: true,
    });

    renderloginComponent();

    // Run all pending timers
    vi.runAllTimers();

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');

    vi.useRealTimers();
  });

  it('submits the form', async () => {
    const handleSubmitSpy = vi.fn(async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
    });
  
    vi.spyOn(useLogin, 'useLogin').mockReturnValue({
      ...mockUseLogin,
      handleSubmit: handleSubmitSpy,
    });
  
    renderloginComponent();
  
    // Trigger submit explicitly
    const form = screen.getByTestId('login-form');
    fireEvent.submit(form);
  
    expect(handleSubmitSpy).toHaveBeenCalled();
  });  

  it('renders loading overlay when loading is true', () => {
    vi.spyOn(useLogin, 'useLogin').mockReturnValue({
      ...mockUseLogin,
      loading: true,
    });

    renderloginComponent();

    // Assuming your LoadingOverlay has data-testid="loading-overlay"
    expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
  });
});
