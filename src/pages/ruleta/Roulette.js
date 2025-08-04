import React, { useState, useRef } from 'react';
import {
  Box, Typography, Button, TextField, MenuItem, Alert, Grid, Paper
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const colors = ['rojo', 'negro', 'verde'];

const RouletteGame = () => {
  const [color, setColor] = useState('');
  const [numero, setNumero] = useState(0);
  const [apuesta, setApuesta] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [showLoseAnimation, setShowLoseAnimation] = useState(false);
  const [history, setHistory] = useState([]);
  const [,] = useState();
  const audioRef = useRef(null);
  const { user, checkingSession, updateBalance } = useAuth();

  const audioPerder = useRef(null);

  const validateInputs = () => {
    if (!apuesta || isNaN(apuesta) || parseFloat(apuesta) <= 0) {
      return 'Ingresa un monto válido mayor a 0';
    }
    if (numero !== null && (isNaN(numero) || numero < 0 || numero > 36)) {
      return 'El número debe estar entre 0 y 36';
    }
    if (color && !colors.includes(color)) {
      return 'Color inválido';
    }
    return null;
  };

  const playRoulette = async () => {
    setError('');
    if (checkingSession) {
      setError('Validando sesión...');
      return;
    }

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSpinning(true);
    setResult(null);
    setShowWinAnimation(false);

    try {
      const response = await api.post("/roulette/play", {
        userId: user?._id,
        apuesta,
        color,
        numero
      })

      const data = await response.data

      const { numeroGanador, colorGanador, resultado, montoGanado, fondosActuales } = data

      updateBalance(fondosActuales);

      setTimeout(() => {
        const resultData = {
          numeroGanador,
          colorGanador,
          resultado,
          montoGanado,
          fondosActuales
        };
        setResult(resultData);
        if (resultado === "ganado") {
          setShowWinAnimation(true);
          audioRef.current?.play();
        } else {
          setShowLoseAnimation(true)
          audioPerder.current?.play();
        }

        setHistory(prev => [...prev, resultData].slice(-5));
        setSpinning(false);

        setTimeout(() => setShowWinAnimation(false), 4000);
        setTimeout(() => setShowLoseAnimation(false), 4000);
      }, 3000);

    } catch (e) {
      setError(e.response.data.error)
      setSpinning(false)
    }


  };

  if (checkingSession) {
    return <Typography color="white" align="center">Cargando sesión...</Typography>;
  }

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', backgroundColor: '#111', color: '#fff', p: 4 }}>
      <audio ref={audioRef} src="/quepasa.mp3" preload="auto" />
      <audio ref={audioPerder} src='/perder.mp3' preload='auto' />

      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#f1c40f' }}>
        Ruleta Ganadora
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <motion.img
          src="/ruleta.webp"
          alt="ruleta"
          animate={spinning ? { rotate: 360 * 3 } : { rotate: 0 }}
          transition={{ duration: 3, ease: 'easeInOut' }}
          style={{ width: 200, height: 200, borderRadius: '50%' }}
        />
      </Box>

      <Grid container spacing={2} justifyContent="center" sx={{ maxWidth: 600, mx: 'auto', color: 'white' }}>
        {/* Campo de Monto a apostar */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            type="number"
            label="Monto a apostar"
            value={apuesta}
            onChange={(e) => setApuesta(e.target.value)}
            sx={{
              '& .MuiInputBase-root': { color: 'white' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' }
            }}
            InputLabelProps={{ style: { color: '#aaa' } }}
            InputProps={{
              inputProps: {
                min: 0,
              }
            }}
          />
        </Grid>

        {/* Selector de Color */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            label="Color (opcional)"
            value={color}
            sx={{
              '& .MuiInputBase-root': { color: 'white' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
              width: '250px'
            }}
            onChange={(e) => setColor(e.target.value)}
            InputLabelProps={{ style: { color: '#aaa' } }}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: {
                    bgcolor: '#424242',
                    '& .MuiMenuItem-root': {
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)'
                      }
                    }
                  }
                }
              }
            }}
          >
            <MenuItem value="">Sin color</MenuItem>
            {colors.map((c) => (
              <MenuItem key={c} value={c}>{c.toUpperCase()}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Campo de Número exacto */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            type="number"
            label="Número exacto (0-36, opcional)"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            sx={{
              '& .MuiInputBase-root': { color: 'white' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
              width: '250px'
            }}
            InputLabelProps={{ style: { color: '#aaa' } }}
            InputProps={{
              inputProps: {
                min: 0,
                max: 36,
              }
            }}
          />
        </Grid>

        {/* Botón de Apostar */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={playRoulette}
            disabled={spinning}
            sx={{
              fontWeight: 'bold',
              fontSize: '1.1rem',
              py: 1.5,
              textTransform: 'none',
              '&:hover': {
                transform: 'scale(1.01)',
                boxShadow: '0 0 10px rgba(76, 175, 80, 0.5)'
              }
            }}
          >
            {spinning ? 'Girando...' : 'Apostar y Ganar'}
          </Button>

        </Grid>

        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}

        {(result && showWinAnimation) && (
          <Grid item xs={12}>
            <Alert severity="success">
              Número ganador: <strong>{result.numeroGanador}</strong> — Color: <strong>{result.colorGanador}</strong><br />
              Resultado: <strong>{result.resultado.toUpperCase()}</strong><br />
              Ganancia: <strong>${result.montoGanado.toFixed(2)}</strong><br />
              Fondos simulados: ${result.fondosActuales.toFixed(2)}
            </Alert>
          </Grid>
        )}

        {(result && showLoseAnimation) && (
          <Grid item xs={12}>
            <Alert severity="error">
              Número ganador: <strong>{result.numeroGanador}</strong> — Color: <strong>{result.colorGanador}</strong><br />
              Resultado: <strong>{result.resultado.toUpperCase()}</strong><br />
              Ganancia: <strong>${result.montoGanado.toFixed(2)}</strong><br />
              Fondos simulados: ${result.fondosActuales.toFixed(2)}
            </Alert>
          </Grid>
        )}
      </Grid>

      <AnimatePresence>
        {showWinAnimation && (
          <>
            <motion.img
              src="/money.gif"
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ duration: 1 }}
              style={{
                position: 'fixed',
                top: 100,
                left: 0,
                width: '80%',
                zIndex: 1000
              }}
            />
            <motion.img
              src="/money.gif"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 1 }}
              style={{
                position: 'fixed',
                top: 100,
                right: 0,
                width: '80%',
                zIndex: 1000
              }}
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1.2 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'fixed',
                top: '40%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2000
              }}
            >
              <Typography variant="h2" sx={{
                fontWeight: 'bold',
                color: '#ffd700',
                textShadow: '0 0 20px #fff, 0 0 40px #ff0'
              }}>
                ¡Ganaste ${result?.montoGanado.toFixed(2)}!
              </Typography>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLoseAnimation && (
          <>
            <motion.img
              src="/lose.jpg"
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ duration: 1 }}
              style={{
                position: 'fixed',
                top: 100,
                left: 0,
                width: '30%',
                zIndex: 1000
              }}
            />
            <motion.img
              src="/lose.jpg"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 1 }}
              style={{
                position: 'fixed',
                top: 100,
                right: 0,
                width: '30%',
                zIndex: 1000
              }}
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1.2 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'fixed',
                top: '40%',
                left: '35%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1500
              }}
            >
              <Typography variant="h2" sx={{
                fontWeight: 'bold',
                color: '#ff0000ff',
                textShadow: '0 0 20px #fff, 0 0 40px #ff0'
              }}>
                ¡Perdiste ${apuesta}!
              </Typography>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {
        history.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h6" color="#f1c40f" gutterBottom>🧾 Últimas partidas:</Typography>
            {history.map((r, i) => (
              <Paper key={i} sx={{ p: 2, mb: 1, backgroundColor: '#222' }}>
                <Typography sx={{ color: '#ffffff' }}>
                  🎯 Número: {r.numeroGanador} | 🎨 Color: {r.colorGanador} | 💰 Resultado: {r.resultado} | Ganancia: ${r.montoGanado.toFixed(2)}
                </Typography>
              </Paper>
            ))}
          </Box>
        )
      }
    </Box >
  );
};

export default RouletteGame;
