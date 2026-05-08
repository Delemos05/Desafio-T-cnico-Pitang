import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

export default function Dashboard() {
  const [solicitations, setSolicitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, hasRole } = useAuth();

  useEffect(() => {
    loadSolicitations();
  }, []);

  const loadSolicitations = async () => {
    try {
      const data = await apiService.getSolicitations();
      setSolicitations(data);
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusCount = (status) => {
    return solicitations.filter(s => s.status === status).length;
  };

  const getTotalAmount = (status) => {
    return solicitations
      .filter(s => s.status === status)
      .reduce((total, s) => total + s.amount, 0);
  };

  const recentSolicitations = solicitations.slice(0, 5);

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

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Dashboard - {user?.name}
        </h1>
        <p className="text-gray-600">
          Bem-vindo ao Sistema de Reembolso
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Rascunhos</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {getStatusCount('DRAFT')}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {formatCurrency(getTotalAmount('DRAFT'))}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Enviados</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {getStatusCount('SUBMITTED')}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {formatCurrency(getTotalAmount('SUBMITTED'))}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Aprovados</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {getStatusCount('APPROVED')}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {formatCurrency(getTotalAmount('APPROVED'))}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Pagos</h3>
          <p className="mt-2 text-3xl font-bold text-purple-600">
            {getStatusCount('PAID')}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {formatCurrency(getTotalAmount('PAID'))}
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="overflow-hidden">
          {recentSolicitations.length === 0 ? (
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
                {recentSolicitations.map((solicitation) => (
                  <tr key={solicitation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {solicitation.title}
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
                      <Link
                        to={`/reimbursements/${solicitation.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-200">
          <Link
            to="/reimbursements"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Ver todas as solicitações →
          </Link>
        </div>
      </div>

      {hasRole(['EMPLOYEE']) && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h2>
          <div className="space-x-4">
            <Link
              to="/reimbursements/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Nova Solicitação
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
