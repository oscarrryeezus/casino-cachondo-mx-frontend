import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// -------------------- Mocks --------------------
vi.mock('framer-motion', () => ({
  motion: { div: (props) => <div {...props} />, img: (props) => <img {...props} /> },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

vi.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: { 
      request: { 
        use: vi.fn() 
      } 
    },
  },
}));

vi.mock('../context/AuthContext', () => {
  const React = require('react');
  const AuthContext = React.createContext();
  return { AuthContext };
});

import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import BlackjackGame from '../pages/blackjack/blackjack';

describe('BlackjackGame', () => {
  const mockUpdateBalance = vi.fn();

  const renderWithAuth = (userOverrides = {}) =>
    render(
      <AuthContext.Provider
        value={{
          user: { id: '1', _id: '1', fondos: 1000, ...userOverrides },
          updateBalance: mockUpdateBalance,
        }}
      >
        <BlackjackGame />
      </AuthContext.Provider>
    );

  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof Storage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('muestra título y fondos iniciales', async () => {
    api.get.mockResolvedValueOnce({ data: { fondos: 1000 } });
    renderWithAuth();
    
    expect(await screen.findByText(/21 Blackjack/i)).toBeInTheDocument();
    expect(await screen.findByText(/Fondos: \$1000/i)).toBeInTheDocument();
  });

  it('muestra error si la apuesta es vacía o inválida', async () => {
    api.get.mockResolvedValueOnce({ data: { fondos: 1000 } });
    renderWithAuth();
    
    // Esperar a que se carguen los fondos
    await screen.findByText(/Fondos: \$1000/i);
    
    const apuestaInput = screen.getByLabelText(/apuesta/i);
    await userEvent.clear(apuestaInput);
    
    await userEvent.click(screen.getByRole('button', { name: /apostar/i }));
    
    // El error debería aparecer cerca del área de juego, usar queryByText primero para debug
    const errorAlert = await screen.findByText(/Ingresa un monto válido mayor a 0/i);
    expect(errorAlert).toBeInTheDocument();
  });

  it('muestra error si no hay fondos suficientes', async () => {
    // Mock para cargar fondos iniciales
    api.get.mockResolvedValueOnce({ data: { fondos: 50 } });
    renderWithAuth({ fondos: 50 });
    
    // Esperar a que se carguen los fondos de la API (50)
    await screen.findByText(/Fondos: \$50/i);

    const apuestaInput = screen.getByLabelText(/apuesta/i);
    await userEvent.clear(apuestaInput);
    await userEvent.type(apuestaInput, '100');
    await userEvent.click(screen.getByRole('button', { name: /apostar/i }));
    
    // Buscar el mensaje de error específico
    expect(await screen.findByText(/No tienes fondos suficientes para esa apuesta/i)).toBeInTheDocument();
  });

  it('inicia juego correctamente', async () => {
    api.get.mockResolvedValueOnce({ data: { fondos: 1000 } });
    renderWithAuth();
    
    // Esperar a que se carguen los fondos
    await screen.findByText(/Fondos: \$1000/i);

    const apuestaInput = screen.getByLabelText(/apuesta/i);
    await userEvent.clear(apuestaInput);
    await userEvent.type(apuestaInput, '100');
    await userEvent.click(screen.getByRole('button', { name: /apostar/i }));

    // Verificar que el juego inició correctamente
    expect(await screen.findByText(/Jugador/i)).toBeInTheDocument();
    expect(await screen.findByText(/Crupier/i)).toBeInTheDocument();
    
    // Verificar que aparecen los botones de juego
    expect(screen.getByRole('button', { name: /Pedir Carta/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Plantarse/i })).toBeInTheDocument();
  });

  it('llama a la API al terminar el juego y actualiza fondos', async () => {
    api.get.mockResolvedValueOnce({ data: { fondos: 1000 } });
    api.post.mockResolvedValueOnce({ data: { fondos: 1200 } });

    renderWithAuth();
    
    // Esperar a que se carguen los fondos
    await screen.findByText(/Fondos: \$1000/i);

    const apuestaInput = screen.getByLabelText(/apuesta/i);
    await userEvent.clear(apuestaInput);
    await userEvent.type(apuestaInput, '100');
    await userEvent.click(screen.getByRole('button', { name: /apostar/i }));

    // Esperar a que aparezcan los controles del juego
    const plantarseButton = await screen.findByRole('button', { name: /Plantarse/i });
    
    // Plantarse para terminar el juego
    await userEvent.click(plantarseButton);

    // Verificar que se llamó a la API con los datos correctos
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/blackjack/jugar', {
        userId: '1',
        resultado: expect.any(String),
        apuesta: 100,
      });
    });

    // Verificar que se actualizó el balance
    await waitFor(() => {
      expect(mockUpdateBalance).toHaveBeenCalledWith(1200);
    });
  });

  it('maneja error de API al actualizar fondos', async () => {
    api.get.mockResolvedValueOnce({ data: { fondos: 1000 } });
    api.post.mockRejectedValueOnce({ 
      response: { data: { message: 'Fallo en servidor' } } 
    });

    renderWithAuth();
    
    // Esperar a que se carguen los fondos
    await screen.findByText(/Fondos: \$1000/i);

    const apuestaInput = screen.getByLabelText(/apuesta/i);
    await userEvent.clear(apuestaInput);
    await userEvent.type(apuestaInput, '100');
    await userEvent.click(screen.getByRole('button', { name: /apostar/i }));

    // Plantarse para forzar la llamada a api.post
    const plantarseButton = await screen.findByRole('button', { name: /Plantarse/i });
    await userEvent.click(plantarseButton);

    // Esperar a que aparezca el mensaje de error
    expect(await screen.findByText(/Error al actualizar fondos/i)).toBeInTheDocument();
  });

  it('permite apostar correctamente con fondos válidos', async () => {
    api.get.mockResolvedValueOnce({ data: { fondos: 500 } });
    renderWithAuth({ fondos: 500 });
    
    await screen.findByText(/Fondos: \$500/i);

    const apuestaInput = screen.getByLabelText(/apuesta/i);
    await userEvent.clear(apuestaInput);
    await userEvent.type(apuestaInput, '200');
    await userEvent.click(screen.getByRole('button', { name: /apostar/i }));

    expect(screen.queryByText(/No tienes fondos suficientes/i)).not.toBeInTheDocument();
    expect(await screen.findByText(/Jugador/i)).toBeInTheDocument();
  });
});