import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import LessonSidebar from '../components/LessonSidebar';
import BackButton from '../components/BackButton';

type Quiz = { id: number; question: string; options: string[] };
type Lesson = { id: number; title: string; content: string; quizzes: Quiz[] };

export default function LessonDetail() {
  const { id } = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{ score: number; total: number; completed: boolean } | null>(null);
  const [ack, setAck] = useState(false);
  const [ackBusy, setAckBusy] = useState(false);
  const [ackError, setAckError] = useState<string | null>(null);
  const token = useAuth(s => s.token);

  useEffect(() => {
    api<Lesson>(`/api/lessons/${id}`).then(data => {
      setLesson(data);
      setAnswers(new Array(data.quizzes.length).fill(-1));
    });
  }, [id]);

  async function start() {
    if (!token) { alert('Please log in first.'); return; }
    setAckBusy(true);
    setAckError(null);
    try {
      await api(`/api/lessons/${id}/start`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      setAck(true);
      // Unlock an achievement for taking a quiz
      try {
        await api(`/api/achievements/unlock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ code: 'take_quiz', title: 'Take Quiz', description: 'You started a quiz!' })
        });
        // Notify dashboard to refresh achievements
        window.dispatchEvent(new CustomEvent('progress-updated', { detail: { achievement: 'take_quiz' } }));
      } catch {}
    } catch (e: any) {
      setAckError(e?.message || 'Could not mark as read');
    } finally {
      setAckBusy(false);
    }
  }

  async function submit() {
    if (!token) { alert('Please log in first.'); return; }
    const res = await api<{ score: number; total: number; completed: boolean }>(`/api/lessons/${id}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ answers })
    });
    setResult(res);
    try {
      // Notify the app that progress has been updated so dashboards can refresh
      window.dispatchEvent(new CustomEvent('progress-updated', { detail: { lessonId: id, result: res } }));
    } catch {}
  }

  if (!lesson) return <p>Loading…</p>;

  return (
    <div className="row">
      <div className="col-lg-3 d-none d-lg-block border-end">
        <LessonSidebar />
      </div>
      <div className="col-lg-6">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <nav className="small text-muted">
            <Link to="/learn">Learn</Link> / {lesson.language} / {lesson.topic}
          </nav>
          <BackButton />
        </div>
        <h2 className="h3">{lesson.title}</h2>
        <div className="bg-light p-3 rounded mb-3" style={{ whiteSpace: 'pre-wrap' }}>{lesson.content}</div>
        {lesson.title === 'Sequencing Basics' && (
          <div className="card mb-3">
            <div className="card-header">Languages that follow sequential execution</div>
            <div className="card-body">
              <p className="mb-2">Most popular languages execute code top-to-bottom unless control flow changes with loops or conditions. Examples include:</p>
              <ul className="mb-3">
                <li>Python</li>
                <li>JavaScript</li>
                <li>Java</li>
                <li>C/C++</li>
              </ul>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="bg-code p-3">
                    <div className="small text-muted">Python</div>
                    <pre className="m-0">{`print("Step 1")
print("Step 2")
print("Step 3")`}</pre>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="bg-code p-3">
                    <div className="small text-muted">JavaScript</div>
                    <pre className="m-0">{`console.log('Step 1')
console.log('Step 2')
console.log('Step 3')`}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {lesson.quizzes.map((q, qi) => (
          <div key={q.id} className="mb-3">
            <strong>Q{qi + 1}. {q.question}</strong>
            {q.options.map((opt, oi) => (
              <div className="form-check" key={oi}>
                <input className="form-check-input" type="radio" name={`q${qi}`} id={`q${qi}-${oi}`} checked={answers[qi]===oi} onChange={() => setAnswers(a=>{ const b=[...a]; b[qi]=oi; return b; })} />
                <label className="form-check-label" htmlFor={`q${qi}-${oi}`}>{opt}</label>
              </div>
            ))}
          </div>
        ))}
        {!ack && (
          <div>
            <button className="btn btn-primary" onClick={start} disabled={ackBusy}>
              {ackBusy ? 'Please wait…' : 'Take Quiz'}
            </button>
            {ackError && <div className="text-danger small mt-2">{ackError}</div>}
          </div>
        )}
        {ack && lesson.quizzes.length > 0 && <button className="btn btn-success" onClick={submit}>Submit Answers</button>}
        {result && <div className="alert alert-info mt-3">Score: {result.score}/{result.total} {result.completed && '(Completed!)'}</div>}
      </div>
      <div className="col-lg-3">
        <div className="card">
          <div className="card-header">Try It Yourself</div>
          <div className="card-body">
            <p className="small text-muted">Open the Playground to practice:</p>
            <Link className="btn btn-outline-secondary btn-sm" to="/playground">Open Playground</Link>
          </div>
        </div>
      </div>
    </div>
  );
}


