import { FormEvent, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

const NAV = [
  { to: '/learn', label: 'Learn' },
  { to: '/drills', label: 'Drills' },
  { to: '/assess', label: 'Assess' },
  { to: '/plan', label: 'Plan' },
  { to: '/ghosting', label: 'Ghosting' },
  { to: '/log', label: 'Log' },
  { to: '/quiz', label: 'Rules quiz' },
  { to: '/glossary', label: 'Glossary' },
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
          <NavLink to="/" className="brand" aria-label="Squash Trainer home">
            <span className="brand-dot" aria-hidden /> Squash Trainer
          </NavLink>
          <nav className="nav" aria-label="Main">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <form className="header-search" role="search" onSubmit={submit}>
            <input type="search" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search the portal" />
          </form>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="footer">
        Anonymous by design — no accounts, no tracking. Anything you save stays in this browser.
        <br />
        Advice assumes a right-handed player; left-handers mirror it. Rules summaries are simplified; see the World Squash Federation rules for official wording.
      </footer>
    </>
  );
}
