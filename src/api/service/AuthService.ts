import type { LoginDto } from '../dto/LoginDto';
import type { RegisterDto } from '../dto/RegisterDto';
import type { LoginSuccessResponse, LoginErrorResponse } from '../response/LoginResponse';
import type { RegisterResponse } from '../response/RegisterResponse';

const API_URL = 'http://localhost:8080/api/auth'; 

export const authService = {
  register: async (data: RegisterDto): Promise<RegisterResponse> => {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response.json();
  },

  login: async (data: LoginDto): Promise<LoginSuccessResponse | LoginErrorResponse> => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return response.json() as Promise<LoginSuccessResponse>;
    } else {
      return response.json() as Promise<LoginErrorResponse>;
    }
  },
};
