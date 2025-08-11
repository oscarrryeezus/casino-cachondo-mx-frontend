import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// -------------------- Mocks --------------------
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@mui/icons-material', () => ({
  Email: () => <span data-testid="icon-email">E</span>,
  Lock: () => <span data-testid="icon-lock">L</span>,
}));

vi.mock('../services/api', () => ({
  __esModule: true,
  default: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: { request: { use: vi.fn() } },
  },
}));

vi.mock('../context/AuthContext', () => {
  const React = require('react');
  const AuthContext = React.createContext();
  return { AuthContext };
});

import api from '../services/api';
import LoginForm from '../components/LoginForm';
import { AuthContext } from '../context/AuthContext';

// -------------------- Tests --------------------
describe('LoginForm', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithAuth = () =>
    render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <LoginForm />
      </AuthContext.Provider>
    );

  it('muestra el formulario (inputs y botón)', () => {
    renderWithAuth();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
  });

  it('permite escribir en los campos', async () => {
    renderWithAuth();
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'password123');
    expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');
    expect(screen.getByLabelText(/contraseña/i)).toHaveValue('password123');
  });

  it('muestra error si envías con campos vacíos', async () => {
    renderWithAuth();
    await userEvent.click(screen.getByRole('button', { name: /ingresar/i }));
    expect(await screen.findByText(/por favor ingresa email y contraseña/i)).toBeInTheDocument();
  });

  it('llama a la API y al login en envío válido', async () => {
    api.post.mockResolvedValueOnce({
      data: { token: 'token123', user: { id: 1, nombre: 'Test' } },
    });

    renderWithAuth();

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      })
    );

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('token123', { id: 1, nombre: 'Test' }));
  });
});
