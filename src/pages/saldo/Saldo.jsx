import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Card, CardContent, Typography,
  TextField, Button, Alert,
  MenuItem, Select, InputLabel, FormControl,
  CircularProgress, Collapse, IconButton
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import CloseIcon from '@mui/icons-material/Close';

const Saldo = () => {
  const { user, updateBalance } = useContext(AuthContext);
  const [cards, setCards] = useState([]);
  const [newCard, setNewCard] = useState({ numero: '', mm: '', yyyy: '', cvv: '' });
  const [selectedCard, setSelectedCard] = useState('');
  const [amount, setAmount] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [stepAdd, setStepAdd] = useState('');
  const [loadingPay, setLoadingPay] = useState(false);
  const [stepPay, setStepPay] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const { data } = await api.get('/usuario/cards');
      setCards(data.tarjetas);
      if (data.tarjetas.length) setSelectedCard(data.tarjetas[0].id);
    } catch {
      setGlobalError('No se pudieron cargar tus tarjetas.');
    }
  };

  const formatCardNumber = num => num.replace(/(.{4})/g, '$1 ').trim();

  const validateCard = () => {
    const errs = {};
    const yearNow = new Date().getFullYear();
    if (!/^\d{16}$/.test(newCard.numero)) errs.numero = 'Debe ser un número de 16 dígitos';
    if (!/^\d{1,2}$/.test(newCard.mm) || +newCard.mm < 1 || +newCard.mm > 12) errs.mm = 'Mes inválido (1–12)';
    if (!/^\d{4}$/.test(newCard.yyyy) || +newCard.yyyy < yearNow) errs.yyyy = `Año inválido (>= ${yearNow})`;
    if (!/^\d{3}$/.test(newCard.cvv)) errs.cvv = 'CVV de 3 dígitos';
    return errs;
  };

  const handleAddCard = async () => {
    setGlobalError('');
    setSuccessMsg('');
    const errs = validateCard();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setLoadingAdd(true);
    setStepAdd('Verificando datos de la tarjeta...');
    setStepAdd('Contactando al banco emisor...');
    try {
      const { data } = await api.post('/usuario/cards', newCard);
      setCards(prev => [...prev, data.tarjeta]);
      setNewCard({ numero: '', mm: '', yyyy: '', cvv: '' });
      setSuccessMsg('Tarjeta registrada con éxito. ¡Listo para usar!');
      setShowAddForm(false);
    } catch (err) {
      setGlobalError(err.response?.data?.message || 'Error al registrar tarjeta');
    } finally {
      setLoadingAdd(false);
      setStepAdd('');
    }
  };

  const handlePay = async () => {
    setGlobalError('');
    setSuccessMsg('');
    const value = parseFloat(amount);
    if (!selectedCard) return setGlobalError('Selecciona una tarjeta');
    if (isNaN(value) || value <= 0) return setGlobalError('Monto inválido');

    setLoadingPay(true);
    setStepPay('Iniciando transacción...');
    setStepPay('Verificando fondos...');
    setStepPay('Procesando con el procesador de pagos...');
    try {
      const { data } = await api.post('/usuario/pay', { cardId: selectedCard, amount: value });
      updateBalance(data.fondos);
      setSuccessMsg(`¡Pagaste $${value.toFixed(2)} exitosamente!`);
      setAmount('');
    } catch (err) {
      setGlobalError(err.response?.data?.message || 'Error al procesar pago');
    } finally {
      setLoadingPay(false);
      setStepPay('');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, px: 2 }}>
      <Card sx={{ width: 400, background: 'rgba(0,0,0,0.8)', borderRadius: 2, boxShadow: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: 'gold', mb: 2 }}>Tus Tarjetas</Typography>

          {cards.length > 0 ? (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ color: 'white' }}>Selecciona tarjeta</InputLabel>
              <Select
                value={selectedCard}
                onChange={e => setSelectedCard(e.target.value)}
                sx={{ background: '#222', color: 'white' }}
              >
                {cards.map(c => (
                  <MenuItem key={c.id} value={c.id}>**** **** **** {c.numero.slice(-4)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Typography sx={{ color: 'white', mb: 2 }}>No tienes tarjetas registradas</Typography>
          )}

          {!showAddForm && (
            <Button variant="outlined" onClick={() => setShowAddForm(true)} sx={{ color: 'gold', borderColor: 'gold' }}>
              + Agregar nueva tarjeta
            </Button>
          )}

          <Collapse in={showAddForm} sx={{ mt: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <IconButton
                size="small"
                onClick={() => setShowAddForm(false)}
                sx={{ position: 'absolute', top: 0, right: 0, color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
              <Typography variant="subtitle1" sx={{ color: 'gold', mb: 1 }}>Registrar nueva tarjeta</Typography>
              <TextField
                fullWidth
                label="Número de cuenta"
                value={formatCardNumber(newCard.numero)}
                onChange={e => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
                  setNewCard({ ...newCard, numero: digits });
                }}
                inputProps={{ maxLength: 19 }}
                error={!!fieldErrors.numero}
                helperText={fieldErrors.numero}
                sx={{ mb: 1, background: '#222', input: { color: 'white', letterSpacing: '0.1em' } }}
              />
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  label="MM"
                  value={newCard.mm}
                  onChange={e => setNewCard({ ...newCard, mm: e.target.value.replace(/\D/g, '') })}
                  inputProps={{ maxLength: 2 }}
                  error={!!fieldErrors.mm}
                  helperText={fieldErrors.mm}
                  sx={{ flex: 1, background: '#222', input: { color: 'white' } }}
                />
                <TextField
                  label="YYYY"
                  value={newCard.yyyy}
                  onChange={e => setNewCard({ ...newCard, yyyy: e.target.value.replace(/\D/g, '') })}
                  inputProps={{ maxLength: 4 }}
                  error={!!fieldErrors.yyyy}
                  helperText={fieldErrors.yyyy}
                  sx={{ flex: 1, background: '#222', input: { color: 'white' } }}
                />
                <TextField
                  label="CVV"
                  value={newCard.cvv}
                  onChange={e => setNewCard({ ...newCard, cvv: e.target.value.replace(/\D/g, '') })}
                  inputProps={{ maxLength: 3 }}
                  error={!!fieldErrors.cvv}
                  helperText={fieldErrors.cvv}
                  sx={{ flex: 1, background: '#222', input: { color: 'white' } }}
                />
              </Box>
              {stepAdd && <Typography sx={{ color: 'info.main', mb: 1 }}>{stepAdd}</Typography>}
              {globalError && <Alert severity="error" sx={{ mb: 1 }}>{globalError}</Alert>}
              <Button
                fullWidth
                variant="contained"
                onClick={handleAddCard}
                disabled={loadingAdd}
                startIcon={loadingAdd && <CircularProgress size={20} color="inherit" />}
                sx={{ background: 'gold', color: 'black', '&:hover': { background: '#d4af37' } }}
              >
                {loadingAdd ? 'Procesando...' : 'Registrar Tarjeta'}
              </Button>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      <Card sx={{ width: 400, background: 'rgba(0,0,0,0.8)', borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ color: 'gold', mb: 2 }}>Añadir Saldo</Typography>
          <Typography sx={{ color: 'white', mb: 3 }}>
            Saldo actual: <strong>${user?.fondos?.toFixed(2) ?? '0.00'}</strong>
          </Typography>
          {globalError && <Alert severity="error" sx={{ mb: 2 }}>{globalError}</Alert>}
          {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

          <TextField
            fullWidth
            label="Monto a depositar"
            value={amount}
            onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            sx={{ mb: 2, background: '#222', input: { color: 'white' } }}
          />

          {stepPay && <Typography sx={{ color: 'info.main', mb: 1 }}>{stepPay}</Typography>}
          <Button
            fullWidth
            variant="contained"
            onClick={handlePay}
            disabled={loadingPay}
            startIcon={loadingPay && <CircularProgress size={20} color="inherit" />}
            sx={{ background: 'gold', color: 'black', '&:hover': { background: '#d4af37' } }}
          >
            {loadingPay ? 'Procesando...' : 'Pagar'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Saldo;