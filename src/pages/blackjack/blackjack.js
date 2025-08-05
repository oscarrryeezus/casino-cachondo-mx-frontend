import React, { useState, useRef, useEffect } from 'react';

import {
  Box, Typography, Button, TextField, Alert, Grid
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { getUser } from '../../services/auth';

const valores = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 11];
const palos = ['\u2660\ufe0f', '\u2665\ufe0f', '\u2666\ufe0f', '\u2663\ufe0f'];

const valorPuntaje = (valor) => {
  if (valor === 'J' || valor === 'Q' || valor === 'K') return 10;
  if (valor === 11) return 11;
  return valor;
};

const generarCarta = () => {
  const valor = valores[Math.floor(Math.random() * valores.length)];
  const palo = palos[Math.floor(Math.random() * palos.length)];
  return { valor, palo, puntaje: valorPuntaje(valor) };
};

const calcularPuntaje = (cartas) => {
  let total = cartas.reduce((acc, c) => acc + c.puntaje, 0);
  let ases = cartas.filter(c => c.valor === 11).length;
  while (total > 21 && ases > 0) {
    total -= 10;
    ases--;
  }
  return total;
};


const paloColor = (palo) => {
  // Corazones y diamantes en rojo, picas y tréboles en negro
  return palo === '\u2665' || palo === '\u2666' ? '#e60000' : '#000000';
};

const Carta = ({ valor, palo }) => {
  const textoValor = valor === 11 ? 'A' : valor;
  const textoFinal = valor === 'J' || valor === 'Q' || valor === 'K' ? valor : textoValor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'inline-block',
        width: 80,
        height: 120,
        backgroundColor: 'white',
        borderRadius: 12,
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        margin: '0 6px',
        position: 'relative',
        userSelect: 'none',
        fontFamily: "'Georgia', serif",
        border: `2px solid ${paloColor(palo)}`,
        color: paloColor(palo),
        cursor: 'default',
      }}
    >
      {/* Valor y símbolo arriba izquierda */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          fontSize: 20,
          fontWeight: 'bold',
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        {textoFinal}
        <br />
        <span style={{ fontSize: 22 }}>{palo}</span>
      </Box>

      {/* Valor y símbolo abajo derecha */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          fontSize: 20,
          fontWeight: 'bold',
          lineHeight: 1,
          userSelect: 'none',
          transform: 'rotate(180deg)',
        }}
      >
        {textoFinal}
        <br />
        <span style={{ fontSize: 22 }}>{palo}</span>
      </Box>

      {/* Símbolo grande centrado */}
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 50,
          opacity: 0.15,
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {palo}
      </Box>
    </motion.div>
  );
};

const BlackjackGame = () => {
  const [jugador, setJugador] = useState([]);
  const [crupier, setCrupier] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [jugando, setJugando] = useState(false);
  const [ganador, setGanador] = useState('');
  const [apuesta, setApuesta] = useState('');
  const [fondos, setFondos] = useState(1000);
  const [error, setError] = useState('');
  const audioWin = useRef(null);
  const audioLose = useRef(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const usuarioGuardado = getUser();
    if (usuarioGuardado) {
      setUser(usuarioGuardado);
    }
  }, []);


  useEffect(() => {
    const obtenerFondos = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/usuarios/${user.id}/fondos`);
        setFondos(response.data.fondos);
      } catch (err) {
        console.error("Error al obtener fondos:", err);
        setError("No se pudieron obtener los fondos del usuario.");
      }
    };

    if (user?.id) {
      obtenerFondos();
    }
  }, [user]);

  useEffect(() => {
    if (ganador) {
      const timer = setTimeout(() => {
        setGanador(''); // Oculta las imágenes
      }, 5000); // 5 segundos

      return () => clearTimeout(timer);
    }
  }, [ganador]);

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

    try {
      const response = await axios.post('http://localhost:3001/api/blackjack/jugar', {
        userId: user.id,
        resultado,
        apuesta: parseFloat(apuesta)
      });
      setFondos(response.data.fondos);
    } catch (error) {
      setError('Error al actualizar fondos: ' + (error.response?.data?.message || error.message));
    }
  };

  if (!user) return <Typography>Cargando usuario...</Typography>;

  return (
    <Box sx={{ p: 4, bgcolor: '#1c1c1c', minHeight: '100vh', color: 'white' }}>
      <audio ref={audioWin} src="/quepasa.mp3" preload="auto" />
      <audio ref={audioLose} src="/perder.mp3" preload="auto" />

      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#f1c40f' }}>
        21 Blackjack
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        {mensaje && (
          <Alert
            severity={
              ganador === 'ganado'
                ? 'success'
                : ganador === 'perdido'
                  ? 'error'
                  : ganador === 'error'
                    ? 'warning'
                    : 'info'
            }
            sx={{ width: '100%', maxWidth: 500 }}
          >
            {mensaje}
          </Alert>
        )}
      </Box>

      <Typography variant="h6" align="center" sx={{ mt: 1 }}>
        Fondos: ${fondos}
      </Typography>

      {/* Cartas de ejemplo al inicio */}
      {!jugando && jugador.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 2,
            mb: 3,
          }}
        >
          {[{ valor: 10, palo: '\u2665\ufe0f' }, { valor: 'J', palo: '\u2663\ufe0f' }].map((c, i) => (
            <Carta key={i} valor={c.valor} palo={c.palo} />
          ))}
        </Box>
      )}
      {/* Zona cartas con crupier arriba - solo se muestra si se está jugando o hay cartas */}
      {/* Zona cartas con crupier arriba - solo se muestra si se está jugando o hay cartas */}
      {(jugando || jugador.length > 0) && (
        <Box sx={{ position: 'relative', width: '100%', maxWidth: 700, margin: '0 auto', height: 360 }}>
          {/* Etiqueta Crupier */}
          <Typography
            sx={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#4da6ff',
              fontWeight: 'bold',
              zIndex: 3,
              userSelect: 'none',
            }}
          >
            Crupier
          </Typography>

          {/* Cartas Crupier */}
          <Box sx={{
            position: 'absolute',
            top: 30,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            justifyContent: 'center',
            zIndex: 2,
          }}>
            <AnimatePresence>
              {crupier.map((c, i) => (
                <Carta key={i} valor={c.valor} palo={c.palo} />
              ))}
            </AnimatePresence>
          </Box>

          {/* Contador de puntos del crupier (debajo de sus cartas) */}
          {crupier.length > 0 && (
            <Typography
              variant="h6"
              sx={{
                position: 'absolute',
                top: 160,
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#4da6ff',
                fontWeight: 'bold',
                zIndex: 3
              }}
            >
              Puntos: {calcularPuntaje(crupier)}
            </Typography>
          )}

          {/* Etiqueta Jugador */}
          <Typography
            sx={{
              position: 'absolute',
              bottom: 130,
              left: '50%',
              transform: 'translateX(-50%)',
              fontWeight: 'bold',
              userSelect: 'none',
              color: 'white',
              zIndex: 3,
            }}
          >
            Jugador
          </Typography>

          {/* Cartas Jugador */}
          <Box sx={{
            position: 'absolute',
            bottom: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            justifyContent: 'center',
            zIndex: 1,
          }}>
            <AnimatePresence>
              {jugador.map((c, i) => (
                <Carta key={i} valor={c.valor} palo={c.palo} />
              ))}
            </AnimatePresence>
          </Box>

          {/* Contador de puntos del jugador */}
          {jugador.length > 0 && (
            <Typography
              variant="h6"
              sx={{
                position: 'absolute',
                bottom: -20,
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#00e676',
                fontWeight: 'bold',
                zIndex: 3
              }}
            >
              Puntos: {calcularPuntaje(jugador)}
            </Typography>
          )}
        </Box>
      )}

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Grid container spacing={2} justifyContent="center" alignItems="center">
          <Grid item>
            <TextField
              type="number"
              variant="outlined"
              size="small"
              value={apuesta}
              onChange={(e) => setApuesta(Number(e.target.value))}
              label="Apuesta"
              InputProps={{ inputProps: { min: 0 }, sx: { color: 'white' } }}
              InputLabelProps={{ sx: { color: 'white' } }}
              sx={{ width: 120 }}
            />
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" onClick={iniciarJuego}>
              Apostar
            </Button>
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

        <AnimatePresence>
          {ganador === 'ganado' && (
            <>
              <motion.img
                src="/money.gif"
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '-100%', opacity: 0 }}
                transition={{ duration: 1 }}
                style={{ position: 'fixed', top: 100, left: 0, width: '80%', zIndex: 1000, pointerEvents: 'none' }}
              />
              <motion.img
                src="/money.gif"
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ duration: 1 }}
                style={{ position: 'fixed', top: 100, right: 0, width: '80%', zIndex: 1000, pointerEvents: 'none' }}
              />
            </>
          )}

          {ganador === 'perdido' && (
            <>
              <motion.img
                src="/lose.jpg"
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '-100%', opacity: 0 }}
                transition={{ duration: 1 }}
                style={{ position: 'fixed', top: 100, left: 0, width: '30%', zIndex: 1000, pointerEvents: 'none' }}
              />
              <motion.img
                src="/lose.jpg"
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ duration: 1 }}
                style={{ position: 'fixed', top: 100, right: 0, width: '30%', zIndex: 1000, pointerEvents: 'none' }}
              />
            </>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default BlackjackGame;
