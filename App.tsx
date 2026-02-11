
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import RouletteWheel from './components/RouletteWheel.tsx';
import Confetti from './components/Confetti.tsx';
import { AppState, Prize, RigMode } from './types.ts';
import { PRIZES, SPIN_DURATION } from './constants.ts';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<Prize | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  const [rigMode, setRigMode] = useState<RigMode>('ALWAYS_LOSE');
  const [winProbability, setWinProbability] = useState(5); 
  const [targetPrizeId, setTargetPrizeId] = useState<number>(0);

  // Áudios com URLs mais estáveis e de carregamento rápido
  const winAudio = useRef<HTMLAudioElement | null>(null);
  const loseAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    winAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2018/success-fanfare-trumpets-618.wav');
    loseAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2017/fail-buzzer-01-655.wav');
    
    // Configurações de volume
    if (winAudio.current) winAudio.current.volume = 0.5;
    if (loseAudio.current) loseAudio.current.volume = 0.3;

    // Pré-carregamento
    winAudio.current?.load();
    loseAudio.current?.load();
  }, []);

  const toggleAdmin = () => setShowAdmin(!showAdmin);

  const winPrizes = useMemo(() => PRIZES.filter(p => p.isWin), []);
  const losePrizes = useMemo(() => PRIZES.filter(p => !p.isWin), []);

  const handleSpin = useCallback(() => {
    if (appState === AppState.SPINNING) return;

    // DESBLOQUEIO DE ÁUDIO PARA MOBILE
    // Tocamos e pausamos imediatamente para ganhar permissão do navegador
    if (winAudio.current) {
      winAudio.current.play().then(() => {
        winAudio.current?.pause();
        winAudio.current!.currentTime = 0;
      }).catch(() => {});
    }
    if (loseAudio.current) {
      loseAudio.current.play().then(() => {
        loseAudio.current?.pause();
        loseAudio.current!.currentTime = 0;
      }).catch(() => {});
    }

    setAppState(AppState.SPINNING);
    setResult(null);

    let selectedPrize: Prize;

    if (rigMode === 'ALWAYS_LOSE') {
      selectedPrize = losePrizes[Math.floor(Math.random() * losePrizes.length)];
    } else if (rigMode === 'FORCE_SPECIFIC') {
      selectedPrize = PRIZES.find(p => p.id === targetPrizeId) || losePrizes[0];
    } else {
      const roll = Math.random() * 100;
      if (roll <= winProbability) {
        selectedPrize = PRIZES.find(p => p.id === targetPrizeId) || winPrizes[0];
      } else {
        selectedPrize = losePrizes[Math.floor(Math.random() * losePrizes.length)];
      }
    }

    const angleStep = 360 / PRIZES.length;
    const prizeIndex = PRIZES.findIndex(p => p.id === selectedPrize.id);
    
    const extraSpins = (10 + Math.floor(Math.random() * 5)) * 360; // Mais voltas para drama
    const sliceStartAngle = prizeIndex * angleStep;
    const randomOffsetInSlice = (0.2 + Math.random() * 0.6) * angleStep;
    const targetRotationWithinCircle = 360 - (sliceStartAngle + randomOffsetInSlice);
    const currentRotationOffset = rotation % 360;
    const rotationToTarget = (targetRotationWithinCircle - currentRotationOffset + 360) % 360;
    const finalRotation = rotation + extraSpins + rotationToTarget;

    setRotation(finalRotation);

    setTimeout(() => {
      setAppState(AppState.RESULT);
      setResult(selectedPrize);
      
      if (selectedPrize.isWin) {
        winAudio.current?.play().catch(e => console.error("Win audio blocked", e));
      } else {
        loseAudio.current?.play().catch(e => console.error("Lose audio blocked", e));
      }
    }, SPIN_DURATION + 100);
  }, [appState, rotation, rigMode, winProbability, targetPrizeId, winPrizes, losePrizes]);

  const reset = () => {
    setAppState(AppState.IDLE);
    setResult(null);
    if (winAudio.current) { winAudio.current.pause(); winAudio.current.currentTime = 0; }
    if (loseAudio.current) { loseAudio.current.pause(); loseAudio.current.currentTime = 0; }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-slate-950 text-white overflow-hidden">
      <div className="relative w-full h-full sm:max-w-[400px] sm:h-[90vh] sm:rounded-[3.5rem] sm:border-[12px] border-slate-800 bg-gradient-to-b from-slate-900 to-black shadow-2xl overflow-hidden flex flex-col transition-all duration-500">
        
        {appState === AppState.RESULT && result?.isWin && <Confetti />}

        <div className="pt-14 pb-4 px-6 text-center shrink-0 z-10">
          <h1 className="text-4xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200 drop-shadow-md tracking-tighter uppercase italic">
            Giro da Sorte
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="w-8 h-[1px] bg-yellow-500/30"></span>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Sua chance é agora!</p>
            <span className="w-8 h-[1px] bg-yellow-500/30"></span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-hidden z-10">
          <div className="scale-[0.85] sm:scale-100 transition-transform">
            <RouletteWheel 
              rotation={rotation} 
              onSpinClick={handleSpin} 
              isSpinning={appState === AppState.SPINNING} 
            />
          </div>
          
          <div className="mt-10 h-28 flex items-center justify-center text-center px-6">
            {appState === AppState.RESULT && result && (
              <div className="animate-in zoom-in slide-in-from-bottom-4 duration-500">
                {result.isWin ? (
                  <div className="flex flex-col items-center">
                    <span className="text-yellow-400 text-xs font-black uppercase tracking-[0.3em] mb-2 animate-pulse">VOCÊ GANHOU!</span>
                    <span className="text-4xl sm:text-3xl font-black text-white drop-shadow-[0_0_20px_rgba(255,215,0,0.5)] leading-none">
                      {result.label}
                    </span>
                    <button onClick={reset} className="mt-6 px-10 py-4 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full text-slate-950 text-sm font-black uppercase shadow-[0_10px_20px_rgba(202,138,4,0.3)] active:scale-95 transition-all">
                      Resgatar Prêmio
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center opacity-90">
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2 italic">Não foi desta vez...</span>
                    <span className="text-2xl font-black text-slate-300 uppercase tracking-tighter">{result.label}</span>
                    <button onClick={reset} className="mt-6 px-8 py-3 bg-slate-800/50 rounded-full text-white text-xs font-bold uppercase hover:bg-slate-700 transition-all border border-white/10 active:scale-95">
                      Tentar Novamente
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="pb-12 pt-4 text-center z-10">
          <p className="text-[10px] text-slate-600 uppercase font-black tracking-[0.3em]">
            Certificado de Segurança Gold
          </p>
        </div>

        {/* Secret Admin Button */}
        <div className="absolute bottom-6 right-6 w-20 h-20 z-[70]" onDoubleClick={toggleAdmin} />

        {/* Admin Panel */}
        {showAdmin && (
          <div className="absolute inset-0 z-[100] bg-slate-950 p-6 flex flex-col animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-yellow-500 uppercase italic">Controle Master</h2>
              <button onClick={toggleAdmin} className="text-slate-400 p-2 text-2xl">✕</button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pb-10">
              <div className="bg-slate-900/50 p-5 rounded-3xl border border-white/5">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Estratégia</label>
                <div className="flex flex-col gap-3">
                  <button onClick={() => setRigMode('ALWAYS_LOSE')} className={`p-4 rounded-2xl text-xs font-black uppercase transition-all border ${rigMode === 'ALWAYS_LOSE' ? 'bg-red-600 border-red-400 text-white' : 'bg-slate-800 border-white/5 text-slate-500'}`}>Sempre Perder</button>
                  <button onClick={() => setRigMode('PROBABILITY')} className={`p-4 rounded-2xl text-xs font-black uppercase transition-all border ${rigMode === 'PROBABILITY' ? 'bg-yellow-600 border-yellow-400 text-white' : 'bg-slate-800 border-white/5 text-slate-500'}`}>Probabilidade</button>
                  <button onClick={() => setRigMode('FORCE_SPECIFIC')} className={`p-4 rounded-2xl text-xs font-black uppercase transition-all border ${rigMode === 'FORCE_SPECIFIC' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-800 border-white/5 text-slate-500'}`}>Forçar Prêmio</button>
                </div>
              </div>

              {rigMode === 'PROBABILITY' && (
                <div className="bg-slate-900/50 p-5 rounded-3xl border border-white/5 animate-in slide-in-from-top-2">
                  <div className="flex justify-between mb-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-nowrap">Taxa de Vitória</label>
                    <span className="text-yellow-500 font-black text-xl">{winProbability}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={winProbability} onChange={(e) => setWinProbability(parseInt(e.target.value))} className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"/>
                </div>
              )}

              {(rigMode === 'PROBABILITY' || rigMode === 'FORCE_SPECIFIC') && (
                <div className="bg-slate-900/50 p-5 rounded-3xl border border-white/5 animate-in slide-in-from-top-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Selecionar Prêmio Alvo</label>
                  <div className="grid grid-cols-2 gap-2">
                    {winPrizes.map(p => (
                      <button key={p.id} onClick={() => setTargetPrizeId(p.id)} className={`p-3 rounded-xl text-[10px] font-black uppercase transition-all border ${targetPrizeId === p.id ? 'bg-white text-slate-950 border-white' : 'bg-slate-800 border-white/5 text-slate-500'}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={toggleAdmin} className="w-full py-5 bg-yellow-500 text-slate-950 font-black rounded-3xl uppercase text-sm tracking-widest shadow-xl active:scale-95 transition-all">
                Salvar e Sair
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
