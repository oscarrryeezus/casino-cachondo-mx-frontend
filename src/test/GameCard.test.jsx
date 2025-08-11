import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GameCard from '../components/GameCard';

describe('GameCard', () => {
  const mockOnPlay = vi.fn();
  const defaultProps = {
    title: 'Poker',
    image: 'https://example.com/poker.png',
    onPlay: mockOnPlay,
  };

  beforeEach(() => {
    mockOnPlay.mockClear();
  });

  it('renderiza el título y la imagen correctamente', () => {
    render(<GameCard {...defaultProps} />);
    expect(screen.getByText('Poker')).toBeInTheDocument();
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', defaultProps.image);
    expect(img).toHaveAttribute('alt', defaultProps.title);
  });

  it('llama onPlay cuando se da click en el botón', () => {
    render(<GameCard {...defaultProps} />);
    const btn = screen.getByRole('button', { name: /jugar/i });
    fireEvent.click(btn);
    expect(mockOnPlay).toHaveBeenCalledTimes(1);
  });


  it('botón está presente aunque no haya onPlay', () => {
    render(<GameCard title="Test" image="img.png" />);
    expect(screen.getByRole('button', { name: /jugar/i })).toBeInTheDocument();
  });
});
