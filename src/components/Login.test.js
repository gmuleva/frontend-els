import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login';
import { authAPI } from '../services/api';

jest.mock('../services/api');

describe('Login Component Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should render login form with all fields', () => {
    render(<Login />);
    
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  it('should handle successful login', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User'
    };
    
    const mockResponse = {
      data: {
        token: 'test-token-123',
        user: mockUser
      }
    };

    authAPI.login.mockResolvedValue(mockResponse);

    const onLoginSuccess = jest.fn();
    render(<Login onLoginSuccess={onLoginSuccess} />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(authAPI.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    await waitFor(() => {
      expect(localStorage.getItem('authToken')).toBe('test-token-123');
      expect(onLoginSuccess).toHaveBeenCalledWith(mockUser);
    });
  });

  it('should display error message on login failure', async () => {
    const mockError = {
      response: {
        data: {
          error: 'Invalid credentials'
        }
      }
    };

    authAPI.login.mockRejectedValue(mockError);

    render(<Login />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent('Invalid credentials');
    });
  });

  it('should disable button while loading', async () => {
    authAPI.login.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<Login />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    expect(loginButton).toBeDisabled();
    expect(loginButton).toHaveTextContent('Logging in...');

    await waitFor(() => {
      expect(loginButton).not.toBeDisabled();
    });
  });
});
