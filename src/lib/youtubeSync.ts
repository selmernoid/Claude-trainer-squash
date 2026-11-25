// Тримає на сторінці лише один YouTube-плеєр, що грає: коли один запускається, інші стають на паузу.
// Працює через postMessage-протокол YouTube IFrame API (потрібен enablejsapi=1 в URL вбудовування),
// без завантаження скрипта www.youtube.com/iframe_api.

const YT_ORIGIN = /^https:\/\/www\.youtube(-nocookie)?\.com$/;
const PLAYING = 1;

const frames = new Set<HTMLIFrameElement>();
const heard = new WeakSet<HTMLIFrameElement>();
let listening = false;

function post(frame: HTMLIFrameElement, message: object) {
  try {
    frame.contentWindow?.postMessage(JSON.stringify(message), '*');
  } catch {
    /* плеєр ще не готовий або вже прибраний */
  }
}

/** Ставить на паузу всі зареєстровані плеєри, крім `except`. */
export function pauseOthers(except?: HTMLIFrameElement) {
  for (const f of frames) if (f !== except) post(f, { event: 'command', func: 'pauseVideo', args: [] });
}

function onMessage(e: MessageEvent) {
  if (!YT_ORIGIN.test(e.origin)) return;
  const frame = [...frames].find((f) => f.contentWindow === e.source);
  if (!frame) return;
  heard.add(frame);
  let data: { event?: string; info?: unknown } | undefined;
  try {
    data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
  } catch {
    return;
  }
  const state =
    data?.event === 'onStateChange'
      ? data.info
      : data?.event === 'infoDelivery'
        ? (data.info as { playerState?: number } | undefined)?.playerState
        : undefined;
  if (state === PLAYING) pauseOthers(frame);
}

/**
 * Реєструє iframe плеєра. Повертає функцію для зняття реєстрації.
 * Після завантаження просимо плеєр повідомляти про зміни стану; повторюємо, доки він не відповість,
 * бо сам плеєр усередині iframe ініціалізується трохи пізніше за подію load.
 */
export function registerPlayer(frame: HTMLIFrameElement) {
  frames.add(frame);
  if (!listening) {
    window.addEventListener('message', onMessage);
    listening = true;
  }
  let tries = 0;
  let timer = 0;
  const hello = () => {
    if (heard.has(frame) || tries++ > 40 || !frames.has(frame)) return;
    post(frame, { event: 'listening', id: 1, channel: 'widget' });
    post(frame, { event: 'command', func: 'addEventListener', args: ['onStateChange'] });
    timer = window.setTimeout(hello, 250);
  };
  frame.addEventListener('load', hello);
  return () => {
    frames.delete(frame);
    window.clearTimeout(timer);
    frame.removeEventListener('load', hello);
  };
}
