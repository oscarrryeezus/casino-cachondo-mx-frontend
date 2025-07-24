import React, { useState, useEffect } from 'react';
import { Box, MobileStepper, Button } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';

const images = ['/ruletaADD.avif', '/images/casino2.jpg'];

const Carousel = () => {
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = images.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prevStep) => (prevStep + 1) % maxSteps);
    }, 5000);
    return () => clearInterval(interval);
  }, [maxSteps]);

  return (
    <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
      <Box
        sx={{
          height: 400,
          backgroundImage: `url(${images[activeStep]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 0.5s ease-in-out',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        />
      </Box>
      <MobileStepper
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
        sx={{ backgroundColor: '#000', color: '#FFD700' }}
        nextButton={
          <Button size="small" onClick={() => setActiveStep((prev) => (prev + 1) % maxSteps)}>
            <KeyboardArrowRight sx={{ color: 'gold' }} />
          </Button>
        }
        backButton={
          <Button size="small" onClick={() => setActiveStep((prev) => (prev - 1 + maxSteps) % maxSteps)}>
            <KeyboardArrowLeft sx={{ color: 'gold' }} />
          </Button>
        }
      />
    </Box>
  );
};

export default Carousel;
