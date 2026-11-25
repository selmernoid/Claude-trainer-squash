import { FormEvent, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

const NAV = [
  { to: '/learn', label: 'Навчання' },
  { to: '/videos', label: 'Відео' },
  { to: '/drills', label: 'Вправи' },
  { to: '/assess', label: 'Самооцінка' },
  { to: '/plan', label: 'План' },
  { to: '/ghosting', label: 'Гостинг' },
  { to: '/log', label: 'Журнал' },
  { to: '/quiz', label: 'Правила' },
  { to: '/fun', label: 'Цікаве' },
];

export function Layout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [q, setQ] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <NavLink to="/" className="brand" aria-label="Сквош-тренер, головна">
            <span className="brand-dot" aria-hidden /> Сквош-тренер
          </NavLink>
          <nav className="nav" aria-label="Головне меню">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <form className="header-search" role="search" onSubmit={submit}>
            <input type="search" placeholder="Пошук…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Пошук по порталу" />
          </form>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="footer">
        <nav className="row" style={{ justifyContent: 'center', marginBottom: 10 }} aria-label="Додатково">
          <Link to="/glossary">Словник термінів</Link>
          <Link to="/videos">Усі відео</Link>
          <Link to="/fun">Цікаве</Link>
        </nav>
        Анонімно: без акаунтів і стеження. Усе, що ви зберігаєте, залишається в цьому браузері. Відео з YouTube завантажуються лише
        після натискання.
        <br />
        Поради розраховані на праворукого гравця; лівшам варто їх дзеркалити. Правила наведено спрощено; офіційне формулювання див.
        у правилах World Squash Federation.
      </footer>
    </>
  );
}
