import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

vi.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: { request: { use: vi.fn() } },
  },
}));
import api from '../services/api';

vi.mock('../context/AuthContext', () => {
  const React = require('react');
  const AuthContext = React.createContext();
  return { AuthContext };
});
import { AuthContext } from '../context/AuthContext';

import Saldo from '../pages/saldo/Saldo';

describe('Saldo', () => {
  const cardsMock = [
    { id: '1', numero: '1234567812345678' },
    { id: '2', numero: '8765432187654321' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra tarjetas cargadas y saldo', async () => {
    api.get.mockResolvedValueOnce({ data: { tarjetas: cardsMock } });

    render(
      <AuthContext.Provider value={{ user: { id: 'u1', nombre: 'Juan', fondos: 100 }, updateBalance: vi.fn() }}>
        <Saldo />
      </AuthContext.Provider>
    );

    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/usuario/cards'));

    expect(screen.getByText(/Saldo actual/i)).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();

    const last4 = cardsMock[0].numero.slice(-4);
    const maskedRegex = new RegExp(`\\*{4}\\s*\\*{4}\\s*\\*{4}[\\s\\n]*${last4}`);
    expect(await screen.findByText(maskedRegex)).toBeInTheDocument();
  });

  it('muestra error si falla la carga de tarjetas', async () => {
    api.get.mockRejectedValueOnce(new Error('fail'));

    render(
      <AuthContext.Provider value={{ user: { id: 'u1', nombre: 'Juan', fondos: 100 }, updateBalance: vi.fn() }}>
        <Saldo />
      </AuthContext.Provider>
    );

    await waitFor(() => expect(api.get).toHaveBeenCalled());
    const alerts = await screen.findAllByText(/No se pudieron cargar tus tarjetas/i);
    expect(alerts.length).toBeGreaterThanOrEqual(1);
  });

  it('valida campos al agregar tarjeta', async () => {
    api.get.mockResolvedValueOnce({ data: { tarjetas: [] } });

    render(
      <AuthContext.Provider value={{ user: { id: 'u1', nombre: 'Juan', fondos: 100 }, updateBalance: vi.fn() }}>
        <Saldo />
      </AuthContext.Provider>
    );

    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/usuario/cards'));

    await userEvent.click(screen.getByRole('button', { name: /\+ Agregar nueva tarjeta/i }));

    await userEvent.type(screen.getByLabelText(/Número de cuenta/i), '123');
    await userEvent.type(screen.getByLabelText(/MM/i), '13');
    await userEvent.type(screen.getByLabelText(/YYYY/i), '2000');
    await userEvent.type(screen.getByLabelText(/CVV/i), '12');

    await userEvent.click(screen.getByRole('button', { name: /Registrar Tarjeta/i }));

    expect(await screen.findByText(/Debe ser un número de 16 dígitos/i)).toBeInTheDocument();
    expect(screen.getByText(/Mes inválido \(1–12\)/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`Año inválido \\(>= ${new Date().getFullYear()}\\)`))).toBeInTheDocument();
    expect(screen.getByText(/CVV de 3 dígitos/i)).toBeInTheDocument();
  });

  it('agrega tarjeta correctamente', async () => {
    api.get.mockResolvedValueOnce({ data: { tarjetas: [] } });
    const newCardResponse = { tarjeta: { id: '3', numero: '1111222233334444' } };
    api.post.mockResolvedValueOnce({ data: newCardResponse });

    render(
      <AuthContext.Provider value={{ user: { id: 'u1', nombre: 'Juan', fondos: 100 }, updateBalance: vi.fn() }}>
        <Saldo />
      </AuthContext.Provider>
    );

    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/usuario/cards'));

    await userEvent.click(screen.getByRole('button', { name: /\+ Agregar nueva tarjeta/i }));

    await userEvent.type(screen.getByLabelText(/Número de cuenta/i), '1111222233334444');
    await userEvent.type(screen.getByLabelText(/MM/i), '12');
    await userEvent.type(screen.getByLabelText(/YYYY/i), `${new Date().getFullYear() + 1}`);
    await userEvent.type(screen.getByLabelText(/CVV/i), '123');

    await userEvent.click(screen.getByRole('button', { name: /Registrar Tarjeta/i }));

    expect(await screen.findByText(/Tarjeta registrada con éxito/i)).toBeInTheDocument();

    const combobox = screen.getByRole('combobox');
    await userEvent.click(combobox);

    const last4 = newCardResponse.tarjeta.numero.slice(-4);
    const maskedRegex = new RegExp(`\\*{4}\\s*\\*{4}\\s*\\*{4}[\\s\\n]*${last4}`);
    expect(await screen.findByText(maskedRegex)).toBeInTheDocument();
  });

  it('realiza pago correctamente', async () => {
    api.get.mockResolvedValueOnce({ data: { tarjetas: cardsMock } });
    api.post.mockResolvedValueOnce({ data: { fondos: 500 } });

    const mockUpdateBalance = vi.fn();

    render(
      <AuthContext.Provider value={{ user: { id: 'u1', nombre: 'Juan', fondos: 400 }, updateBalance: mockUpdateBalance }}>
        <Saldo />
      </AuthContext.Provider>
    );

    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/usuario/cards'));

    await userEvent.type(screen.getByLabelText(/Monto a depositar/i), '100');
    await userEvent.click(screen.getByRole('button', { name: /Pagar/i }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/usuario/pay', expect.objectContaining({ amount: 100 })));
    await waitFor(() => expect(mockUpdateBalance).toHaveBeenCalledWith(500));
    expect(await screen.findByText(/¡Pagaste \$100.00 exitosamente!/i)).toBeInTheDocument();
  });


});
