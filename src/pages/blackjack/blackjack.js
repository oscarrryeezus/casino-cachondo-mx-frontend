import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Alert, Grid, Paper
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const valores = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11]; // J, Q, K = 10; A = 11 o 1
const palos = ['♠️', '♥️', '♦️', '♣️'];

const generarCarta = () => {
  const valor = valores[Math.floor(Math.random() * valores.length)];
  const palo = palos[Math.floor(Math.random() * palos.length)];
  return { valor, palo };
};

const calcularPuntaje = (cartas) => {
  let total = cartas.reduce((acc, c) => acc + c.valor, 0);
  let ases = cartas.filter(c => c.valor === 11).length;
  while (total > 21 && ases > 0) {
    total -= 10;
    ases--;
  }
  return total;
};

const userId = '688a8deb41a491a2ebb6b0cc'; // Cambia por el usuario autenticado real

const BlackjackGame = () => {
  const [jugador, setJugador] = useState([]);
  const [crupier, setCrupier] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [jugando, setJugando] = useState(false);
  const [ganador, setGanador] = useState('');
  const [apuesta, setApuesta] = useState('');
  const [fondos, setFondos] = useState(1000); // Puedes obtenerlo del backend en useEffect
  const [error, setError] = useState('');
  const audioWin = useRef(null);
  const audioLose = useRef(null);

  useEffect(() => {
    // Aquí podrías cargar los fondos actuales del usuario desde backend si quieres
    // Ejemplo:
    // axios.get(`/api/user/${userId}`).then(r => setFondos(r.data.fondos))
  }, []);

  const iniciarJuego = () => {
    setError('');
    const apuestaNum = parseFloat(apuesta);
    if (!apuesta || isNaN(apuestaNum) || apuestaNum <= 0) {
      setError('Ingresa un monto válido mayor a 0');
      return;
    }
    if (apuestaNum > fondos) {
      setError('No tienes fondos suficientes para esa apuesta');
      return;
    }
    const nuevasJugador = [generarCarta(), generarCarta()];
    const nuevasCrupier = [generarCarta()];
    setJugador(nuevasJugador);
    setCrupier(nuevasCrupier);
    setMensaje('');
    setGanador('');
    setJugando(true);
  };

  const pedirCarta = () => {
    const nuevaCarta = generarCarta();
    const nuevasCartas = [...jugador, nuevaCarta];
    const total = calcularPuntaje(nuevasCartas);
    setJugador(nuevasCartas);
    if (total > 21) {
      terminarJuego(nuevasCartas, crupier, true);
    }
  };

  const plantarse = async () => {
    let nuevasCrupier = [...crupier];
    while (calcularPuntaje(nuevasCrupier) < 17) {
      nuevasCrupier.push(generarCarta());
    }
    terminarJuego(jugador, nuevasCrupier);
  };

  const terminarJuego = async (cartasJugador, cartasCrupier, pierdePorPasarse = false) => {
    const puntosJugador = calcularPuntaje(cartasJugador);
    const puntosCrupier = calcularPuntaje(cartasCrupier);

    setJugador(cartasJugador);
    setCrupier(cartasCrupier);
    setJugando(false);

    let resultado = 'empate';
    if (pierdePorPasarse) {
      resultado = 'perdido';
      setMensaje('Te pasaste. ¡Perdiste!');
      setGanador('perdido');
      audioLose.current?.play();
    } else if (puntosCrupier > 21 || puntosJugador > puntosCrupier) {
      resultado = 'ganado';
      setMensaje('¡Ganaste!');
      setGanador('ganado');
      audioWin.current?.play();
    } else if (puntosJugador === puntosCrupier) {
      resultado = 'empate';
      setMensaje('Empate.');
      setGanador('empate');
    } else {
      resultado = 'perdido';
      setMensaje('El crupier gana. ¡Perdiste!');
      setGanador('perdido');
      audioLose.current?.play();
    }

    // Llamar backend para actualizar fondos
    try {
      const response = await axios.post('http://localhost:3001/api/blackjack/jugar', {
        userId,
        resultado,
        apuesta: parseFloat(apuesta)
      });
      setFondos(response.data.fondos);
    } catch (error) {
      setError('Error al actualizar fondos: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#1c1c1c', minHeight: '100vh', color: 'white' }}>
      <audio ref={audioWin} src="/quepasa.mp3" preload="auto" />
      <audio ref={audioLose} src="/perder.mp3" preload="auto" />

      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#f1c40f' }}>
        21 Blackjack
      </Typography>

      <Typography sx={{ textAlign: 'center', mb: 2 }}>
        Fondos disponibles: <strong>${fondos.toFixed(2)}</strong>
      </Typography>

      <TextField
        label="Monto a apostar"
        type="number"
        fullWidth
        value={apuesta}
        onChange={(e) => setApuesta(e.target.value)}
        inputProps={{ min: 0, max: fondos }}
        sx={{ mb: 3, input: { color: 'white' }, label: { color: '#aaa' } }}
      />

      <Grid container spacing={2} justifyContent="center" sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2, bgcolor: '#333' }}>
            <Typography variant="h6">🧑‍💼 Jugador</Typography>
            <Typography>Puntaje: {calcularPuntaje(jugador)}</Typography>
            <Box sx={{ mt: 1 }}>
              {jugador.map((c, i) => (
                <span key={i}>{c.valor}{c.palo} </span>
              ))}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2, bgcolor: '#333' }}>
            <Typography variant="h6">🎲 Crupier</Typography>
            <Typography>Puntaje: {jugando ? '?' : calcularPuntaje(crupier)}</Typography>
            <Box sx={{ mt: 1 }}>
              {crupier.map((c, i) => (
                <span key={i}>{c.valor}{c.palo} </span>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        {!jugando ? (
          <Button variant="contained" color="primary" onClick={iniciarJuego}>
            Comenzar Juego
          </Button>
        ) : (
          <>
            <Button variant="contained" color="success" onClick={pedirCarta} sx={{ mx: 1 }}>
              Pedir Carta
            </Button>
            <Button variant="contained" color="warning" onClick={plantarse} sx={{ mx: 1 }}>
              Plantarse
            </Button>
          </>
        )}
      </Box>

      {error && (
        <Box sx={{ mt: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {mensaje && (
        <Box sx={{ mt: 3 }}>
          <Alert severity={ganador === 'ganado' ? 'success' : ganador === 'perdido' ? 'error' : 'info'}>
            {mensaje}
          </Alert>
        </Box>
      )}

      <AnimatePresence>
        {ganador === 'ganado' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1.1 }}
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
              ¡Ganaste ${parseFloat(apuesta).toFixed(2)}!
            </Typography>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {ganador === 'perdido' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1.1 }}
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
              color: '#ff0000',
              textShadow: '0 0 20px #fff, 0 0 40px #f00'
            }}>
              ¡Perdiste ${parseFloat(apuesta).toFixed(2)}!
            </Typography>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default BlackjackGame;
