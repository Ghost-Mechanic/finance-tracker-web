import { useState } from 'react';
import React from 'react';

import { authService } from '../../api/service/auth-service/AuthService';

import type { RegisterDto } from '../../api/dto/RegisterDto';

interface useRegister {
    data: RegisterDto;
    showPassword: boolean;
    showConfirmPassword: boolean;
    loading: boolean;
    error: string;
    success: boolean;
    handleClickShowPassword: () => void;
    handleClickShowConfirmPassword: () => void;
    handleMouseDownPassword: (event: React.MouseEvent<HTMLButtonElement>) => void;
    handleMouseDownConfirmPassword: (event: React.MouseEvent<HTMLButtonElement>) => void;
    handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
};

export const useRegister = (): useRegister => {
  // initialize with empty dto
  const [data, setData] = useState<RegisterDto>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleMouseDownConfirmPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // name of field is same as name in RegisterDto
    const { name, value } = event.target;
    setData(prevState => ({ ...prevState, [name]: value }));
  };

  // returns an error message for validation error
  const validatePassword = (password: string, confirmPassword: string): string | null => {
    // check that passwords match
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }

    // Check password length
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    // Check for at least 1 lowercase letter
    const lowercaseRegex = /[a-z]/;
    if (!lowercaseRegex.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }

    // Check for at least 1 uppercase letter
    const uppercaseRegex = /[A-Z]/;
    if (!uppercaseRegex.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }

    // Check for at least 1 number
    const numberRegex = /[0-9]/;
    if (!numberRegex.test(password)) {
      return 'Password must contain at least one number';
    }

    // Check for at least 1 special character
    const specialCharRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;
    if (!specialCharRegex.test(password)) {
      return 'Password must contain at least one special character.';
    }

    // If all checks pass, return null (indicating no error)
    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const validationError = validatePassword(data.password, data.confirmPassword);

    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const response = await authService.register(data);

      if (response.status == 'SUCCESS') {
        setSuccess(true);
      } else if (response.validationErrors) {

        // only display first error from validation errors
        const firstError = Object.values(response.validationErrors)[0];

        if (firstError) {
          setError(firstError);
        }
      } else {
        // display appropriate error based on status
        switch (response.status) {
        case 'USERNAME_TAKEN':
          setError('Username already in use');
          break;
        case 'EMAIL_TAKEN':
          setError('Email already in use');
          break;
        case 'INVALID_PASSWORD':
          setError('Invalid password');
          break;
        default:
          setError('An unknown error occurred. Please try again');
        }
      }
    } catch (err) {
      // handle server errors
      setError('An unexpected error occurred. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    showPassword,
    showConfirmPassword,
    loading,
    error,
    success,
    handleClickShowPassword,
    handleClickShowConfirmPassword,
    handleMouseDownPassword,
    handleMouseDownConfirmPassword,
    handleInputChange,
    handleSubmit,
  };
};
