import type { AreaId } from './types';

export interface AssessmentItem {
  id: string;
  area: AreaId;
  statement: string;
}

export const ASSESSED_AREAS: AreaId[] = ['technique', 'serve-return', 'movement', 'tactics', 'fitness', 'mental', 'rules'];

export const ASSESSMENT: AssessmentItem[] = [
  { id: 't1', area: 'technique', statement: 'Мої драйви стабільно падають за квадратом подачі.' },
  { id: 't2', area: 'technique', statement: 'Я можу бити щільно біля бічної стіни і форхендом, і бекхендом.' },
  { id: 't3', area: 'technique', statement: 'Мої воллеї надійні з обох боків.' },
  { id: 't4', area: 'technique', statement: 'Я можу зіграти контрольований дроп, не влучаючи в тін.' },
  { id: 's1', area: 'serve-return', statement: 'Моя подача рідко дає суперникові легкий прийом.' },
  { id: 's2', area: 'serve-return', statement: 'Я можу прийняти добру подачу на довжину.' },
  { id: 'm1', area: 'movement', statement: 'Я повертаюся на Т після кожного удару.' },
  { id: 'm2', area: 'movement', statement: 'Я підбігаю до м\'яча в рівновазі й з готовою ракеткою.' },
  { id: 'm3', area: 'movement', statement: 'Я ефективно заходжу в задні кути й виходжу з них.' },
  { id: 'c1', area: 'tactics', statement: 'Я знаю, який удар грати, коли я під тиском.' },
  { id: 'c2', area: 'tactics', statement: 'Я свідомо змінюю висоту, темп і напрямок.' },
  { id: 'c3', area: 'tactics', statement: 'Я бачу слабкі місця суперника й користуюся ними.' },
  { id: 'f1', area: 'fitness', statement: 'Я можу зіграти важкий матч на п\'ять геймів і не «здутися».' },
  { id: 'f2', area: 'fitness', statement: 'Я швидко відновлююся між довгими розіграшами.' },
  { id: 'p1', area: 'mental', statement: 'Я зберігаю спокій після помилок чи невдалих рішень.' },
  { id: 'p2', area: 'mental', statement: 'Я виходжу на матч із чітким планом гри.' },
  { id: 'r1', area: 'rules', statement: 'Я знаю, коли просити лет і якого рішення чекати.' },
];

export const SCALE = [
  { value: 1, label: 'Рідко' },
  { value: 2, label: 'Іноді' },
  { value: 3, label: 'Часто' },
  { value: 4, label: 'Зазвичай' },
  { value: 5, label: 'Завжди' },
];
