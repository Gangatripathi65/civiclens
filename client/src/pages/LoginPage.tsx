import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('citizen@civiclens.demo');
  const [password, setPassword] = useState('ChangeMe123!');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Login failed. Verify credentials.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4 rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <input className="w-full rounded border p-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input
        className="w-full rounded border p-2"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button className="w-full rounded bg-navy p-2 text-white" type="submit">
        Login
      </button>
      <p className="text-xs text-slate-500">Demo: citizen@civiclens.demo / admin@civiclens.demo, password ChangeMe123! (change for production).</p>
    </form>
  );
};
