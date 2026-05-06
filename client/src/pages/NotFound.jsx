import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="rounded-3xl bg-white p-12 shadow-xl text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-brand-600">404 error</p>
      <h1 className="mt-6 text-5xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-4 text-slate-500">The page you are looking for does not exist or has been moved.</p>
      <Link to="/" className="mt-8 inline-flex rounded-2xl bg-brand-600 px-6 py-3 text-white font-semibold hover:bg-brand-700 transition">
        Go back home
      </Link>
    </div>
  );
}
