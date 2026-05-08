import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import SolicitationForm from '../pages/SolicitationForm';
import apiService from '../services/api';

// Mock the apiService
jest.mock('../services/api');

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: null }),
}));

describe('SolicitationForm', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'EMPLOYEE',
  };

  const mockCategories = [
    { id: '1', name: 'Alimentação', isActive: true },
    { id: '2', name: 'Transporte', isActive: true },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify(mockUser));
  });

  it('should render form correctly', () => {
    apiService.getCategories.mockResolvedValue(mockCategories);

    render(
      <BrowserRouter>
        <AuthProvider>
          <SolicitationForm />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Nova Solicitação')).toBeInTheDocument();
    expect(screen.getByLabelText('Título *')).toBeInTheDocument();
    expect(screen.getByLabelText('Valor *')).toBeInTheDocument();
    expect(screen.getByLabelText('Data *')).toBeInTheDocument();
    expect(screen.getByLabelText('Categoria *')).toBeInTheDocument();
    expect(screen.getByLabelText('Descrição *')).toBeInTheDocument();
  });

  it('should load categories on mount', async () => {
    apiService.getCategories.mockResolvedValue(mockCategories);

    render(
      <BrowserRouter>
        <AuthProvider>
          <SolicitationForm />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alimentação')).toBeInTheDocument();
      expect(screen.getByText('Transporte')).toBeInTheDocument();
    });

    expect(apiService.getCategories).toHaveBeenCalled();
  });

  it('should submit form with valid data', async () => {
    apiService.getCategories.mockResolvedValue(mockCategories);
    apiService.createSolicitation.mockResolvedValue({ id: '1' });

    render(
      <BrowserRouter>
        <AuthProvider>
          <SolicitationForm />
        </AuthProvider>
      </BrowserRouter>
    );

    // Fill form
    fireEvent.change(screen.getByLabelText('Título *'), {
      target: { value: 'Test Solicitation' },
    });
    fireEvent.change(screen.getByLabelText('Valor *'), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText('Data *'), {
      target: { value: '2024-01-01' },
    });
    fireEvent.change(screen.getByLabelText('Categoria *'), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText('Descrição *'), {
      target: { value: 'Test Description' },
    });

    // Submit form
    fireEvent.click(screen.getByText('Criar'));

    await waitFor(() => {
      expect(apiService.createSolicitation).toHaveBeenCalledWith({
        title: 'Test Solicitation',
        description: 'Test Description',
        amount: 100,
        date: new Date('2024-01-01').toISOString(),
        categoryId: '1',
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/reimbursements');
  });

  it('should show error message on submission failure', async () => {
    apiService.getCategories.mockResolvedValue(mockCategories);
    apiService.createSolicitation.mockRejectedValue({
      response: { data: { message: 'Validation error' } },
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <SolicitationForm />
        </AuthProvider>
      </BrowserRouter>
    );

    // Fill and submit form
    fireEvent.change(screen.getByLabelText('Título *'), {
      target: { value: 'Test Solicitation' },
    });
    fireEvent.change(screen.getByLabelText('Valor *'), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText('Data *'), {
      target: { value: '2024-01-01' },
    });
    fireEvent.change(screen.getByLabelText('Categoria *'), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText('Descrição *'), {
      target: { value: 'Test Description' },
    });

    fireEvent.click(screen.getByText('Criar'));

    await waitFor(() => {
      expect(screen.getByText('Validation error')).toBeInTheDocument();
    });
  });

  it('should handle form validation', async () => {
    apiService.getCategories.mockResolvedValue(mockCategories);

    render(
      <BrowserRouter>
        <AuthProvider>
          <SolicitationForm />
        </AuthProvider>
      </BrowserRouter>
    );

    // Submit empty form
    fireEvent.click(screen.getByText('Criar'));

    // HTML5 validation should prevent submission
    expect(apiService.createSolicitation).not.toHaveBeenCalled();
  });

  it('should cancel navigation', () => {
    apiService.getCategories.mockResolvedValue(mockCategories);

    render(
      <BrowserRouter>
        <AuthProvider>
          <SolicitationForm />
        </AuthProvider>
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Cancelar'));
    expect(mockNavigate).toHaveBeenCalledWith('/reimbursements');
  });
});
