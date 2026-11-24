import type { AreaId } from './types';

export interface AssessmentItem {
  id: string;
  area: AreaId;
  statement: string;
}

export const ASSESSED_AREAS: AreaId[] = ['technique', 'serve-return', 'movement', 'tactics', 'fitness', 'mental', 'rules'];

export const ASSESSMENT: AssessmentItem[] = [
  { id: 't1', area: 'technique', statement: 'My drives consistently land behind the service box.' },
  { id: 't2', area: 'technique', statement: 'I can hit tight to the side wall on both forehand and backhand.' },
  { id: 't3', area: 'technique', statement: 'My volleys are reliable on both sides.' },
  { id: 't4', area: 'technique', statement: 'I can play a controlled drop shot without hitting the tin.' },
  { id: 's1', area: 'serve-return', statement: 'My serve rarely gives my opponent an easy return.' },
  { id: 's2', area: 'serve-return', statement: 'I can return a good serve to length.' },
  { id: 'm1', area: 'movement', statement: 'I get back to the T after every shot.' },
  { id: 'm2', area: 'movement', statement: 'I arrive at the ball balanced with my racket ready.' },
  { id: 'm3', area: 'movement', statement: 'I move efficiently into and out of the back corners.' },
  { id: 'c1', area: 'tactics', statement: 'I know what shot to play when I\'m under pressure.' },
  { id: 'c2', area: 'tactics', statement: 'I vary height, pace and direction on purpose.' },
  { id: 'c3', area: 'tactics', statement: 'I can spot and exploit my opponent\'s weaknesses.' },
  { id: 'f1', area: 'fitness', statement: 'I can play a hard five-game match without fading.' },
  { id: 'f2', area: 'fitness', statement: 'I recover quickly between long rallies.' },
  { id: 'p1', area: 'mental', statement: 'I stay composed after errors or bad decisions.' },
  { id: 'p2', area: 'mental', statement: 'I go into matches with a clear game plan.' },
  { id: 'r1', area: 'rules', statement: 'I know when to ask for a let and what decision to expect.' },
];

export const SCALE = [
  { value: 1, label: 'Rarely' },
  { value: 2, label: 'Sometimes' },
  { value: 3, label: 'Often' },
  { value: 4, label: 'Usually' },
  { value: 5, label: 'Always' },
];
