import { Link, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <Link to="/" className="text-xl font-bold text-navy">
            CivicLens
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link to="/map">Civic Map</Link>
            {user?.role === 'citizen' && <Link to="/dashboard">Citizen Dashboard</Link>}
            {user?.role === 'admin' && <Link to="/admin">Admin Dashboard</Link>}
            {user ? (
              <button className="rounded bg-navy px-3 py-1 text-white" onClick={() => logout()}>
                Logout
              </button>
            ) : (
              <Link to="/login" className="rounded bg-navy px-3 py-1 text-white">
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4">
        <Outlet />
      </main>
    </div>
  );
};
