
import { Prize } from './types';

export const PRIZES: Prize[] = [
  { id: 0, label: 'R$ 10.000', isWin: true, color: '#FACC15', amount: 10000 },
  { id: 1, label: 'NÃO FOI DESSA VEZ', isWin: false, color: '#334155' },
  { id: 2, label: 'R$ 500', isWin: true, color: '#EAB308', amount: 500 },
  { id: 3, label: 'NÃO FOI DESSA VEZ', isWin: false, color: '#334155' },
  { id: 4, label: 'R$ 5.000', isWin: true, color: '#FACC15', amount: 5000 },
  { id: 5, label: 'NÃO FOI DESSA VEZ', isWin: false, color: '#334155' },
  { id: 6, label: 'R$ 100', isWin: true, color: '#EAB308', amount: 100 },
  { id: 7, label: 'NÃO FOI DESSA VEZ', isWin: false, color: '#334155' },
  { id: 8, label: 'R$ 1.000', isWin: true, color: '#FACC15', amount: 1000 },
  { id: 9, label: 'NÃO FOI DESSA VEZ', isWin: false, color: '#334155' },
  { id: 10, label: 'R$ 50', isWin: true, color: '#EAB308', amount: 50 },
  { id: 11, label: 'NÃO FOI DESSA VEZ', isWin: false, color: '#334155' },
];

export const WHEEL_SIZE = 340;
export const SPIN_DURATION = 5000; // Aumentado para 5 segundos
