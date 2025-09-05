import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

type CountRow = { language?: string; topic?: string; count: number };

export default function Learn() {
  const [languages, setLanguages] = useState<CountRow[]>([]);
  const [topics, setTopics] = useState<CountRow[]>([]);
  const [params, setParams] = useSearchParams();
  const lang = params.get('language') || '';

  useEffect(() => {
    const base = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
    fetch(base + '/api/catalog/languages').then(r=>r.json()).then(setLanguages);
  }, []);

  useEffect(() => {
    const base = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
    const url = new URL(base + '/api/catalog/topics');
    if (lang) url.searchParams.set('language', lang);
    fetch(url.toString()).then(r=>r.json()).then(setTopics);
  }, [lang]);

  return (
    <div className="row g-4">
      <div className="col-lg-6">
        <h2 className="h4">Choose a Language</h2>
        <div className="list-group">
          {languages.map(l => (
            <button key={l.language} className={`list-group-item list-group-item-action ${lang===l.language? 'active':''}`} onClick={()=> setParams(l.language? { language: l.language } : {})}>
              {l.language} <span className="badge bg-secondary ms-2">{l.count}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="col-lg-6">
        <h2 className="h4">Pick a Topic</h2>
        {lang ? <p className="text-muted">Language: {lang}</p> : <p className="text-muted">All languages</p>}
        <div className="list-group">
          {topics.map(t => (
            <Link key={t.topic} className="list-group-item list-group-item-action" to={lang? `/lessons?language=${encodeURIComponent(lang)}&topic=${encodeURIComponent(t.topic!)}` : `/lessons?topic=${encodeURIComponent(t.topic!)}`}>
              {t.topic} <span className="badge bg-secondary ms-2">{t.count}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}


