import { useEffect, useState } from 'react';
import LessonSidebar from '../components/LessonSidebar';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';

type Lesson = { id: number; title: string; summary: string };

export default function Lessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  const loc = useLocation();
  useEffect(() => {
    const base = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
    const url = new URL(base + '/api/lessons');
    const params = new URLSearchParams(loc.search);
    if (params.get('language')) url.searchParams.set('language', params.get('language')!);
    if (params.get('topic')) url.searchParams.set('topic', params.get('topic')!);
    fetch(url.toString())
      .then(r => r.json())
      .then(setLessons)
      .finally(() => setLoading(false));
  }, [loc.search]);

  if (loading) return <p>Loading lessons…</p>;

  return (
    <div className="row">
      <div className="col-lg-3 d-none d-lg-block border-end">
        <LessonSidebar />
      </div>
      <div className="col-lg-9">
        <div className="d-flex align-items-center justify-content-between">
          <h1 className="h3 mb-3">Lessons</h1>
          <BackButton />
        </div>
        <div className="mb-3 text-muted small">{new URLSearchParams(loc.search).get('language') || 'All'} {new URLSearchParams(loc.search).get('topic') ? `/ ${new URLSearchParams(loc.search).get('topic')}` : ''}</div>
        <div className="row g-3">
          {lessons.map(l => (
            <div className="col-md-6" key={l.id}>
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{l.title}</h5>
                  <p className="card-text">{l.summary}</p>
                  <Link className="btn btn-primary mt-auto" to={`/lessons/${l.id}`}>Start</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


