import api from '../lib/api';
import { LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '../types';

export const AuthService = {
  async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/login', request);
    return response.data.data;
  },

  async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/register', request);
    return response.data.data;
  },
};
