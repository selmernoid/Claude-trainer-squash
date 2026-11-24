import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="empty">
      <h1>Out of court</h1>
      <p>That page doesn't exist.</p>
      <Link className="btn primary" to="/">Back to the T</Link>
    </div>
  );
}
