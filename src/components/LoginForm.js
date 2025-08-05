import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Box, Alert, InputAdornment,CircularProgress } from '@mui/material';
import { Email, Lock } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { saveToken, saveUser } from '../services/auth';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor ingresa email y contraseña');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      login(token, userData);
      saveUser(userData)
      saveToken(token)
      console.log(userData)
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Ocurrió un error al iniciar sesión';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        maxWidth: '400px',
        margin: '0 auto',
        backgroundColor: '#1e1e1e',
        padding: 4,
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)',
        color: 'white',
      }}
    >
      <Typography 
        variant="h4" 
        align="center" 
        sx={{ 
          color: '#FFD700', 
          fontWeight: 'bold',
          mb: 2,
          textShadow: '0 0 8px rgba(255, 215, 0, 0.5)'
        }}
      >
        Inicia Sesión
      </Typography>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 2,
            fontWeight: 'bold'
          }}
        >
          {error}
        </Alert>
      )}
      
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        variant="outlined"
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Email sx={{ color: '#FFD700' }} />
            </InputAdornment>
          ),
          sx: { 
            color: 'white',
            borderRadius: 2,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#FFD700',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#FFA500',
              borderWidth: '2px',
            },
          }
        }}
        InputLabelProps={{ 
          sx: { 
            color: '#FFD700',
            '&.Mui-focused': {
              color: '#FFA500',
            }
          } 
        }}
      />
      
      <TextField
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        variant="outlined"
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock sx={{ color: '#FFD700' }} />
            </InputAdornment>
          ),
          sx: { 
            color: 'white',
            borderRadius: 2,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#FFD700',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#FFA500',
              borderWidth: '2px',
            },
          }
        }}
        InputLabelProps={{ 
          sx: { 
            color: '#FFD700',
            '&.Mui-focused': {
              color: '#FFA500',
            }
          } 
        }}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : null}
        sx={{
          mt: 2,
          py: 1.5,
          background: 'linear-gradient(45deg, #FFD700 20%, #FFA500 80%)',
          color: '#121212',
          fontWeight: 'bold',
          fontSize: '1rem',
          borderRadius: 2,
          boxShadow: '0 4px 6px rgba(255, 215, 0, 0.3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #FFA500 20%, #FFD700 80%)',
            boxShadow: '0 6px 8px rgba(255, 165, 0, 0.4)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
          transition: 'all 0.2s ease',
        }}
      >
        Ingresar
      </Button>
      
    </Box>
  );
};

export default LoginForm;