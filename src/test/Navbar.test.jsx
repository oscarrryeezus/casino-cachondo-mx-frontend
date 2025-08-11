import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// -------------------- Mocks --------------------
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => {
  const React = require('react');
  return {
    Link: ({ children, to, ...props }) => React.createElement('a', { href: to, ...props }, children),
    useNavigate: () => mockNavigate,
  };
});

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

vi.mock('@mui/material', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useMediaQuery: () => false,
  };
});

// -------------------- Imports tras mocks --------------------
import api from '../services/api';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';

describe('Navbar', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogout.mockClear();
    mockNavigate.mockClear();
  });

  const renderNavbar = (isAuthenticated = false, user = null) => {
    return render(
      <AuthContext.Provider value={{ isAuthenticated, user, logout: mockLogout }}>
        <Navbar />
      </AuthContext.Provider>
    );
  };

  it('muestra solo link Inicio si no está autenticado', () => {
    renderNavbar(false, null);

    expect(screen.getByRole('link', { name: /inicio/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /ruleta/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /blackjack 21/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /cerrar sesión/i })).not.toBeInTheDocument();
  });

  it('muestra links Ruleta, Blackjack y botón Cerrar Sesión si está autenticado', () => {
    const user = { nombre: 'Juan', fondos: 123.456 };
    renderNavbar(true, user);

    expect(screen.getByRole('link', { name: /inicio/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ruleta/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /blackjack 21/i })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();

    expect(screen.getByText(/juan/i)).toBeInTheDocument();
    expect(screen.getByText(/saldo: \$123\.46/i)).toBeInTheDocument();
  });

  it('abre menú móvil y permite navegar y cerrar menú (básico)', async () => {
    renderNavbar(true, { nombre: 'Juan', fondos: 50 });

    const inicioLink = screen.getByRole('link', { name: /inicio/i });
    await userEvent.click(inicioLink);

    expect(inicioLink).toBeInTheDocument();
  });

  it('llama a logout y navigate al hacer click en cerrar sesión', async () => {
    api.post.mockResolvedValueOnce({});

    renderNavbar(true, { nombre: 'Juan', fondos: 100 });

    const logoutButton = screen.getByRole('button', { name: /cerrar sesión/i });
    await userEvent.click(logoutButton);

    expect(api.post).toHaveBeenCalledWith('/auth/logout');
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('maneja error en logout y aun así hace logout local y navigate', async () => {
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

  api.post.mockRejectedValueOnce(new Error('Error servidor'));

  renderNavbar(true, { nombre: 'Juan', fondos: 100 });

  const logoutButton = screen.getByRole('button', { name: /cerrar sesión/i });
  await userEvent.click(logoutButton);

  expect(api.post).toHaveBeenCalledWith('/auth/logout');
  expect(mockLogout).toHaveBeenCalled();
  expect(mockNavigate).toHaveBeenCalledWith('/');

  consoleErrorSpy.mockRestore();
  consoleWarnSpy.mockRestore();
});

});
