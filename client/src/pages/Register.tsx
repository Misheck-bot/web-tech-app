import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();
  const setAuth = useAuth(s => s.setAuth);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await api<{ token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, displayName })
      });
      setAuth(res.token, displayName);
      nav('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-4">
        <h2>Create Account</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label">Display name</label>
            <input className="form-control" value={displayName} onChange={e=>setDisplayName(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input className="form-control" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary w-100" type="submit">Register</button>
        </form>
        <p className="mt-3">Have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
}


