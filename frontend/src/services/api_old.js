import axios from 'axios';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3333',
      timeout: 10000,
    });

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
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Tenta fazer refresh token
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken && !error.config._retry) {
            return this.refreshTokenAndRetry(error.config);
          }
          
          // Se não tiver refresh token ou já tentou, faz logout
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async refreshTokenAndRetry(config) {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await this.api.post('/auth/refresh', { refreshToken });
    const newToken = response.data.data.token;
    localStorage.setItem('token', newToken);
    config.headers.Authorization = `Bearer ${newToken}`;
    config._retry = true;
    return this.api(config);
  }

  async login(email, password) {
    const response = await this.api.post('/auth/login', { email, password });
    const token = response.data.data.token;
    const refreshToken = response.data.data.refreshToken;
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    return response.data.data;
  }

  async refreshToken(refreshToken) {
    const response = await this.api.post('/auth/refresh', { refreshToken });
    return response.data.data;
  }

  async logout(refreshToken) {
    const response = await this.api.post('/auth/logout', { refreshToken });
    return response.data.data;
  }

  async createSolicitation(data) {
    const response = await this.api.post('/solicitations', data);
    return response.data;
  }

  async updateSolicitation(id, data) {
    const response = await this.api.put(`/solicitations/${id}`, data);
    return response.data;
  }

  async getSolicitations(page = 1, limit = 50, filters = {}) {
    const params = {};
    
    // Parâmetros de paginação
    if (page !== 1) params.page = page;
    if (limit !== 50) params.limit = limit;
    
    // Parâmetros de filtros
    if (filters.status) params.status = filters.status;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.userId) params.userId = filters.userId;
    if (filters.search) params.search = filters.search;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;

    const response = await this.api.get('/solicitations', { params });
    
    // Verifica se tem paginação na resposta
    if (response.data.data && response.data.pagination) {
      return response.data; // Formato paginado
    } else {
      return response.data.data; // Formato array direto (compatibilidade)
    }
  }

  async getSolicitation(id) {
    const response = await this.api.get(`/solicitations/${id}`);
    return response.data.data;
  }

  async submitSolicitation(id) {
    const response = await this.api.post(`/solicitations/${id}/submit`);
    return response.data;
  }

  async approveSolicitation(id, observation) {
    const response = await this.api.post(`/solicitations/${id}/approve`, { observation });
    return response.data;
  }

  async rejectSolicitation(id, observation) {
    const response = await this.api.post(`/solicitations/${id}/reject`, { observation });
    return response.data;
  }

  async paySolicitation(id) {
    const response = await this.api.post(`/solicitations/${id}/pay`);
    return response.data;
  }

  async cancelSolicitation(id) {
    const response = await this.api.post(`/solicitations/${id}/cancel`);
    return response.data;
  }

  async getSolicitationHistory(id) {
    const response = await this.api.get(`/solicitations/${id}/history`);
    return response.data.data;
  }

  async getCategories() {
    const response = await this.api.get('/categories');
    return response.data.data;
  }

  async createCategory(data) {
    const response = await this.api.post('/categories', data);
    return response.data.data;
  }

  async updateCategory(id, data) {
    const response = await this.api.put(`/categories/${id}`, data);
    return response.data.data;
  }

  async deleteCategory(id) {
    const response = await this.api.delete(`/categories/${id}`);
    return response.data.data;
  }

  async getCategory(id) {
    const response = await this.api.get(`/categories/${id}`);
    return response.data.data;
  }
}

export const apiService = new ApiService();
