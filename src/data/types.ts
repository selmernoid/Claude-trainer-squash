export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Players = 'solo' | 'pairs' | 'group';

export type AreaId =
  | 'technique'
  | 'serve-return'
  | 'movement'
  | 'tactics'
  | 'fitness'
  | 'mental'
  | 'rules'
  | 'gear';

export interface Mistake {
  mistake: string;
  fix: string;
}

export interface Topic {
  id: string;
  title: string;
  level: Level;
  summary: string;
  keyPoints: string[];
  mistakes?: Mistake[];
  cues?: string[];
  drillIds?: string[];
}

export interface Area {
  id: AreaId;
  name: string;
  short: string;
  tagline: string;
  intro: string;
  color: string;
  topics: Topic[];
}

export interface Drill {
  id: string;
  name: string;
  areas: AreaId[];
  players: Players[];
  level: Level;
  minutes: number;
  summary: string;
  steps: string[];
  goal: string;
  progression?: string;
}

export const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced'];

export const levelRank = (l: Level) => LEVELS.indexOf(l);

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: 'Початківець',
  intermediate: 'Середній',
  advanced: 'Просунутий',
};

export const PLAYERS_LABEL: Record<Players, string> = {
  solo: 'Самостійно',
  pairs: 'У парі',
  group: 'Група (3+)',
};
