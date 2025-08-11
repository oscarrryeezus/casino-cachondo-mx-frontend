import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@mui/icons-material', () => ({
  Person: () => <span data-testid="icon-person">P</span>,
  Email: () => <span data-testid="icon-email">E</span>,
  Lock: () => <span data-testid="icon-lock">L</span>,
  HowToReg: () => <span data-testid="icon-ht">R</span>,
  Assignment: () => <span data-testid="icon-assign">A</span>,
}));

vi.mock('../components/Terminos', () => ({
  __esModule: true,
  default: () => null,
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
import RegisterForm from '../components/RegisterForm';
import { AuthContext } from '../context/AuthContext';

describe('RegisterForm', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  const renderWithAuth = () =>
    render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <RegisterForm />
      </AuthContext.Provider>
    );

  it('renderiza los campos principales y el botón', () => {
    renderWithAuth();

    expect(screen.getByLabelText(/Nombre Completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Contraseña$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Confirmar Contraseña$/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
  });

  it('muestra errores si envías vacío', async () => {
    renderWithAuth();

    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(await screen.findByText(/Nombre completo es requerido/i)).toBeInTheDocument();
    expect(await screen.findByText(/Email es requerido/i)).toBeInTheDocument();
    expect(await screen.findByText(/Contraseña es requerida/i)).toBeInTheDocument();
    expect(await screen.findByText(/Debes aceptar los términos/i)).toBeInTheDocument();
  });

  it('valida contraseña débil', async () => {
    renderWithAuth();

    await userEvent.type(screen.getByLabelText(/Nombre Completo/i), 'Juana');
    await userEvent.type(screen.getByLabelText(/^Email$/i), 'juana@example.com');
    await userEvent.type(screen.getByLabelText(/^Contraseña$/i), 'weak'); // débil
    await userEvent.type(screen.getByLabelText(/^Confirmar Contraseña$/i), 'weak');
    await userEvent.click(screen.getByRole('checkbox'));

    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(await screen.findByText(/La contraseña debe tener al menos 8 caracteres/i)).toBeInTheDocument();
  });

  it('flujo exitoso: /usuario luego /auth/login -> llama login y navega', async () => {
    api.post.mockResolvedValueOnce({ data: { ok: true } });
    api.post.mockResolvedValueOnce({
      data: { token: 'tok123', user: { id: 'u1', nombre: 'Usuario' } },
    });

    renderWithAuth();

    await userEvent.type(screen.getByLabelText(/Nombre Completo/i), 'Usuario Test');
    await userEvent.type(screen.getByLabelText(/^Email$/i), 'user@test.com');
    await userEvent.type(screen.getByLabelText(/^Contraseña$/i), 'Aa1!aaaa');
    await userEvent.type(screen.getByLabelText(/^Confirmar Contraseña$/i), 'Aa1!aaaa');
    await userEvent.click(screen.getByRole('checkbox'));

    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenNthCalledWith(
        1,
        '/usuario',
        expect.objectContaining({
          nombre: 'Usuario Test',
          email: 'user@test.com',
          password: 'Aa1!aaaa',
        })
      );
    });

    await waitFor(() => {
      expect(api.post).toHaveBeenNthCalledWith(
        2,
        '/auth/login',
        { email: 'user@test.com', password: 'Aa1!aaaa' }
      );
    });

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('tok123', { id: 'u1', nombre: 'Usuario' }));
    expect(mockNavigate).toHaveBeenCalledWith('/ruleta');
  });

  it('muestra error del servidor cuando api falla', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { message: 'Usuario ya existe' } },
    });

    renderWithAuth();

    await userEvent.type(screen.getByLabelText(/Nombre Completo/i), 'Usuario');
    await userEvent.type(screen.getByLabelText(/^Email$/i), 'usr@test.com');
    await userEvent.type(screen.getByLabelText(/^Contraseña$/i), 'Aa1!aaaa');
    await userEvent.type(screen.getByLabelText(/^Confirmar Contraseña$/i), 'Aa1!aaaa');
    await userEvent.click(screen.getByRole('checkbox'));

    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(await screen.findByText(/Usuario ya existe/i)).toBeInTheDocument();
  });
});
