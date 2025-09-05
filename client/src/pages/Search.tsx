import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

type Result = { id: number; title: string; summary: string; language: string; topic: string };

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    if (!q) { setResults([]); return; }
    const base = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
    const url = new URL(base + '/api/search');
    url.searchParams.set('q', q);
    fetch(url.toString()).then(r=>r.json()).then(setResults);
  }, [q]);

  return (
    <div>
      <h1 className="h4">Search</h1>
      <form className="row g-2 mb-3" onSubmit={e=>{ e.preventDefault(); const input = (e.currentTarget.elements.namedItem('q') as HTMLInputElement); setParams({ q: input.value }); }}>
        <div className="col-9 col-md-10"><input name="q" defaultValue={q} className="form-control" placeholder="Search lessons" /></div>
        <div className="col-3 col-md-2"><button className="btn btn-primary w-100" type="submit">Search</button></div>
      </form>
      {q && <p className="text-muted">Results for "{q}"</p>}
      <div className="list-group">
        {results.map(r => (
          <Link key={r.id} className="list-group-item list-group-item-action" to={`/lessons/${r.id}`}>
            <div className="d-flex w-100 justify-content-between"><strong>{r.title}</strong><span className="badge bg-light text-dark">{r.language} / {r.topic}</span></div>
            <div className="small text-muted">{r.summary}</div>
          </Link>
        ))}
        {q && results.length === 0 && <div className="list-group-item">No results</div>}
      </div>
    </div>
  );
}


