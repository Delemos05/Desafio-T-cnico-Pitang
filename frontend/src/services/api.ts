import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, AuthResponse, User, Solicitation, Category, History } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3333';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.api.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password,
    });
    return response.data.data!;
  }

  async createUser(userData: {
    email: string;
    name: string;
    password: string;
    role: string;
  }): Promise<User> {
    const response = await this.api.post<ApiResponse<User>>('/auth/users', userData);
    return response.data.data!;
  }

  async getProfile(): Promise<User> {
    const response = await this.api.get<ApiResponse<User>>('/auth/profile');
    return response.data.data!;
  }

  async getSolicitations(): Promise<Solicitation[]> {
    const response = await this.api.get<ApiResponse<Solicitation[]>>('/reimbursements');
    return response.data.data!;
  }

  async getSolicitation(id: string): Promise<Solicitation> {
    const response = await this.api.get<ApiResponse<Solicitation>>(`/reimbursements/${id}`);
    return response.data.data!;
  }

  async createSolicitation(data: {
    title: string;
    description: string;
    amount: number;
    date: string;
    categoryId: string;
    justification?: string;
  }): Promise<Solicitation> {
    const response = await this.api.post<ApiResponse<Solicitation>>('/reimbursements', data);
    return response.data.data!;
  }

  async updateSolicitation(id: string, data: Partial<Solicitation>): Promise<Solicitation> {
    const response = await this.api.put<ApiResponse<Solicitation>>(`/reimbursements/${id}`, data);
    return response.data.data!;
  }

  async submitSolicitation(id: string): Promise<Solicitation> {
    const response = await this.api.post<ApiResponse<Solicitation>>(`/reimbursements/${id}/submit`);
    return response.data.data!;
  }

  async approveSolicitation(id: string, observation: string): Promise<Solicitation> {
    const response = await this.api.post<ApiResponse<Solicitation>>(`/reimbursements/${id}/approve`, {
      observation,
    });
    return response.data.data!;
  }

  async rejectSolicitation(id: string, observation: string): Promise<Solicitation> {
    const response = await this.api.post<ApiResponse<Solicitation>>(`/reimbursements/${id}/reject`, {
      observation,
    });
    return response.data.data!;
  }

  async paySolicitation(id: string): Promise<Solicitation> {
    const response = await this.api.post<ApiResponse<Solicitation>>(`/reimbursements/${id}/pay`);
    return response.data.data!;
  }

  async cancelSolicitation(id: string): Promise<Solicitation> {
    const response = await this.api.post<ApiResponse<Solicitation>>(`/reimbursements/${id}/cancel`);
    return response.data.data!;
  }

  async getSolicitationHistory(id: string): Promise<History[]> {
    const response = await this.api.get<ApiResponse<History[]>>(`/reimbursements/${id}/history`);
    return response.data.data!;
  }

  async getCategories(): Promise<Category[]> {
    const response = await this.api.get<ApiResponse<Category[]>>('/categories');
    return response.data.data!;
  }

  async createCategory(data: {
    name: string;
    description?: string;
  }): Promise<Category> {
    const response = await this.api.post<ApiResponse<Category>>('/categories', data);
    return response.data.data!;
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    const response = await this.api.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return response.data.data!;
  }

  async deleteCategory(id: string): Promise<void> {
    await this.api.delete(`/categories/${id}`);
  }
}

export const apiService = new ApiService();
