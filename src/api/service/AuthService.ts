import type { RegisterDto } from "../dto/RegisterDto";
import type { RegisterResponse } from "../response/RegisterResponse";

const API_URL = "http://localhost:8080/api/auth"; 

export const authService = {
  register: async (data: RegisterDto): Promise<RegisterResponse> => {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return response.json();
  },
};
