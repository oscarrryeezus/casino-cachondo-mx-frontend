import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../services/api', () => ({
  __esModule: true,
  default: {
    post: vi.fn(),
  },
}));

vi.mock('../context/AuthContext', () => ({
  __esModule: true,
  useAuth: vi.fn(),
}));

window.HTMLMediaElement.prototype.play = vi.fn();

import RouletteGame from '../pages/ruleta/Roulette';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

describe('RouletteGame', () => {
  const mockUpdateBalance = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useAuth.mockReturnValue({
      user: { _id: 'user123', fondos: 1000 },
      checkingSession: false,
      updateBalance: mockUpdateBalance,
    });
  });

  it('renderiza el título y el botón', () => {
    render(<RouletteGame />);
    expect(screen.getByText(/Ruleta Ganadora/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Apostar y Ganar/i })).toBeInTheDocument();
  });

  it('muestra error si apuesta es inválida', async () => {
    render(<RouletteGame />);
    fireEvent.change(screen.getByLabelText(/Monto a apostar/i), { target: { value: '-10' } });
    fireEvent.click(screen.getByRole('button', { name: /Apostar y Ganar/i }));

    expect(await screen.findByText(/Ingresa un monto válido mayor a 0/i)).toBeInTheDocument();
  });

  it('muestra error si número está fuera de rango', async () => {
    render(<RouletteGame />);
    fireEvent.change(screen.getByLabelText(/Monto a apostar/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Número exacto/i), { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: /Apostar y Ganar/i }));

    expect(await screen.findByText(/El número debe estar entre 0 y 36/i)).toBeInTheDocument();
  });

  it('muestra mensaje de sesión cargando si checkingSession es true', () => {
    useAuth.mockReturnValueOnce({
      user: null,
      checkingSession: true,
      updateBalance: mockUpdateBalance,
    });

    render(<RouletteGame />);
    expect(screen.getByText(/Cargando sesión/i)).toBeInTheDocument();
  });
});
