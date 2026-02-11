
export interface Prize {
  id: number;
  label: string;
  isWin: boolean;
  color: string;
  amount?: number;
}

export enum AppState {
  IDLE = 'IDLE',
  SPINNING = 'SPINNING',
  RESULT = 'RESULT'
}

export type RigMode = 'ALWAYS_LOSE' | 'PROBABILITY' | 'FORCE_SPECIFIC';
