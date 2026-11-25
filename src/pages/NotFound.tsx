import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="empty">
      <h1>Аут!</h1>
      <p>Такої сторінки немає.</p>
      <Link className="btn primary" to="/">Назад на Т</Link>
    </div>
  );
}
