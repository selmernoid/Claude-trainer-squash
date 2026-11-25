import { Link } from 'react-router-dom';
import { ALL_TOPICS, AREAS } from '../data/areas';
import { Court } from '../components/Court';
import { VideoCard } from '../components/Video';
import { COLLECTIONS, VIDEOS } from '../data/videos';
import { readStore, STORE_KEYS } from '../lib/storage';
import { count, formatDate } from '../lib/uk';
import type { SavedAssessment } from './Assess';
import { lowestAreas } from './Assess';

const dayNumber = () => Math.floor(Date.now() / 86_400_000);

function tipOfTheDay() {
  const tips = ALL_TOPICS.flatMap(({ area, topic }) => topic.keyPoints.map((tip) => ({ area, topic, tip })));
  return tips[dayNumber() % tips.length];
}

function videoOfTheDay() {
  const learning = VIDEOS.filter((v) => v.kind !== 'fun' && v.youtubeId);
  return learning[(dayNumber() * 7) % learning.length];
}

const TOOLS = [
  { to: '/assess', title: 'Самооцінка', text: 'Оцініть 17 навичок за 3 хвилини й дізнайтеся свої слабкі місця з планом.' },
  { to: '/plan', title: 'Конструктор тренування', text: 'Заняття самостійно, у парі чи групою на той час, що у вас є.' },
  { to: '/videos', title: 'Відео', text: 'Уроки техніки, вправи, тренування й розбори гри професіоналів.' },
  { to: '/ghosting', title: 'Тренажер гостингу', text: 'Випадкові команди кутів голосом, інтервали роботи й відпочинку.' },
  { to: '/log', title: 'Журнал тренувань', text: 'Записуйте заняття й матчі, стежте за тенденціями.' },
  { to: '/quiz', title: 'Вікторина з правил', text: 'Лет, строук чи ноу лет? Перевірте себе на реальних ситуаціях.' },
  { to: '/drills', title: 'Бібліотека вправ', text: 'Вправи самостійно, у парі й групою з фільтрами за напрямом і рівнем.' },
  { to: '/fun', title: 'Цікаве', text: 'Трюки, неймовірні розіграші й легендарні матчі для натхнення.' },
];

export function Home() {
  const tip = tipOfTheDay();
  const video = videoOfTheDay();
  const history = readStore<SavedAssessment[]>(STORE_KEYS.assessments, []);
  const last = history[history.length - 1];
  const focus = last ? lowestAreas(last.answers, 3) : [];
  const starter = COLLECTIONS.find((c) => c.id === 'zero-to-hero');

  return (
    <div>
      <section className="hero">
        <Court className="court-deco" decorative />
        <h1>Грайте у сквош краще, крок за кроком.</h1>
        <p>
          Техніка, пересування, тактика, фізпідготовка й психологія: практичні поради, вправи, відео й тренажери.
          Без реєстрації: усе, що ви зберігаєте, залишається на вашому пристрої.
        </p>
        <div className="row" style={{ marginTop: 18 }}>
          <Link className="btn primary big" to={last ? '/plan' : '/assess'}>
            {last ? 'Скласти тренування на сьогодні' : 'Знайти мої слабкі місця'}
          </Link>
          <Link className="btn big" to="/learn">Усі теми</Link>
          <Link className="btn big" to="/videos">Відео</Link>
        </div>
      </section>

      {last && focus.length > 0 && (
        <section className="section card">
          <div className="section-head">
            <h2>Ваш поточний фокус</h2>
            <Link to="/assess" className="small">Пройти самооцінку знову</Link>
          </div>
          <p className="muted small">За результатами самооцінки від {formatDate(last.date)}.</p>
          <div className="row">
            {focus.map((a) => (
              <Link key={a.id} to={`/learn/${a.id}`} className="btn" style={{ borderLeft: `4px solid ${a.color}` }}>
                {a.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h2>Що хочете покращити?</h2>
          <Link to="/learn" className="small">Усі теми →</Link>
        </div>
        <div className="grid">
          {AREAS.map((a) => (
            <Link key={a.id} to={`/learn/${a.id}`} className="card area-card" style={{ ['--area' as string]: a.color }}>
              <h3>{a.name}</h3>
              <p>{a.tagline}</p>
              <div className="count">{count(a.topics.length, ['тема', 'теми', 'тем'])}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section grid-2">
        <div className="card" style={{ ['--area' as string]: tip.area.color, borderLeft: `4px solid ${tip.area.color}` }}>
          <div className="small muted" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Порада дня</div>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: '8px 0' }}>{tip.tip}</p>
          <Link className="small" to={`/learn/${tip.area.id}/${tip.topic.id}`}>З теми «{tip.topic.title}» →</Link>
        </div>
        <div className="card">
          <h3>Новачок у сквоші?</h3>
          <ol className="small" style={{ marginBottom: 8 }}>
            <li><Link to="/learn/technique/grip-ready">Поставте правильний хват</Link></li>
            <li><Link to="/learn/movement/t-position">Навчіться повертатися на Т</Link></li>
            <li><Link to="/learn/tactics/length-width">Грайте на довжину й ширину</Link></li>
            <li><Link to="/learn/rules/scoring">Розберіться з рахунком</Link> і <Link to="/learn/rules/etiquette-safety">безпекою</Link></li>
            <li><Link to="/learn/gear/balls">Оберіть правильний м'яч</Link></li>
          </ol>
          {starter && <Link className="small" to={`/videos/set/${starter.id}`}>Дивитися серію «{starter.title}» →</Link>}
        </div>
      </section>

      {video && (
        <section className="section">
          <div className="section-head">
            <h2>Відео дня</h2>
            <Link to="/videos" className="small">Усі відео →</Link>
          </div>
          <div className="grid-2">
            <VideoCard video={video} />
            <div className="stack">
              {COLLECTIONS.slice(0, 4).map((c) => (
                <Link key={c.id} to={`/videos/set/${c.id}`} className="card topic-link" style={{ borderLeft: '4px solid var(--accent)' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{c.title}</h3>
                    <p className="small muted" style={{ margin: 0 }}>{count(c.videoIds.length, ['відео', 'відео', 'відео'])} · {c.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <h2>Інструменти</h2>
        <div className="grid">
          {TOOLS.map((t) => (
            <Link key={t.to} to={t.to} className="card area-card">
              <h3>{t.title}</h3>
              <p>{t.text}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
