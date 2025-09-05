import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Home from './pages/Home';
import Lessons from './pages/Lessons';
import LessonDetail from './pages/LessonDetail';
import Playground from './pages/Playground';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './store/auth';
import Learn from './pages/Learn';
import Search from './pages/Search';
import TutorialPage from './pages/TutorialPage';
import ReferencePage from './pages/ReferencePage';

function App() {
  const { token, displayName, clear } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <nav className="navbar navbar-expand-lg navbar-dark" style={{backgroundColor: '#04AA6D'}}>
          <div className="container">
            <Link className="navbar-brand" to="/">CodeLearn</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav" aria-controls="nav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="nav">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item"><Link className="nav-link" to="/learn">Tutorials</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/reference/html">References</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/playground">Try It Yourself</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/dashboard">Dashboard</Link></li>
              </ul>
              <form className="d-flex" role="search" onSubmit={(e)=>{ e.preventDefault(); const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value; navigate(`/search?q=${encodeURIComponent(q)}`); }}>
                <input className="form-control form-control-sm me-2" name="q" type="search" placeholder="Search" aria-label="Search" />
                <button className="btn btn-outline-light btn-sm" type="submit">Go</button>
              </form>
              <div className="d-flex">
                {token ? (
                  <>
                    <span className="navbar-text me-2">Hi, {displayName}</span>
                    <button className="btn btn-outline-light btn-sm" onClick={clear}>Logout</button>
                  </>
                ) : (
                  <>
                    <Link className="btn btn-outline-light btn-sm me-2" to="/login">Login</Link>
                    <Link className="btn btn-light btn-sm" to="/register">Register</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        <main className="container py-4" style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/tutorials" element={<Navigate to="/learn" replace />} />
            <Route path="/search" element={<Search />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/lessons/:id" element={<LessonDetail />} />
            <Route path="/tutorials/:language" element={<TutorialPage />} />
            <Route path="/reference" element={<Navigate to="/reference/html" replace />} />
            <Route path="/reference/:language" element={<ReferencePage />} />
            <Route path="/playground" element={<Playground />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={
              <div className="text-center py-5">
                <h1>404 - Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
                <Link to="/" className="btn btn-primary">Go Home</Link>
              </div>
            } />
          </Routes>
        </main>

        <footer className="bg-light py-3 mt-auto">
          <div className="container text-center">
            <small>&copy; {new Date().getFullYear()} CodeLearn - Learn Programming the Easy Way</small>
          </div>
        </footer>
      </div>
  );
}

export default App;
