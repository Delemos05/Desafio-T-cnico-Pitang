import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

export default function SolicitationFilters({ onFiltersChange, currentFilters }) {
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const { user, hasRole } = useAuth();

  useEffect(() => {
    if (!categoriesLoaded) {
      loadCategories();
      if (hasRole(['ADMIN', 'MANAGER'])) {
        loadUsers();
      }
    }
  }, [categoriesLoaded, hasRole]);

  const loadCategories = async () => {
    if (isLoading || categoriesLoaded) return;
    setIsLoading(true);
    try {
      const data = await apiService.getCategories();
      setCategories(Array.isArray(data) ? data : []);
      setCategoriesLoaded(true);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setCategories([]); // Define array vazio em caso de erro
      setCategoriesLoaded(true); // Marca como carregado mesmo com erro para evitar loops
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // TODO: Implementar endpoint de listagem de usuários
      // Por enquanto, usa dados mockados
      setUsers([
        { id: 'cmonhy7dg0003rrrp3ke3ypgh', name: 'Funcionário', email: 'employee@email.com' },
        { id: 'cmonhy7dc0001rrrpfty4jd3i', name: 'Gerente', email: 'manager@email.com' },
        { id: 'cmonhy7df0002rrrp6zl4dscw', name: 'Financeiro', email: 'finance@email.com' },
        { id: 'cmonhy7db0000rrrp5y4x7k7a', name: 'Admin', email: 'admin@email.com' }
      ]);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    const newFilters = {
      ...currentFilters,
      [field]: value || undefined
    };
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const statusOptions = [
    { value: '', label: 'Todos os Status' },
    { value: 'DRAFT', label: 'Rascunho' },
    { value: 'SUBMITTED', label: 'Enviado' },
    { value: 'APPROVED', label: 'Aprovado' },
    { value: 'REJECTED', label: 'Rejeitado' },
    { value: 'PAID', label: 'Pago' },
    { value: 'CANCELED', label: 'Cancelado' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Data de Criação' },
    { value: 'amount', label: 'Valor' },
    { value: 'title', label: 'Título' }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Campo de Busca */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar
          </label>
          <input
            type="text"
            placeholder="Título ou descrição..."
            value={currentFilters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Filtro por Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={currentFilters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <select
            value={currentFilters.categoryId || ''}
            onChange={(e) => handleFilterChange('categoryId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Todas as Categorias</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Colaborador (Admin/Manager apenas) */}
        {hasRole(['ADMIN', 'MANAGER']) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Colaborador
            </label>
            <select
              value={currentFilters.userId || ''}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Todos os Colaboradores</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Segunda linha de filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        
        {/* Ordenação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ordenar por
          </label>
          <select
            value={currentFilters.sortBy || 'createdAt'}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Ordem da Ordenação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ordem
          </label>
          <select
            value={currentFilters.sortOrder || 'desc'}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="desc">Mais Recentes</option>
            <option value="asc">Mais Antigos</option>
          </select>
        </div>

        {/* Botão Limpar Filtros */}
        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          >
            Limpar Filtros
          </button>
        </div>
      </div>
    </div>
  );
}
