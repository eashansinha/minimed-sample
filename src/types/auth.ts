export interface User {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'healthcare_provider';
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}
