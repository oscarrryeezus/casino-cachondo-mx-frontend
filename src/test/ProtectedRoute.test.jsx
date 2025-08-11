import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';

vi.mock('../context/AuthContext', () => {
  const useAuth = vi.fn();
  return { __esModule: true, useAuth };
});

import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra mensaje de verificación cuando checkingSession es true', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      checkingSession: true,
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Contenido protegido</div>} />
          </Route>
          <Route path="/" element={<div>Página pública</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/verificando sesion/i)).toBeInTheDocument();
  });

  it('renderiza Outlet cuando está autenticado', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      checkingSession: false,
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Contenido protegido</div>} />
          </Route>
          <Route path="/" element={<div>Página pública</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/contenido protegido/i)).toBeInTheDocument();
  });

  it('redirige cuando no está autenticado', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      checkingSession: false,
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoute redirectTo="/" />}>
            <Route path="/protected" element={<div>Contenido protegido</div>} />
          </Route>
          <Route path="/" element={<div>Página pública</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/página pública/i)).toBeInTheDocument();
    expect(screen.queryByText(/contenido protegido/i)).not.toBeInTheDocument();
  });
});
