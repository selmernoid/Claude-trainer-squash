// Допоміжні функції для української мови.

/** Вибирає форму слова за числом: plural(5, ['вправа', 'вправи', 'вправ']) → 'вправ'. */
export function plural(n: number, forms: [one: string, few: string, many: string]): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last === 1) return forms[0];
  if (last >= 2 && last <= 4) return forms[1];
  return forms[2];
}

/** «5 вправ», «1 вправа», «3 вправи». */
export const count = (n: number, forms: [string, string, string]) => `${n} ${plural(n, forms)}`;

export const formatDate = (iso: string | number | Date) => new Date(iso).toLocaleDateString('uk-UA');
