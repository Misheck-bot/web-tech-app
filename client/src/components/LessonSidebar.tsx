import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

type Lesson = { id: number; title: string };

export default function LessonSidebar() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const loc = useLocation();

  useEffect(() => {
    const base = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
    const url = new URL(base + '/api/lessons');
    const sp = new URLSearchParams(loc.search);
    if (sp.get('language')) url.searchParams.set('language', sp.get('language')!);
    if (sp.get('topic')) url.searchParams.set('topic', sp.get('topic')!);
    fetch(url.toString()).then(r=>r.json()).then((rows) => {
      setLessons(rows);
    });
  }, [loc.search]);

  return (
    <aside className="sticky-top pt-3" style={{ top: 80 }}>
      <div className="list-group">
        {lessons.map(l => (
          <Link key={l.id} to={`/lessons/${l.id}`} className={`list-group-item list-group-item-action ${loc.pathname === `/lessons/${l.id}` ? 'active' : ''}`}>
            {l.title}
          </Link>
        ))}
      </div>
    </aside>
  );
}


