
import React, { useState, useCallback, useMemo } from 'react';
import RouletteWheel from './components/RouletteWheel';
import Confetti from './components/Confetti';
import { AppState, Prize, RigMode } from './types';
import { PRIZES, SPIN_DURATION } from './constants';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<Prize | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  // Configurações de Administração
  const [rigMode, setRigMode] = useState<RigMode>('ALWAYS_LOSE');
  const [winProbability, setWinProbability] = useState(5); // Padrão 5%
  const [targetPrizeId, setTargetPrizeId] = useState<number>(0); // R$ 10.000 padrão

  const toggleAdmin = () => setShowAdmin(!showAdmin);

  const winPrizes = useMemo(() => PRIZES.filter(p => p.isWin), []);
  const losePrizes = useMemo(() => PRIZES.filter(p => !p.isWin), []);

  const handleSpin = useCallback(() => {
    if (appState === AppState.SPINNING) return;

    setAppState(AppState.SPINNING);
    setResult(null);

    let selectedPrize: Prize;

    // LÓGICA DE SORTEIO
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
    
    const extraSpins = (8 + Math.floor(Math.random() * 5)) * 360;
    const sliceStartAngle = prizeIndex * angleStep;
    const randomOffsetInSlice = (0.15 + Math.random() * 0.7) * angleStep;
    const targetRotationWithinCircle = 360 - (sliceStartAngle + randomOffsetInSlice);
    const currentRotationOffset = rotation % 360;
    const rotationToTarget = (targetRotationWithinCircle - currentRotationOffset + 360) % 360;
    const finalRotation = rotation + extraSpins + rotationToTarget;

    setRotation(finalRotation);

    setTimeout(() => {
      setAppState(AppState.RESULT);
      setResult(selectedPrize);
    }, SPIN_DURATION + 200);
  }, [appState, rotation, rigMode, winProbability, targetPrizeId, winPrizes, losePrizes]);

  const reset = () => {
    setAppState(AppState.IDLE);
    setResult(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white overflow-hidden p-2">
      <div className="relative w-full max-w-[380px] aspect-[9/16] bg-gradient-to-b from-slate-900 to-black rounded-[3rem] border-[10px] border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Confetes agora dentro do frame do celular */}
        {appState === AppState.RESULT && result?.isWin && <Confetti />}

        {/* Top Header */}
        <div className="pt-10 pb-4 px-6 text-center shrink-0 z-10">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200 drop-shadow-md tracking-tighter uppercase italic text-nowrap">
            Giro da Sorte
          </h1>
          <p className="text-slate-500 text-[10px] mt-1 font-bold uppercase tracking-widest">Sua chance é agora!</p>
        </div>

        {/* Wheel Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-hidden z-10">
          <RouletteWheel 
            rotation={rotation} 
            onSpinClick={handleSpin} 
            isSpinning={appState === AppState.SPINNING} 
          />
          
          <div className="mt-8 h-20 flex items-center justify-center text-center">
            {appState === AppState.RESULT && result && (
              <div className="animate-in zoom-in duration-500">
                {result.isWin ? (
                  <div className="flex flex-col items-center">
                    <span className="text-yellow-400 text-xs font-bold uppercase tracking-[0.2em] mb-1">PARABÉNS!</span>
                    <span className="text-3xl font-black text-white drop-shadow-lg leading-none">
                      {result.label}
                    </span>
                    <button onClick={reset} className="mt-4 px-6 py-2 bg-yellow-500 rounded-full text-slate-900 text-sm font-black uppercase hover:bg-yellow-400 transition-all shadow-lg">
                      Resgatar Prêmio
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center opacity-80">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Tente outra vez</span>
                    <span className="text-xl font-black text-slate-200 uppercase">{result.label}</span>
                    <button onClick={reset} className="mt-4 px-5 py-1.5 bg-slate-800 rounded-full text-white text-xs font-bold uppercase hover:bg-slate-700 transition-all border border-slate-700">
                      Tentar Novamente
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center text-[9px] text-slate-600 uppercase font-bold tracking-widest shrink-0 z-10">
          Certificado de Segurança Gold
        </div>

        {/* Secret Admin Button */}
        <div className="absolute bottom-6 right-6 w-12 h-12 z-[70] cursor-default" onDoubleClick={toggleAdmin} />

        {/* Admin Panel Overlay */}
        {showAdmin && (
          <div className="absolute inset-0 z-[100] bg-slate-950 p-6 flex flex-col overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-yellow-500 uppercase italic">Controle da Roleta</h2>
              <button onClick={toggleAdmin} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-6 pb-10">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Modo de Operação</label>
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    onClick={() => setRigMode('ALWAYS_LOSE')}
                    className={`p-3 rounded-xl text-xs font-bold uppercase transition-all border ${rigMode === 'ALWAYS_LOSE' ? 'bg-red-600 border-red-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                  >
                    Sempre Perder
                  </button>
                  <button 
                    onClick={() => setRigMode('PROBABILITY')}
                    className={`p-3 rounded-xl text-xs font-bold uppercase transition-all border ${rigMode === 'PROBABILITY' ? 'bg-yellow-600 border-yellow-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                  >
                    Por Probabilidade (%)
                  </button>
                  <button 
                    onClick={() => setRigMode('FORCE_SPECIFIC')}
                    className={`p-3 rounded-xl text-xs font-bold uppercase transition-all border ${rigMode === 'FORCE_SPECIFIC' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                  >
                    Forçar Prêmio Específico
                  </button>
                </div>
              </div>

              {rigMode === 'PROBABILITY' && (
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex justify-between mb-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Chance de Ganhar</label>
                    <span className="text-yellow-500 font-black">{winProbability}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" 
                    value={winProbability}
                    onChange={(e) => setWinProbability(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                </div>
              )}

              {(rigMode === 'PROBABILITY' || rigMode === 'FORCE_SPECIFIC') && (
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Qual prêmio deve cair?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {winPrizes.map(p => (
                      <button 
                        key={p.id}
                        onClick={() => setTargetPrizeId(p.id)}
                        className={`p-2 rounded-lg text-[10px] font-black uppercase transition-all border ${targetPrizeId === p.id ? 'bg-slate-100 border-white text-slate-900' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button 
                onClick={toggleAdmin}
                className="w-full py-4 bg-white text-black font-black rounded-2xl uppercase text-xs tracking-widest hover:scale-[1.02] transition-all shadow-xl"
              >
                Salvar e Voltar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
