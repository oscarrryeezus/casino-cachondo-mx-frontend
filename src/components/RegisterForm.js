import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, TextField, Checkbox, FormControlLabel, Typography, 
  Alert, Button, CircularProgress, Link, InputAdornment 
} from '@mui/material';
import { Person, Email, Lock, HowToReg, Assignment, PrivacyTip } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', acceptTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const {login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Estilos reutilizables
  const styles = {
    container: {
      display: 'flex', flexDirection: 'column', gap: 3,
      maxWidth: '400px', margin: '0 auto', backgroundColor: '#1e1e1e',
      padding: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)'
    },
    title: {
      color: '#FFD700', fontWeight: 'bold', mb: 2,
      textShadow: '0 0 8px rgba(255, 215, 0, 0.5)'
    },
    input: (error) => ({
      color: 'white', borderRadius: 2,
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: error ? 'error.main' : '#FFD700',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: error ? 'error.main' : '#FFA500',
        borderWidth: '2px',
      },
    }),
    label: (error) => ({
      color: error ? 'error.main' : '#FFD700',
      '&.Mui-focused': { color: error ? 'error.main' : '#FFA500' }
    }),
    button: {
      mt: 2, py: 1.5, borderRadius: 2,
      background: 'linear-gradient(45deg, #FFD700 20%, #FFA500 80%)',
      color: '#121212', fontWeight: 'bold', fontSize: '1rem',
      boxShadow: '0 4px 6px rgba(255, 215, 0, 0.3)',
      '&:hover': {
        background: 'linear-gradient(45deg, #FFA500 20%, #FFD700 80%)',
        boxShadow: '0 6px 8px rgba(255, 165, 0, 0.4)',
        transform: 'translateY(-1px)',
      },
      '&:active': { transform: 'translateY(0)' },
      '&:disabled': { background: 'linear-gradient(45deg, #666 20%, #999 80%)' },
      transition: 'all 0.2s ease',
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nombre completo es requerido';
    else if (formData.name.length < 3) newErrors.name = 'Nombre debe tener al menos 3 caracteres';
    
    if (!formData.email) newErrors.email = 'Email es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email no válido';
    
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,:;#^_~\-+])[A-Za-z\d@$!%*?&.,:;#^_~\-+]{8,}$/;
    if (!formData.password) {
      newErrors.password = 'Contraseña es requerida';
    } else if (!passwordPattern.test(formData.password)) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, un número y un símbolo especial';
    }
    
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    if (!formData.acceptTerms) newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsSubmitting(true);
  try {
    const payload = {
      nombre:        formData.name,
      email:         formData.email,
      password:      formData.password,
    };

    await api.post('/usuario', payload);;
    setRegistrationSuccess(true);

    const { data } = await api.post('/auth/login', {
      email: formData.email,
      password: formData.password
    });
    login(data.token, data.user);
    navigate('/ruleta');

  } catch (err) {
    console.error(err);
    const message = err.response?.data?.message 
      || 'Error al registrar. Intenta nuevamente.';
    setErrors(prev => ({ ...prev, server: message }));
  } finally {
    setIsSubmitting(false);
  }
};


  const renderInput = (name, label, type = 'text', icon) => (
    <TextField
      label={label}
      name={name}
      type={type}
      value={formData[name]}
      onChange={handleChange}
      fullWidth
      variant="outlined"
      margin="normal"
      error={!!errors[name]}
      helperText={errors[name]}
      InputProps={{
        startAdornment: <InputAdornment position="start">{icon}</InputAdornment>,
        sx: styles.input(!!errors[name])
      }}
      InputLabelProps={{ sx: styles.label(!!errors[name]) }}
    />
  );

  if (registrationSuccess) {
    return (
      <Box sx={styles.container} textAlign="center" py={4}>
        <CircularProgress sx={{ color: '#FFD700', mb: 2 }} />
        <Typography variant="h6" sx={{ color: '#FFD700' }}>¡Registro exitoso!</Typography>
        <Typography variant="body2" sx={{ color: '#ccc' }}>Redirigiendo al casino...</Typography>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={styles.container}>
      <Typography variant="h4" align="center" sx={styles.title}>
        Regístrate en CachandoMX
      </Typography>

      {errors.server && <Alert severity="error" sx={{ borderRadius: 2, fontWeight: 'bold' }}>{errors.server}</Alert>}

      {renderInput('name', 'Nombre Completo', 'text', <Person sx={{ color: '#FFD700' }} />)}
      {renderInput('email', 'Email', 'email', <Email sx={{ color: '#FFD700' }} />)}
      {renderInput('password', 'Contraseña', 'password', <Lock sx={{ color: '#FFD700' }} />)}
      {renderInput('confirmPassword', 'Confirmar Contraseña', 'password', <Lock sx={{ color: '#FFD700' }} />)}

      <FormControlLabel
        control={
          <Checkbox
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleChange}
            sx={{ 
              color: errors.acceptTerms ? 'error.main' : '#FFD700',
              '&.Mui-checked': { color: '#FFA500' },
            }}
          />
        }
        label={
          <Typography variant="body2" sx={{ color: '#ccc' }}>
            Acepto los{' '}
            <Link href="/terminos" underline="hover" sx={{ color: '#FFD700', '&:hover': { color: '#FFA500' } }}>
              <Assignment fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              Términos
            </Link>{' '}
            y la{' '}
            <Link href="/privacidad" underline="hover" sx={{ color: '#FFD700', '&:hover': { color: '#FFA500' } }}>
              <PrivacyTip fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              Privacidad
            </Link>
          </Typography>
        }
      />
      {errors.acceptTerms && <Typography variant="caption" color="error" sx={{ ml: 6.5 }}>{errors.acceptTerms}</Typography>}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={isSubmitting}
        startIcon={!isSubmitting && <HowToReg />}
        sx={styles.button}
      >
        {isSubmitting ? (
          <>
            <CircularProgress size={22} sx={{ color: '#121212', mr: 1 }} />
            Registrando...
          </>
        ) : 'Crear Cuenta'}
      </Button>

      <Typography variant="caption" align="center" sx={{ color: '#ccc', mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        <svg height="16" width="16" viewBox="0 0 24 24" fill="#FFD700">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v2h-2V7zm0 4h2v6h-2v-6z"/>
        </svg>
        Al registrarte, confirmas que eres mayor de 18 años.
      </Typography>
    </Box>
  );
};

export default RegisterForm;