import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

// Mock the apiService
jest.mock('../services/api');

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should login successfully and store token', async () => {
    const mockLoginResponse = {
      token: 'mock-token',
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'EMPLOYEE',
      },
    };

    apiService.login.mockResolvedValue(mockLoginResponse);

    const TestComponent = () => {
      const { login, user, isAuthenticated } = useAuth();
      return (
        <div>
          <button onClick={() => login('test@example.com', '123456')}>
            Login
          </button>
          <div data-testid="user-info">
            {isAuthenticated ? user.name : 'Not authenticated'}
          </div>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toHaveTextContent('Test User');
    });

    expect(localStorage.getItem('token')).toBe('mock-token');
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockLoginResponse.user));
  });

  it('should logout and clear storage', async () => {
    // Set initial authenticated state
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify({ id: '1', name: 'Test User' }));

    const TestComponent = () => {
      const { logout, user, isAuthenticated } = useAuth();
      return (
        <div>
          <button onClick={logout}>Logout</button>
          <div data-testid="user-info">
            {isAuthenticated ? user.name : 'Not authenticated'}
          </div>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toHaveTextContent('Not authenticated');
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('should load user from localStorage on mount', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'EMPLOYEE',
    };

    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    const TestComponent = () => {
      const { user, isAuthenticated } = useAuth();
      return (
        <div data-testid="user-info">
          {isAuthenticated ? user.name : 'Not authenticated'}
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-info')).toHaveTextContent('Test User');
  });

  it('should handle role checking correctly', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'ADMIN',
    };

    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    const TestComponent = () => {
      const { hasRole } = useAuth();
      return (
        <div>
          <div data-testid="is-admin">{hasRole(['ADMIN']) ? 'Yes' : 'No'}</div>
          <div data-testid="is-employee">{hasRole(['EMPLOYEE']) ? 'Yes' : 'No'}</div>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('is-admin')).toHaveTextContent('Yes');
    expect(screen.getByTestId('is-employee')).toHaveTextContent('No');
  });
});
