
import React, { useMemo, useEffect, useRef } from 'react';
import { Prize } from '../types.ts';
import { WHEEL_SIZE, PRIZES, SPIN_DURATION } from '../constants.ts';

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
  const lastSegment = useRef<number>(-1);
  const audioCtx = useRef<AudioContext | null>(null);

  // Inicializa e resume o contexto de áudio
  const initAudio = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.current.state === 'suspended') {
      audioCtx.current.resume();
    }
  };

  const playTick = () => {
    if (!audioCtx.current) return;
    const ctx = audioCtx.current;
    
    // Pequeno buffer para garantir que o contexto está ativo
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle'; 
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  };

  useEffect(() => {
    if (!isSpinning) {
      lastSegment.current = -1;
      return;
    }

    let animationFrame: number;
    
    const checkTick = () => {
      if (!wheelRef.current) return;
      
      const style = window.getComputedStyle(wheelRef.current);
      const matrix = new DOMMatrixReadOnly(style.transform);
      const angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
      const normalizedAngle = (360 - (angle < 0 ? angle + 360 : angle)) % 360;
      
      const currentSegmentIndex = Math.floor(normalizedAngle / angleStep);
      
      if (currentSegmentIndex !== lastSegment.current) {
        playTick();
        lastSegment.current = currentSegmentIndex;
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

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    initAudio();
    onSpinClick();
  };

  return (
    <div className="relative flex items-center justify-center p-4 select-none touch-none">
      {/* Pointer */}
      <div className="absolute top-0 z-30 -translate-y-1/2 drop-shadow-md">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <path d="M20 40L5 10H35L20 40Z" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
          <circle cx="20" cy="10" r="5" fill="#ffffff" />
        </svg>
      </div>

      <div 
        ref={wheelRef}
        className="relative flex-shrink-0 flex items-center justify-center rounded-full bg-slate-900 shadow-[0_0_60px_rgba(0,0,0,0.8)]"
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
              <path d={seg.pathData} fill={seg.color} stroke="#ffffff22" strokeWidth="1" />
              <g transform={`rotate(${seg.midAngle}, ${radius}, ${radius})`}>
                <text
                  x={radius}
                  y={radius - sliceRadius * 0.55} 
                  transform={`rotate(90, ${radius}, ${radius - sliceRadius * 0.55})`}
                  fill={seg.isWin ? "#1e293b" : "#f8fafc"}
                  fontSize="11"
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
          
          <circle cx={radius} cy={radius} r={sliceRadius} fill="none" stroke="#ca8a04" strokeWidth="8" />
          <circle cx={radius} cy={radius} r={radius * 0.22} fill="#ca8a04" />
          <circle cx={radius} cy={radius} r={radius * 0.16} fill="#854d0e" />
        </svg>
      </div>

      <button
        onClick={handleButtonClick}
        disabled={isSpinning}
        className={`absolute z-40 w-24 h-24 rounded-full flex flex-col items-center justify-center text-center font-black transition-all transform active:scale-90 shadow-[0_0_40px_rgba(239,68,68,0.4)] border-4 border-yellow-400
          ${isSpinning 
            ? 'bg-slate-800 cursor-not-allowed text-slate-500 border-slate-700' 
            : 'bg-gradient-to-br from-red-500 via-red-600 to-red-800 text-white hover:scale-105 animate-pulse'
          }`}
      >
        <span className="text-[10px] uppercase tracking-widest leading-none opacity-90">Giro da</span>
        <span className="text-xl uppercase tracking-tighter">Sorte</span>
      </button>
    </div>
  );
};

export default RouletteWheel;
