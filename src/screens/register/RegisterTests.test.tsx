import { screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, vi, expect, beforeEach } from 'vitest';

import { render } from '../../testUtils';

import Register from './Register';
import * as useRegister from './useRegister';

// Import the custom render function from your test-utils file

// --- Mock useRegister hook ---
vi.mock('../src/screens/register/useRegister', () => ({
  useRegister: vi.fn(),
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

vi.mock('./useRegister', () => ({
  useRegister: () => ({
    data: { username: '', email: '', password: '', confirmPassword: '' },
    showPassword: false,
    showConfirmPassword: false,
    loading: false,
    error: '',
    success: false,
    handleClickShowPassword: vi.fn(),
    handleClickShowConfirmPassword: vi.fn(),
    handleMouseDownPassword: vi.fn(),
    handleMouseDownConfirmPassword: vi.fn(),
    handleInputChange: vi.fn((e: React.ChangeEvent<HTMLInputElement>) => { 
      e.preventDefault();
    }),
    handleSubmit: mockHandleSubmit,
  }),
}));

// --- Default mock values for useRegister ---
const mockUseRegister = {
  data: { username: '', email: '', password: '', confirmPassword: '' },
  showPassword: false,
  showConfirmPassword: false,
  loading: false,
  error: '',
  success: false,
  handleClickShowPassword: vi.fn(),
  handleClickShowConfirmPassword: vi.fn(),
  handleMouseDownPassword: vi.fn(),
  handleMouseDownConfirmPassword: vi.fn(),
  handleInputChange: vi.fn((e: React.ChangeEvent<HTMLInputElement>) => { 
    e.preventDefault();
  }),
  handleSubmit: vi.fn((e: React.FormEvent) => {
    e.preventDefault();
    return Promise.resolve();
  }),
};

// Helper function to render the Register component within a proper routing context
const renderRegisterComponent = () => {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<Register />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // The 'useRegister as Mock' cast is fine, but the underlying 'useRegister' needs to be the actual mock.
    // The path corrections below should resolve the 'not a function' error.
    vi.spyOn(useRegister, 'useRegister').mockReturnValue(mockUseRegister);
  });

  it('renders all form fields and register button', () => {
    renderRegisterComponent();

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    
    const passwordInput = screen.getByTestId('password-input');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const confirmPasswordInput = screen.getByTestId('confirm-password-input');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('calls handleInputChange when typing in fields', () => {
    renderRegisterComponent();

    const emailField = screen.getByLabelText(/email address/i);
    fireEvent.change(emailField, { target: { name: 'email', value: 'test@example.com' } });
    expect(mockUseRegister.handleInputChange).toHaveBeenCalled();
  });

  it('toggles password visibility when icon clicked', async () => {
    const { rerender } = renderRegisterComponent();

    const toggleBtn = screen.getByLabelText(/show password/i);
    fireEvent.click(toggleBtn);
    expect(mockUseRegister.handleClickShowPassword).toHaveBeenCalledOnce();

    // Simulate the state change after click for the input type to change
    vi.spyOn(useRegister, 'useRegister').mockReturnValue({
      ...mockUseRegister,
      showPassword: true,
    });

    rerender(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    const passwordInput = screen.getByTestId('password-input');
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('displays error message if error exists', () => {
    vi.spyOn(useRegister, 'useRegister').mockReturnValue({
      ...mockUseRegister,
      error: 'Something went wrong',
    });

    renderRegisterComponent();
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('displays success message and navigates after timeout', async () => {
    vi.useFakeTimers();

    vi.spyOn(useRegister, 'useRegister').mockReturnValue({
      ...mockUseRegister,
      success: true,
    });

    renderRegisterComponent();

    expect(screen.getByText(/registration successful/i)).toBeInTheDocument();

    // Run all pending timers
    vi.runAllTimers();

    expect(mockNavigate).toHaveBeenCalledWith('/login');

    vi.useRealTimers();
  });

  it('submits the form', async () => {
    const handleSubmitSpy = vi.fn(async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
    });
  
    vi.spyOn(useRegister, 'useRegister').mockReturnValue({
      ...mockUseRegister,
      handleSubmit: handleSubmitSpy,
    });
  
    renderRegisterComponent();
  
    // Trigger submit explicitly
    const form = screen.getByTestId('register-form');
    fireEvent.submit(form);
  
    expect(handleSubmitSpy).toHaveBeenCalled();
  });  

  it('renders loading overlay when loading is true', () => {
    vi.spyOn(useRegister, 'useRegister').mockReturnValue({
      ...mockUseRegister,
      loading: true,
    });

    renderRegisterComponent();

    // Assuming your LoadingOverlay has data-testid="loading-overlay"
    expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
  });
});
