import { createContext } from 'react';

export type User = {
  userId: string;
} | null;

export interface AuthContextType {
  user: User;
  login: (userId: string) => void;
  logout: () => void;
}

// Context is created here, no provider yet
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
