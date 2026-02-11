
import React, { useEffect, useState, useMemo } from 'react';

interface ConfettiPiece {
  id: number;
  left: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
  widthRatio: number;
  swayAmount: number; // Intensidade do balanço lateral
}

const Confetti: React.FC = () => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const colors = [
      '#FFD700', '#FFA500', '#FF4500', '#FF1493', 
      '#00CED1', '#32CD32', '#1E90FF', '#FFFFFF'
    ];
    
    const newPieces = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5, // Delay curto para começar rápido
      duration: 2.5 + Math.random() * 2, // Duração variável para profundidade
      size: 6 + Math.random() * 8,
      widthRatio: 0.6 + Math.random() * 0.8,
      swayAmount: 20 + Math.random() * 40
    }));
    
    setPieces(newPieces);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[55]">
      <style>
        {`
          @keyframes confetti-sway {
            0% { transform: translateX(0px) rotate(0deg) rotateY(0deg); }
            25% { transform: translateX(var(--sway)) rotate(90deg) rotateY(180deg); }
            50% { transform: translateX(0px) rotate(180deg) rotateY(360deg); }
            75% { transform: translateX(calc(-1 * var(--sway))) rotate(270deg) rotateY(180deg); }
            100% { transform: translateX(0px) rotate(360deg) rotateY(0deg); }
          }
          @keyframes confetti-fall-organic {
            0% { top: -10%; opacity: 1; }
            100% { top: 110%; opacity: 0.6; }
          }
          .confetti-organic {
            position: absolute;
            animation: confetti-fall-organic var(--duration) linear forwards;
          }
          .confetti-inner {
            width: 100%;
            height: 100%;
            animation: confetti-sway var(--sway-duration) ease-in-out infinite;
            transform-style: preserve-3d;
          }
        `}
      </style>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-organic"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * p.widthRatio}px`,
            '--duration': `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          } as any}
        >
          <div 
            className="confetti-inner shadow-sm"
            style={{
              backgroundColor: p.color,
              '--sway': `${p.swayAmount}px`,
              '--sway-duration': `${1 + Math.random() * 2}s`,
              borderRadius: Math.random() > 0.5 ? '2px' : '50%',
            } as any}
          />
        </div>
      ))}
    </div>
  );
};

export default Confetti;
