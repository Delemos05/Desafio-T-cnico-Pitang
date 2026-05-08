import axios from 'axios';

class ApiService {
  private api: any;
  private isRefreshing: boolean;
  private failedQueue: any[];

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3333',
      timeout: 30000,
    });
    
    // Flag para prevenir múltiplos refreshes simultâneos
    this.isRefreshing = false;
    this.failedQueue = [];

    this.api.interceptors.request.use(
      (config: any) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        const originalRequest = error.config;
        
        // Retry em caso de erro de rede (limitado a 1 tentativa para evitar loops)
        if (!error.response && !originalRequest._retry && originalRequest._retryCount !== 1) {
          originalRequest._retry = true;
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
          
          if (originalRequest._retryCount <= 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            return this.api(originalRequest);
          }
        }
        
        if (error.response?.status === 401) {
          // Tenta fazer refresh token
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken && !originalRequest._retry) {
            return this.refreshTokenAndRetry(originalRequest);
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

  async refreshTokenAndRetry(config: any) {
    // Se já está fazendo refresh, adiciona à fila
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject, config });
      });
    }

    this.isRefreshing = true;
    
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await this.api.post('/auth/refresh', { refreshToken });
      const newTokens = response.data.data;
      
      // Atualiza tokens no localStorage
      localStorage.setItem('token', newTokens.accessToken);
      localStorage.setItem('refreshToken', newTokens.refreshToken);
      
      // Processa fila de requisições pendentes
      this.failedQueue.forEach(({ resolve, config: queuedConfig }) => {
        queuedConfig.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        resolve(this.api(queuedConfig));
      });
      this.failedQueue = [];
      
      // Atualiza header e retry da requisição original
      config.headers.Authorization = `Bearer ${newTokens.accessToken}`;
      config._retry = true;
      return this.api(config);
    } catch (error) {
      // Rejeita todas as requisições pendentes
      this.failedQueue.forEach(({ reject }) => reject(error));
      this.failedQueue = [];
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    const data = response.data.data;
    
    return data;
  }

  async refreshToken(refreshToken: string) {
    const response = await this.api.post('/auth/refresh', { refreshToken });
    return response.data.data;
  }

  async logout(refreshToken: string) {
    const response = await this.api.post('/auth/logout', { refreshToken });
    return response.data.data;
  }

  async createSolicitation(data: any) {
    const response = await this.api.post('/solicitations', data);
    return response.data;
  }

  async updateSolicitation(id: string, data: any) {
    const response = await this.api.put(`/solicitations/${id}`, data);
    return response.data;
  }

  async getSolicitations(page = 1, limit = 50, filters: Record<string, any> = {}) {
    const params: Record<string, any> = {};
    
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

  async getSolicitation(id: string) {
    const response = await this.api.get(`/solicitations/${id}`);
    return response.data.data;
  }

  async submitSolicitation(id: string) {
    const response = await this.api.post(`/solicitations/${id}/submit`);
    return response.data;
  }

  async approveSolicitation(id: string, observation?: string) {
    const response = await this.api.post(`/solicitations/${id}/approve`, { observation });
    return response.data;
  }

  async rejectSolicitation(id: string, observation?: string) {
    const response = await this.api.post(`/solicitations/${id}/reject`, { observation });
    return response.data;
  }

  async paySolicitation(id: string) {
    const response = await this.api.post(`/solicitations/${id}/pay`);
    return response.data;
  }

  async cancelSolicitation(id: string) {
    const response = await this.api.post(`/solicitations/${id}/cancel`);
    return response.data;
  }

  async getSolicitationHistory(id: string) {
    const response = await this.api.get(`/solicitations/${id}/history`);
    return response.data.data;
  }

  async getCategories() {
    const response = await this.api.get('/categories');
    return response.data.data;
  }

  async createCategory(data: any) {
    const response = await this.api.post('/categories', data);
    return response.data.data;
  }

  async updateCategory(id: string, data: any) {
    const response = await this.api.put(`/categories/${id}`, data);
    return response.data.data;
  }

  async deleteCategory(id: string) {
    const response = await this.api.delete(`/categories/${id}`);
    return response.data.data;
  }
}

const apiService = new ApiService();
export default apiService;
