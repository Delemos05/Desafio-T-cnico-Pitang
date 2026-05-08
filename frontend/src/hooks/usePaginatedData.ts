import { useState, useEffect, useCallback, useRef } from 'react';
import apiService from '../services/api';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface UsePaginatedDataReturn {
  data: any[];
  loading: boolean;
  error: string;
  pagination: PaginationState;
  filters: Record<string, any>;
  handlePageChange: (newPage: number) => void;
  handleLimitChange: (newLimit: number) => void;
  handleFiltersChange: (newFilters: Record<string, any>) => void;
  refresh: () => void;
  loadData: (page: number, limit: number, currentFilters: Record<string, any>) => Promise<void>;
}

export function usePaginatedData(
  apiCall: (page: number, limit: number, filters: Record<string, any>) => Promise<any>,
  initialPage = 1,
  initialLimit = 10,
  initialFilters: Record<string, any> = {}
): UsePaginatedDataReturn {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [filters, setFilters] = useState(initialFilters);
  const isLoadingRef = useRef(false);

  const loadData = useCallback(async (page: number, limit: number, currentFilters: Record<string, any>) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await apiCall(page, limit, currentFilters);
      
      // Verifica se o resultado tem paginação ou é array direto (compatibilidade)
      if (result.data && result.pagination) {
        // Formato paginado
        setData(result.data);
        setPagination(result.pagination);
      } else {
        // Formato array direto (sem paginação)
        setData(Array.isArray(result) ? result : []);
        setPagination({
          page: 1,
          limit: result.length || 0,
          total: result.length || 0,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        });
      }
    } catch (err) {
      const error = err as any;
      setError(error.response?.data?.message || 'Erro ao carregar dados');
      setData([]);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [apiCall]);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadData(newPage, pagination.limit, filters);
    }
  }, [loadData, pagination.limit, pagination.totalPages, filters]);

  const handleLimitChange = useCallback((newLimit: number) => {
    loadData(1, newLimit, filters);
  }, [loadData, filters]);

  const handleFiltersChange = useCallback((newFilters: Record<string, any>) => {
    setFilters(prevFilters => {
      // Só atualiza se os filtros realmente mudaram
      if (JSON.stringify(prevFilters) !== JSON.stringify(newFilters)) {
        // Reseta para primeira página quando filtros mudam
        setTimeout(() => loadData(1, pagination.limit, newFilters), 0);
        return newFilters;
      }
      return prevFilters;
    });
  }, [loadData, pagination.limit]);

  const refresh = useCallback(() => {
    loadData(pagination.page, pagination.limit, filters);
  }, [loadData, pagination.page, pagination.limit, filters]);

  // Carrega dados iniciais apenas uma vez
  useEffect(() => {
    loadData(initialPage, initialLimit, initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vazio - executa apenas no mount

  return {
    data,
    loading,
    error,
    pagination,
    filters,
    handlePageChange,
    handleLimitChange,
    handleFiltersChange,
    refresh,
    loadData
  };
}
