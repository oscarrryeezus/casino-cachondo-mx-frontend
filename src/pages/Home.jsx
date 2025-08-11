import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { Button, Box, Typography, IconButton } from '@mui/material';
import { ArrowBack, Casino, SportsEsports, PersonAdd } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // Carrusel automático
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 2);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isAuthenticated) {
    navigate('/ruleta');
    return null;
  }

  const slides = [
    {
      image: "/ruletaADD.avif",
      title: "Ruleta VIP",
      description: "Juega con los mejores dealers en vivo",
      icon: <Casino fontSize="large" />
    },
    {
      image: "/21.jpeg",
      title: "Blackjack 21",
      description: "Dobla tus ganancias con nuestras mesas exclusivas",
      icon: <SportsEsports fontSize="large" />
    }
  ];

  return (
    <Box sx={styles.container}>
      {/* Sección del Carrusel */}
      <Box sx={styles.carouselContainer}>
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={styles.carouselItem}
          >
            <Box 
              component="img" 
              src={slides[currentSlide].image} 
              alt={slides[currentSlide].title}
              sx={styles.carouselImage}
            />
            <Box sx={styles.caption}>
              <Box sx={styles.iconContainer}>
                {slides[currentSlide].icon}
              </Box>
              <Typography variant="h4" sx={styles.captionTitle}>
                {slides[currentSlide].title}
              </Typography>
              <Typography variant="body1" sx={styles.captionText}>
                {slides[currentSlide].description}
              </Typography>
            </Box>
            
            {/* Indicadores del carrusel */}
            <Box sx={styles.indicators}>
              {slides.map((_, index) => (
                <Box 
                  key={index}
                  sx={{
                    ...styles.indicator,
                    bgcolor: index === currentSlide ? '#FFD700' : 'rgba(255, 215, 0, 0.3)'
                  }}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>

     <Box sx={styles.formSection}>
        <Box sx={styles.formContainer}>
          <AnimatePresence mode='wait'>
            <motion.div
              key={showRegister ? 'register' : 'login'}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {!showRegister ? (
                <>
                  <LoginForm />
                  <Button
                    fullWidth
                    variant="outlined"
                    size="medium"
                    onClick={() => setShowRegister(true)}
                    startIcon={<PersonAdd />}
                    sx={styles.toggleButton}
                  >
                    Crear nuevo usuario
                  </Button>
                </>
              ) : (
                <>
                  <IconButton 
                    sx={styles.backButton} 
                    onClick={() => setShowRegister(false)}
                  >
                    <ArrowBack sx={{ color: '#FFD700' }} />
                  </IconButton>
                  <RegisterForm />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
};

// Estilos reutilizables
const styles = {
  container: {
    display: 'flex',
    minHeight: '100%',
    backgroundColor: '#000',
    color: '#fff',
    fontFamily: "'Cinzel', serif",
    overflow: 'auto',
    flexDirection: { xs: 'column', md: 'row' }
  },
  carouselContainer: {
    flex: 2,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '40px',
    background: 'radial-gradient(circle, #1a1a1a 0%, #000000 100%)',
    borderRight: '1px solid rgba(255, 215, 0, 0.3)',
    '@media (max-width: 900px)': {
      flex: 1,
      borderRight: 'none',
      borderBottom: '1px solid rgba(255, 215, 0, 0.3)'
    }
  },
  carouselItem: {
    position: 'relative',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '12px',
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.7
  },
  caption: {
    position: 'relative',
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: { xs: '15px', md: '30px' },
    borderRadius: '12px',
    maxWidth: { xs: '100%', md: '600px' },
    backdropFilter: 'blur(5px)',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    marginTop: { xs: '20px', md: 0 }
  },
  iconContainer: {
    color: '#FFD700',
    marginBottom: { xs: '10px', md: '20px' }
  },
  captionTitle: {
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: '10px',
    textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
  },
  captionText: {
    color: '#fff'
  },
  indicators: {
    position: 'absolute',
    bottom: { xs: '10px', md: '40px' },
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '10px',
    zIndex: 2
  },
  indicator: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  formSection: {
    flex: 1,
    background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: { xs: '20px', md: '40px' },
    overflow: 'auto'
  },
  formContainer: {
    width: '100%',
    maxWidth: { xs: '100%', md: '400px' },
    backgroundColor: 'rgba(34, 34, 34, 0.8)',
    padding: { xs: '20px', md: '40px' },
    borderRadius: '16px',
    boxShadow: '0 0 30px rgba(255, 215, 0, 0.2)',
    border: '1px solid rgba(255, 215, 0, 0.2)',
    backdropFilter: 'blur(5px)',
    position: 'relative'
  },
  toggleButton: {
    mt: 3,
    py: 1.5,
    borderColor: '#FFD700',
    color: '#FFD700',
    fontWeight: 'bold',
    borderRadius: '8px',
    '&:hover': {
      borderColor: '#FFA500',
      color: '#FFA500',
      backgroundColor: 'rgba(255, 215, 0, 0.08)'
    }
  },
  backButton: {
    position: 'absolute',
    top: '15px',
    left: '15px',
    '&:hover': {
      backgroundColor: 'rgba(255, 215, 0, 0.1)'
    }
  }
};

export default Home;