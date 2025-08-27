import { useState } from 'react';
import React from 'react';

import { authService } from '../../api/service/auth-service/AuthService';

import type { LoginDto } from '../../api/dto/LoginDto';

interface useLogin {
    data: LoginDto;
    showPassword: boolean;
    loading: boolean;
    error: string;
    success: boolean;
    handleClickShowPassword: () => void;
    handleMouseDownPassword: (event: React.MouseEvent<HTMLButtonElement>) => void;
    handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
};

export const useLogin = (): useLogin => {
  // initialize with empty dto
  const [data, setData] = useState<LoginDto>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // name of field is same as name in LoginDto
    const { name, value } = event.target;
    setData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      data.email = data.email.toLowerCase();
      const response = await authService.login(data);
      
      if ('token' in response) {
        // Successful login
        localStorage.setItem('authToken', response.token); // store token
        setSuccess(true);
      } else if ('error' in response) {
        // Failed login
        setError('Invalid credentials');
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
    loading,
    error,
    success,
    handleClickShowPassword,
    handleMouseDownPassword,
    handleInputChange,
    handleSubmit,
  };
};
