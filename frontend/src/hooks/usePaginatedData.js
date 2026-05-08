import { useState, useEffect, useCallback, useRef } from 'react';
import apiService from '../services/api';

export function usePaginatedData(apiCall, initialPage = 1, initialLimit = 10, initialFilters = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [filters, setFilters] = useState(initialFilters);
  const isLoadingRef = useRef(false);

  const loadData = useCallback(async (page, limit, currentFilters) => {
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
      setError(err.response?.data?.message || 'Erro ao carregar dados');
      setData([]);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [apiCall]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadData(newPage, pagination.limit);
    }
  }, [loadData, pagination.limit, pagination.totalPages]);

  const handleLimitChange = useCallback((newLimit) => {
    loadData(1, newLimit);
  }, [loadData]);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    // Reseta para primeira página quando filtros mudam
    loadData(1, pagination.limit, newFilters);
  }, [loadData, pagination.limit]);

  const refresh = useCallback(() => {
    loadData(pagination.page, pagination.limit, filters);
  }, [loadData, pagination.page, pagination.limit, filters]);

  // Carrega dados iniciais
  useEffect(() => {
    loadData(pagination.page, pagination.limit, filters);
  }, [apiCall]); // Só depende de apiCall para evitar loops

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
