import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { Solicitation, SolicitationStatus, UserRole } from '../types';
import { statusColors, statusLabels, formatCurrency, formatDate, canUserPerformAction } from '../utils/statusUtils';

export default function SolicitationList() {
  const [solicitations, setSolicitations] = useState<Solicitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, hasRole } = useAuth();

  useEffect(() => {
    loadSolicitations();
  }, []);

  const loadSolicitations = async () => {
    try {
      const data = await apiService.getSolicitations();
      setSolicitations(data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao carregar solicitações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id: string, action: string, observation?: string) => {
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
      }
      await loadSolicitations();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao executar ação');
    }
  };

  const handleApproveReject = async (id: string, action: 'approve' | 'reject') => {
    const observation = prompt(`Motivo da ${action === 'approve' ? 'aprovação' : 'rejeição'}:`);
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

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Solicitações de Reembolso</h1>
          {hasRole([UserRole.EMPLOYEE]) && (
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
                            user?.role || UserRole.EMPLOYEE,
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
                            user?.role || UserRole.EMPLOYEE,
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
                            user?.role || UserRole.EMPLOYEE,
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
                            user?.role || UserRole.EMPLOYEE,
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
                            user?.role || UserRole.EMPLOYEE,
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
                            user?.role || UserRole.EMPLOYEE,
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
      </div>
    </div>
  );
}
