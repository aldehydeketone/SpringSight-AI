import api from '../lib/api';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../types';

export const AuthService = {
  async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/login', request);
    return response.data.data;
  },

  async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/register', request);
    return response.data.data;
  },

  async verifyEmail(token: string): Promise<string> {
    const response = await api.get<ApiResponse<void>>('/api/auth/verify-email', {
      params: { token },
    });
    return response.data.message;
  },

  async forgotPassword(request: ForgotPasswordRequest): Promise<string> {
    const response = await api.post<ApiResponse<void>>('/api/auth/forgot-password', request);
    return response.data.message;
  },

  async resetPassword(request: ResetPasswordRequest): Promise<string> {
    const response = await api.post<ApiResponse<void>>('/api/auth/reset-password', request);
    return response.data.message;
  },
};
