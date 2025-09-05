import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';

type Prog = { lesson_id: number; completed: 0|1; score: number; updated_at: string };
type Ach = { code: string; title: string; description: string; unlocked_at: string };

export default function Dashboard() {
  const token = useAuth(s => s.token);
  const { displayName } = useAuth();
  const [progress, setProgress] = useState<Prog[]>([]);
  const [ach, setAch] = useState<Ach[]>([]);

  useEffect(() => {
    if (!token) return;
    // Fetch real user progress data from the backend API
    // Note: This requires the backend server to be running and properly configured
    api<Prog[]>('/api/me/progress', { headers: { Authorization: `Bearer ${token}` } })
      .then(setProgress)
      .catch((error) => {
        console.error('Failed to fetch progress:', error);
        setProgress([]);
      });
    
    api<Ach[]>('/api/me/achievements', { headers: { Authorization: `Bearer ${token}` } })
      .then(setAch)
      .catch((error) => {
        console.error('Failed to fetch achievements:', error);
        setAch([]);
      });
  }, [token]);

  // Live update when lessons are submitted elsewhere in the app
  useEffect(() => {
    if (!token) return;
    const onProgress = () => {
      api<Prog[]>('/api/me/progress', { headers: { Authorization: `Bearer ${token}` } })
        .then(setProgress)
        .catch(() => {});
      api<Ach[]>('/api/me/achievements', { headers: { Authorization: `Bearer ${token}` } })
        .then(setAch)
        .catch(() => {});
    };
    window.addEventListener('progress-updated', onProgress as EventListener);
    return () => window.removeEventListener('progress-updated', onProgress as EventListener);
  }, [token]);

  if (!token) {
    return (
      <div className="text-center py-5">
        <h2>Welcome to CodeLearn Dashboard</h2>
        <p className="lead">Please log in to track your learning progress.</p>
        <div className="d-flex gap-3 justify-content-center">
          <Link to="/login" className="btn btn-primary">Login</Link>
          <Link to="/register" className="btn btn-outline-primary">Register</Link>
        </div>
      </div>
    );
  }

  const completedCount = progress.filter(p=>p.completed===1).length;
  const totalLessons = progress.length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const averageScore = completedCount > 0 
    ? Math.round(progress.filter(p => p.completed === 1).reduce((sum, p) => sum + p.score, 0) / completedCount)
    : 0;

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <h1>Welcome back, {displayName || 'Learner'}!</h1>
          <p className="lead">Track your programming journey and continue learning.</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Quick Stats */}
        <div className="col-lg-3 col-md-6">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-primary">Lessons Completed</h5>
              <h2 className="text-primary">{completedCount}</h2>
              <p className="text-muted">
                {completedCount === 0 ? 'Start your learning journey!' : 'Keep up the great work!'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="col-lg-3 col-md-6">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-success">Average Score</h5>
              <h2 className="text-success">{averageScore}%</h2>
              <p className="text-muted">
                {averageScore === 0 ? 'Complete lessons to see your score' : 'Excellent progress!'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="col-lg-3 col-md-6">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-warning">Achievements</h5>
              <h2 className="text-warning">{ach.length}</h2>
              <p className="text-muted">
                {ach.length === 0 ? 'Earn your first badge!' : 'Badges earned'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="col-lg-3 col-md-6">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title text-info">Total Lessons</h5>
              <h2 className="text-info">{totalLessons}</h2>
              <p className="text-muted">
                {totalLessons === 0 ? 'Start learning today!' : 'Lessons in progress'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-2">
        {/* Progress Section */}
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h3 className="mb-0">Your Learning Progress</h3>
            </div>
            <div className="card-body">
              {totalLessons > 0 ? (
                <>
                  <div className="progress mb-4" style={{height: '25px'}}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ width: `${progressPercentage}%` }}
                      role="progressbar"
                    >
                      {progressPercentage}% Complete
                    </div>
                  </div>
                  
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Lesson</th>
                          <th>Score</th>
                          <th>Status</th>
                          <th>Last Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {progress.map(p => (
                          <tr key={p.lesson_id}>
                            <td>
                              <Link to={`/lessons/${p.lesson_id}`} className="text-decoration-none">
                                Lesson #{p.lesson_id}
                              </Link>
                            </td>
                            <td>
                              <span className={`badge ${p.score >= 80 ? 'bg-success' : p.score >= 60 ? 'bg-warning' : p.score > 0 ? 'bg-danger' : 'bg-secondary'}`}>
                                {p.score > 0 ? `${p.score}%` : 'Not scored'}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${p.completed ? 'bg-success' : 'bg-secondary'}`}>
                                {p.completed ? 'Completed' : 'In Progress'}
                              </span>
                            </td>
                            <td className="text-muted small">
                              {new Date(p.updated_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-5">
                  <div className="mb-4">
                    <i className="bi bi-book" style={{fontSize: '4rem', color: '#6c757d'}}></i>
                  </div>
                  <h4>No lessons started yet</h4>
                  <p className="text-muted">Begin your programming journey by starting a tutorial!</p>
                  <div className="d-flex gap-3 justify-content-center">
                    <Link to="/tutorials/html" className="btn btn-primary">
                      Start HTML Tutorial
                    </Link>
                    <Link to="/tutorials/css" className="btn btn-outline-primary">
                      Start CSS Tutorial
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Quick Actions */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link to="/tutorials/html" className="btn btn-outline-primary">
                  Continue HTML Tutorial
                </Link>
                <Link to="/playground" className="btn btn-outline-success">
                  Practice in Playground
                </Link>
                <Link to="/reference/javascript" className="btn btn-outline-info">
                  JavaScript Reference
                </Link>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Achievements</h5>
            </div>
            <div className="card-body">
              {ach.length === 0 ? (
                <div className="text-center py-3">
                  <div className="mb-3">
                    <i className="bi bi-trophy" style={{fontSize: '2rem', color: '#6c757d'}}></i>
                  </div>
                  <p className="text-muted mb-0">No achievements yet.</p>
                  <small className="text-muted">Complete lessons to unlock badges!</small>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {ach.map(a => (
                    <div key={a.code} className="list-group-item px-0">
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                            🏆
                          </div>
                        </div>
                        <div>
                          <h6 className="mb-1">{a.title}</h6>
                          <p className="text-muted small mb-0">{a.description}</p>
                          <small className="text-muted">Unlocked: {new Date(a.unlocked_at).toLocaleDateString()}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


