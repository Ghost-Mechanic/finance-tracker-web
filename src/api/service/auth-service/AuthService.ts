import type { LoginDto } from '../../dto/LoginDto';
import type { RegisterDto } from '../../dto/RegisterDto';
import type { LoginSuccessResponse, LoginErrorResponse } from '../../response/LoginResponse';
import type { RegisterResponse } from '../../response/RegisterResponse';

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;
//const API_URL = 'http://localhost:8080/api/auth'; 

// service for authentication, provides endpoints for registration and login
export const authService = {
  // registration takes in a RegisterDto and returns a RegisterResponse, the frontend hook handles
  // the error handling
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

  // login takes in LoginDto and returns either a LoginSuccessReesponse with a token or a LoginErrorResponse
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
