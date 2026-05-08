import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { Solicitation, History, UserRole } from '../types';
import { 
  statusColors, 
  statusLabels, 
  formatDate, 
  formatCurrency,
  canUserPerformAction 
} from '../utils/statusUtils';

export default function SolicitationDetail() {
  const [solicitation, setSolicitation] = useState<Solicitation | null>(null);
  const [history, setHistory] = useState<History[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const [solicitationData, historyData] = await Promise.all([
        apiService.getSolicitation(id!),
        apiService.getSolicitationHistory(id!)
      ]);
      setSolicitation(solicitationData);
      setHistory(historyData);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao carregar solicitação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: string, observation?: string) => {
    try {
      switch (action) {
        case 'submit':
          await apiService.submitSolicitation(id!);
          break;
        case 'approve':
          await apiService.approveSolicitation(id!, observation || '');
          break;
        case 'reject':
          await apiService.rejectSolicitation(id!, observation || '');
          break;
        case 'pay':
          await apiService.paySolicitation(id!);
          break;
        case 'cancel':
          await apiService.cancelSolicitation(id!);
          break;
      }
      await loadData();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao executar ação');
    }
  };

  const handleApproveReject = async (action: 'approve' | 'reject') => {
    const observation = prompt(`Motivo da ${action === 'approve' ? 'aprovação' : 'rejeição'}:`);
    if (observation) {
      await handleAction(action, observation);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!solicitation) {
    return (
      <div className="text-center">
        <p className="text-gray-500">Solicitação não encontrada</p>
      </div>
    );
  }

  const isOwner = user?.id === solicitation.user.id;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{solicitation.title}</h1>
            <p className="text-gray-600 mt-1">ID: {solicitation.id}</p>
          </div>
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusColors[solicitation.status]}`}>
            {statusLabels[solicitation.status]}
          </span>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Solicitante</h3>
              <p className="mt-1 text-lg text-gray-900">{solicitation.user.name}</p>
              <p className="text-sm text-gray-600">{solicitation.user.email}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Categoria</h3>
              <p className="mt-1 text-lg text-gray-900">{solicitation.category.name}</p>
              {solicitation.category.description && (
                <p className="text-sm text-gray-600">{solicitation.category.description}</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Valor</h3>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatCurrency(solicitation.amount)}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Data da Despesa</h3>
              <p className="mt-1 text-lg text-gray-900">{formatDate(solicitation.date)}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Data de Criação</h3>
              <p className="mt-1 text-lg text-gray-900">{formatDate(solicitation.createdAt)}</p>
            </div>

            {solicitation.justification && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Justificativa</h3>
                <p className="mt-1 text-gray-900">{solicitation.justification}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Descrição</h3>
          <p className="text-gray-900 whitespace-pre-wrap">{solicitation.description}</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {canUserPerformAction(
            user?.role || UserRole.EMPLOYEE,
            solicitation.status,
            'edit',
            isOwner
          ) && (
            <Link
              to={`/reimbursements/${solicitation.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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
              onClick={() => handleAction('submit')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Enviar para Aprovação
            </button>
          )}

          {canUserPerformAction(
            user?.role || UserRole.EMPLOYEE,
            solicitation.status,
            'approve',
            isOwner
          ) && (
            <button
              onClick={() => handleApproveReject('approve')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
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
              onClick={() => handleApproveReject('reject')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
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
              onClick={() => handleAction('pay')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
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
              onClick={() => handleAction('cancel')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Histórico</h2>
        </div>
        <div className="p-6">
          {history.length === 0 ? (
            <p className="text-gray-500 text-center">Nenhum histórico encontrado</p>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="border-l-4 border-gray-200 pl-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{item.action}</p>
                      <p className="text-sm text-gray-600">
                        Por {item.user.name} em {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>
                  {item.observation && (
                    <p className="mt-2 text-gray-700">{item.observation}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
