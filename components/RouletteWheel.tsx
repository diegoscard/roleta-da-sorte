
import React, { useMemo, useEffect, useRef } from 'react';
import { Prize } from '../types';
import { WHEEL_SIZE, PRIZES, SPIN_DURATION } from '../constants';

interface RouletteWheelProps {
  rotation: number;
  onSpinClick: () => void;
  isSpinning: boolean;
}

const RouletteWheel: React.FC<RouletteWheelProps> = ({ rotation, onSpinClick, isSpinning }) => {
  const radius = WHEEL_SIZE / 2;
  const angleStep = 360 / PRIZES.length;
  const sliceRadius = radius - 5;
  
  const wheelRef = useRef<HTMLDivElement>(null);
  const lastTickAngle = useRef<number>(0);
  const audioCtx = useRef<AudioContext | null>(null);

  // Inicializa o contexto de áudio no primeiro toque
  const initAudio = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  // Função para sintetizar o som de "tick" (pino batendo)
  const playTick = () => {
    if (!audioCtx.current) return;
    const ctx = audioCtx.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square'; // Som mais percussivo
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  };

  // Monitora a rotação para disparar os ticks
  useEffect(() => {
    if (!isSpinning) return;

    let animationFrame: number;
    
    const checkTick = () => {
      if (!wheelRef.current) return;
      
      // Captura a rotação atual da animação CSS
      const style = window.getComputedStyle(wheelRef.current);
      const matrix = new DOMMatrixReadOnly(style.transform);
      const angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
      const normalizedAngle = (angle < 0 ? angle + 360 : angle);
      
      // Se cruzou a fronteira de uma fatia, toca o som
      const currentSegment = Math.floor(normalizedAngle / angleStep);
      const lastSegment = Math.floor(lastTickAngle.current / angleStep);
      
      if (currentSegment !== lastSegment) {
        playTick();
        lastTickAngle.current = normalizedAngle;
      }
      
      animationFrame = requestAnimationFrame(checkTick);
    };

    animationFrame = requestAnimationFrame(checkTick);
    return () => cancelAnimationFrame(animationFrame);
  }, [isSpinning, angleStep]);

  const segments = useMemo(() => {
    return PRIZES.map((prize, index) => {
      const startAngle = index * angleStep;
      const endAngle = (index + 1) * angleStep;
      
      const x1 = radius + sliceRadius * Math.cos((Math.PI * (startAngle - 90)) / 180);
      const y1 = radius + sliceRadius * Math.sin((Math.PI * (startAngle - 90)) / 180);
      const x2 = radius + sliceRadius * Math.cos((Math.PI * (endAngle - 90)) / 180);
      const y2 = radius + sliceRadius * Math.sin((Math.PI * (endAngle - 90)) / 180);

      const largeArcFlag = angleStep > 180 ? 1 : 0;
      const pathData = `M ${radius} ${radius} L ${x1} ${y1} A ${sliceRadius} ${sliceRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      return {
        ...prize,
        pathData,
        midAngle: startAngle + angleStep / 2,
      };
    });
  }, [radius, sliceRadius, angleStep]);

  const handleButtonClick = () => {
    initAudio();
    onSpinClick();
  };

  return (
    <div className="relative flex items-center justify-center p-4 select-none">
      {/* Pointer (Seta Superior Fixa) */}
      <div className="absolute top-0 z-30 -translate-y-1/2 drop-shadow-md">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <path d="M20 40L5 10H35L20 40Z" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
          <circle cx="20" cy="10" r="5" fill="#ffffff" />
        </svg>
      </div>

      {/* Main Wheel Container */}
      <div 
        ref={wheelRef}
        className="relative flex-shrink-0 flex items-center justify-center rounded-full bg-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.6)]"
        style={{ 
          width: WHEEL_SIZE, 
          height: WHEEL_SIZE,
          transform: `rotate(${rotation}deg)`,
          transition: `transform ${SPIN_DURATION}ms cubic-bezier(0.1, 0, 0, 1)`,
          willChange: 'transform'
        }}
      >
        <svg 
          width={WHEEL_SIZE} 
          height={WHEEL_SIZE} 
          viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
          className="block overflow-visible"
        >
          {segments.map((seg) => (
            <g key={seg.id}>
              <path d={seg.pathData} fill={seg.color} stroke="#ffffff11" strokeWidth="0.5" />
              <g transform={`rotate(${seg.midAngle}, ${radius}, ${radius})`}>
                <text
                  x={radius}
                  y={radius - sliceRadius * 0.5} 
                  transform={`rotate(90, ${radius}, ${radius - sliceRadius * 0.5})`}
                  fill={seg.isWin ? "#1e293b" : "#f1f5f9"}
                  fontSize="10"
                  fontWeight="900"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="uppercase tracking-tighter"
                >
                  {seg.label}
                </text>
              </g>
            </g>
          ))}
          
          <circle 
            cx={radius} 
            cy={radius} 
            r={sliceRadius} 
            fill="none" 
            stroke="#ca8a04" 
            strokeWidth="8" 
          />
          
          <circle cx={radius} cy={radius} r={radius * 0.18} fill="#ca8a04" />
          <circle cx={radius} cy={radius} r={radius * 0.14} fill="#854d0e" />
        </svg>
      </div>

      {/* Center Button */}
      <button
        onClick={handleButtonClick}
        disabled={isSpinning}
        className={`absolute z-40 w-24 h-24 rounded-full flex flex-col items-center justify-center text-center font-black transition-all transform active:scale-95 shadow-[0_0_30px_rgba(0,0,0,0.4)] border-4 border-yellow-400
          ${isSpinning 
            ? 'bg-slate-700 cursor-not-allowed text-slate-400 border-slate-600' 
            : 'bg-gradient-to-br from-red-500 via-red-600 to-red-800 text-white hover:scale-105 active:brightness-90 animate-pulse'
          }`}
      >
        <span className="text-[10px] uppercase tracking-widest leading-none opacity-90">Giro da</span>
        <span className="text-lg uppercase tracking-tighter">Sorte</span>
      </button>
    </div>
  );
};

export default RouletteWheel;
