import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { usePaginatedData } from '../hooks/usePaginatedData';
import { useSimpleData } from '../hooks/useSimpleData';
import Pagination from '../components/Pagination';
import SolicitationFilters from '../components/SolicitationFilters';

export default function SolicitationList() {
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({});
  const { user, hasRole } = useAuth();

  // Hook simplificado para teste
  const {
    data: solicitations,
    loading: isLoading,
    error: hookError
  } = useSimpleData();

  const pagination = {
    page: 1,
    limit: 10,
    total: solicitations.length,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  };

  const handlePageChange = () => {}; // Mock para teste

  // Sincroniza erros
  useEffect(() => {
    if (hookError) {
      setError(hookError);
    }
  }, [hookError]);

  const handleFiltersChange = (newFilters) => {
    setFilters(prevFilters => {
      // Só atualiza se os filtros realmente mudaram
      if (JSON.stringify(prevFilters) !== JSON.stringify(newFilters)) {
        return newFilters;
      }
      return prevFilters;
    });
  };

  const handleAction = async (id, action, observation) => {
    try {
      switch (action) {
        case 'submit':
          await apiService.submitSolicitation(id);
          break;
        case 'approve':
          await apiService.approveSolicitation(id, observation || '');
          break;
        case 'reject':
          await apiService.rejectSolicitation(id, observation || '');
          break;
        case 'pay':
          await apiService.paySolicitation(id);
          break;
        case 'cancel':
          await apiService.cancelSolicitation(id);
          break;
        default:
          console.warn('Unknown action:', action);
      }
      // Recarrega a página atual após ação
      window.location.reload();
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao executar ação');
    }
  };

  const handleApproveReject = async (id, action) => {
    const observation = window.prompt(`Motivo da ${action === 'approve' ? 'aprovação' : 'rejeição'}:`);
    if (observation) {
      await handleAction(id, action, observation);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SUBMITTED: 'bg-blue-100 text-blue-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    PAID: 'bg-purple-100 text-purple-800',
    CANCELED: 'bg-yellow-100 text-yellow-800',
  };

  const statusLabels = {
    DRAFT: 'Rascunho',
    SUBMITTED: 'Enviado',
    APPROVED: 'Aprovado',
    REJECTED: 'Rejeitado',
    PAID: 'Pago',
    CANCELED: 'Cancelado',
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const canUserPerformAction = (userRole, status, action, isOwner = false) => {
    switch (action) {
      case 'edit':
        return isOwner && status === 'DRAFT';
      case 'submit':
        return isOwner && status === 'DRAFT';
      case 'approve':
      case 'reject':
        return userRole === 'MANAGER' && status === 'SUBMITTED';
      case 'pay':
        return userRole === 'FINANCE' && status === 'APPROVED';
      case 'cancel':
        return (isOwner && status === 'DRAFT') || 
               (userRole === 'MANAGER' && status === 'SUBMITTED');
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Solicitações de Reembolso</h1>
          </div>

          {/* Componente de Filtros */}
          <SolicitationFilters 
            onFiltersChange={handleFiltersChange}
            currentFilters={filters}
          />
          {hasRole(['EMPLOYEE']) && (
            <Link
              to="/reimbursements/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Nova Solicitação
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="overflow-hidden">
          {solicitations.length === 0 ? (
            <div className="px-6 py-4 text-center text-gray-500">
              Nenhuma solicitação encontrada
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Solicitante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {solicitations.map((solicitation) => {
                  const isOwner = user?.id === solicitation.user.id;
                  return (
                    <tr key={solicitation.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {solicitation.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {solicitation.description.substring(0, 50)}...
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {solicitation.user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {solicitation.category.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(solicitation.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[solicitation.status]}`}>
                          {statusLabels[solicitation.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(solicitation.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={`/reimbursements/${solicitation.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Ver
                          </Link>
                          
                          {canUserPerformAction(
                            user?.role || 'EMPLOYEE',
                            solicitation.status,
                            'edit',
                            isOwner
                          ) && (
                            <Link
                              to={`/reimbursements/${solicitation.id}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Editar
                            </Link>
                          )}
                          
                          {canUserPerformAction(
                            user?.role || 'EMPLOYEE',
                            solicitation.status,
                            'submit',
                            isOwner
                          ) && (
                            <button
                              onClick={() => handleAction(solicitation.id, 'submit')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Enviar
                            </button>
                          )}
                          
                          {canUserPerformAction(
                            user?.role || 'EMPLOYEE',
                            solicitation.status,
                            'approve',
                            isOwner
                          ) && (
                            <button
                              onClick={() => handleApproveReject(solicitation.id, 'approve')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Aprovar
                            </button>
                          )}
                          
                          {canUserPerformAction(
                            user?.role || 'EMPLOYEE',
                            solicitation.status,
                            'reject',
                            isOwner
                          ) && (
                            <button
                              onClick={() => handleApproveReject(solicitation.id, 'reject')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Rejeitar
                            </button>
                          )}
                          
                          {canUserPerformAction(
                            user?.role || 'EMPLOYEE',
                            solicitation.status,
                            'pay',
                            isOwner
                          ) && (
                            <button
                              onClick={() => handleAction(solicitation.id, 'pay')}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              Pagar
                            </button>
                          )}
                          
                          {canUserPerformAction(
                            user?.role || 'EMPLOYEE',
                            solicitation.status,
                            'cancel',
                            isOwner
                          ) && (
                            <button
                              onClick={() => handleAction(solicitation.id, 'cancel')}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Componente de Paginação */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
        />
      </div>
    </div>
  );
}
