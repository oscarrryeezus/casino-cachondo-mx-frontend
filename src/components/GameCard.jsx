import React from 'react';
import { Card, CardMedia, CardContent, Typography, Button } from '@mui/material';

const GameCard = ({ title, image, onPlay }) => (
  <Card
    sx={{
      mb: 2,
      backgroundColor: '#1e1e1e',
      color: '#FFD700',
      boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0 0 20px #FFD700',
      },
    }}
  >
    <CardMedia component="img" height="140" image={image} alt={title} />
    <CardContent>
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        {title}
      </Typography>
      <Button
        variant="contained"
        fullWidth
        sx={{
          mt: 1,
          background: 'linear-gradient(45deg, #FFD700 30%, #FFA500 90%)',
          color: '#121212',
          fontWeight: 'bold',
          '&:hover': {
            background: 'linear-gradient(45deg, #FFA500 30%, #FFD700 90%)',
          },
        }}
        onClick={onPlay}
      >
        Jugar
      </Button>
    </CardContent>
  </Card>
);

export default GameCard;
