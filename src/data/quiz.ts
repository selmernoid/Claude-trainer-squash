export interface QuizQuestion {
  id: string;
  scenario: string;
  options: string[];
  answer: number;
  explanation: string;
}

const LSN = ['Let', 'Stroke to the striker', 'No let'];

export const RULES_QUIZ: QuizQuestion[] = [
  {
    id: 'q-clear-effort',
    scenario:
      'Your opponent plays a loose drive and stands still on the T, blocking your direct path to the ball. You could easily have reached it and played a good shot. You stop and ask.',
    options: LSN,
    answer: 1,
    explanation:
      'The opponent did not make every effort to clear. When the non-striker fails to give direct access, the striker is awarded a stroke.',
  },
  {
    id: 'q-tried-to-clear',
    scenario:
      'Your opponent hits a decent drop and is genuinely trying to get out of your way, but you bump into them on the way to a ball you would have retrieved — not for a winner.',
    options: LSN,
    answer: 0,
    explanation:
      'The striker could have made a good return and the opponent was making every effort to clear, so it is a let — the rally is replayed.',
  },
  {
    id: 'q-unreachable',
    scenario:
      'Your opponent hits a perfect drop into the nick. You are deep in the back corner, brush past them on the way forward, and stop to ask for a let.',
    options: LSN,
    answer: 2,
    explanation:
      'You could not have reached the ball and made a good return, so there is no let — the opponent wins the rally.',
  },
  {
    id: 'q-minimal',
    scenario:
      'Your opponent\'s foot is slightly in your path but you could easily step around it without slowing down. You stop and ask for a let.',
    options: LSN,
    answer: 2,
    explanation:
      'Minimal interference that does not affect your access or swing is not grounds for a let. Play on.',
  },
  {
    id: 'q-ball-hits-opponent-direct',
    scenario:
      'You hit a straight drive that would have gone directly to the front wall, but it hits your opponent first. You had not turned and the shot was good.',
    options: LSN,
    answer: 1,
    explanation:
      'When the ball, travelling directly to the front wall, hits the opponent and the return would have been good, the striker wins a stroke.',
  },
  {
    id: 'q-ball-hits-opponent-side',
    scenario:
      'You play a boast that would have hit the side wall first and then the front wall, but it hits your opponent before reaching the side wall. It was not going to be a winner.',
    options: LSN,
    answer: 0,
    explanation:
      'If the ball would have hit another wall before the front wall, a let is played (unless it would have been a winning return, in which case it is a stroke).',
  },
  {
    id: 'q-turning',
    scenario:
      'You follow the ball around in the back corner ("turning") and your shot hits your opponent standing in the middle.',
    options: ['Let', 'Stroke to the striker', 'Stroke to the opponent'],
    answer: 2,
    explanation:
      'If the striker turns and then hits the opponent with the ball, the opponent wins the rally. If you turn and see your opponent in the way, stop and ask for a let instead of hitting.',
  },
  {
    id: 'q-playing-on',
    scenario:
      'Your opponent bumps you slightly; you carry on, play a weak shot, lose the rally, then ask for a let.',
    options: LSN,
    answer: 2,
    explanation:
      'If you play on through interference you accept it. You must stop and request a let at the time, not after seeing how the rally turns out.',
  },
  {
    id: 'q-broken-ball',
    scenario: 'In the middle of a rally the ball splits.',
    options: ['Let — replay the rally', 'Point to whoever hit last', 'Point to the server'],
    answer: 0,
    explanation: 'A ball that breaks during a rally results in a let; replace the ball and replay.',
  },
  {
    id: 'q-serve-line',
    scenario: 'Your serve lands exactly on the short line of the opposite back quarter.',
    options: ['Good serve', 'Fault — receiver wins the rally', 'Let — serve again'],
    answer: 1,
    explanation: 'Lines are out in squash. A serve touching the short line or half-court line is a fault and the receiver wins the rally.',
  },
  {
    id: 'q-serve-side-first',
    scenario: 'Your serve hits the side wall before reaching the front wall.',
    options: ['Good serve', 'Fault', 'Let'],
    answer: 1,
    explanation: 'The serve must hit the front wall directly. After that it may hit the side walls before landing.',
  },
  {
    id: 'q-score',
    scenario: 'The score is 10-10. What happens next?',
    options: ['Next point wins', 'A player must lead by two to win', 'First to 15'],
    answer: 1,
    explanation: 'In PAR-11 scoring a game at 10-10 continues until one player is two points ahead.',
  },
  {
    id: 'q-serve-box',
    scenario: 'You won the last rally as server, serving from the right box. Where do you serve next?',
    options: ['Right box again', 'Left box', 'Either — your choice'],
    answer: 1,
    explanation: 'A server who wins the rally alternates boxes. A new server (after hand-out) chooses either box.',
  },
];
