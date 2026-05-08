import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

export default function SolicitationForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [justification, setJustification] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [solicitation, setSolicitation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditing = !!id;

  useEffect(() => {
    loadCategories();
    if (isEditing) {
      loadSolicitation();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      const err = error as any;
      setError(err.response?.data?.message || 'Erro ao carregar categorias');
      setCategories([]);
    }
  };

  const loadSolicitation = async () => {
    try {
      const data = await apiService.getSolicitation(id!);
      if (data.user.id !== user?.id) {
        setError('Você não pode editar esta solicitação');
        return;
      }
      setSolicitation(data);
      setTitle(data.title);
      setDescription(data.description);
      setAmount(data.amount.toString());
      setDate(new Date(data.date).toISOString().split('T')[0]);
      setCategoryId(data.category.id);
      setJustification(data.justification || '');
    } catch (error) {
      const err = error as any;
      setError(err.response?.data?.message || 'Erro ao carregar solicitação');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const solicitationData = {
        title,
        description,
        amount: parseFloat(amount),
        date: new Date(date).toISOString(),
        categoryId,
        justification: justification || undefined,
      };

      if (isEditing) {
        await apiService.updateSolicitation(id, solicitationData);
      } else {
        await apiService.createSolicitation(solicitationData);
      }

      navigate('/reimbursements');
    } catch (error) {
      const err = error as any;
      setError(err.response?.data?.message || 'Erro ao salvar solicitação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Editar Solicitação' : 'Nova Solicitação'}
        </h1>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Título *
              </label>
              <input
                type="text"
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Valor *
              </label>
              <input
                type="number"
                id="amount"
                required
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Data *
              </label>
              <input
                type="date"
                id="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Categoria *
              </label>
              <select
                id="category"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Selecione uma categoria</option>
                {Array.isArray(categories) && categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descrição *
            </label>
            <textarea
              id="description"
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="justification" className="block text-sm font-medium text-gray-700">
              Justificativa
            </label>
            <textarea
              id="justification"
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/reimbursements')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
