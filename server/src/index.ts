import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeSchema, seedIfEmpty, db } from './db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

initializeSchema();
seedIfEmpty();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Auth endpoints
app.post('/api/auth/register', (req, res) => {
  const { email, password, displayName } = req.body as { email?: string; password?: string; displayName?: string };
  if (!email || !password || !displayName) return res.status(400).json({ error: 'Missing fields' });
  try {
    const passwordHash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare('INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)');
    const info = stmt.run(email, passwordHash, displayName);
    const token = jwt.sign({ uid: info.lastInsertRowid, email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (e: any) {
    if (String(e.message).includes('UNIQUE')) return res.status(409).json({ error: 'Email already registered' });
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ uid: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, displayName: user.display_name });
});

// JWT middleware
function auth(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    // Ensure user still exists (handles case where DB was reset but client kept old token)
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(payload.uid) as any;
    if (!user) return res.status(401).json({ error: 'Session expired. Please log in again.' });
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Lessons
app.get('/api/lessons', (req, res) => {
  const { language, topic } = req.query as any;
  let sql = 'SELECT id, title, summary, language, topic FROM lessons';
  const params: any[] = [];
  if (language) { sql += ' WHERE language = ?'; params.push(language); }
  if (topic) { sql += language ? ' AND topic = ?' : ' WHERE topic = ?'; params.push(topic); }
  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

app.get('/api/lessons/:id', (req, res) => {
  const id = Number(req.params.id);
  const lesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(id);
  if (!lesson) return res.status(404).json({ error: 'Not found' });
  const quizzes = db.prepare('SELECT id, question, options_json FROM quizzes WHERE lesson_id = ?').all(id) as any[];
  const mapped = quizzes.map(q => ({ id: q.id, question: q.question, options: JSON.parse(q.options_json) }));
  res.json({ ...lesson, quizzes: mapped });
});

// Languages and topics
app.get('/api/catalog/languages', (_req, res) => {
  const rows = db.prepare('SELECT language, COUNT(*) as count FROM lessons GROUP BY language').all();
  res.json(rows);
});
app.get('/api/catalog/topics', (req, res) => {
  const { language } = req.query as any;
  const rows = language
    ? db.prepare('SELECT topic, COUNT(*) as count FROM lessons WHERE language = ? GROUP BY topic').all(language)
    : db.prepare('SELECT topic, COUNT(*) as count FROM lessons GROUP BY topic').all();
  res.json(rows);
});

// Submit quiz and save progress
app.post('/api/lessons/:id/submit', auth, (req, res) => {
  const userId = (req as any).user.uid as number;
  const lessonId = Number(req.params.id);
  if (!Number.isFinite(lessonId)) return res.status(400).json({ error: 'Invalid lesson id' });
  const { answers } = req.body as { answers: number[] };
  const exists = db.prepare('SELECT id FROM lessons WHERE id = ?').get(lessonId) as any;
  if (!exists) return res.status(404).json({ error: 'Lesson not found' });
  const quizRows = db.prepare('SELECT id, answer_index FROM quizzes WHERE lesson_id = ?').all(lessonId) as any[];
  let score = 0;
  for (let i = 0; i < quizRows.length; i++) {
    const q = quizRows[i];
    if (answers[i] === q.answer_index) score++;
  }
  const completed = quizRows.length > 0 ? (score === quizRows.length ? 1 : 0) : 1;
  try {
    db.prepare(`INSERT INTO progress (user_id, lesson_id, completed, score, updated_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(user_id, lesson_id) DO UPDATE SET completed=excluded.completed, score=excluded.score, updated_at=CURRENT_TIMESTAMP`)
      .run(userId, lessonId, completed, score);
  } catch (e: any) {
    return res.status(400).json({ error: 'Could not save progress. Please log in again and retry.' });
  }
  // Unlock achievements
  const unlock = db.transaction(() => {
    if (completed) {
      const ach = db.prepare('SELECT id FROM achievements WHERE code = ?').get('FIRST_LESSON_COMPLETE') as any;
      if (ach) db.prepare('INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)').run(userId, ach.id);
    }
    if (quizRows.length > 0 && score === quizRows.length) {
      const ach = db.prepare('SELECT id FROM achievements WHERE code = ?').get('PERFECT_SCORE') as any;
      if (ach) db.prepare('INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)').run(userId, ach.id);
    }
    const completedCount = db.prepare('SELECT COUNT(*) as c FROM progress WHERE user_id = ? AND completed = 1').get(userId) as any;
    if (completedCount.c >= 3) {
      const ach = db.prepare('SELECT id FROM achievements WHERE code = ?').get('THREE_LESSONS') as any;
      if (ach) db.prepare('INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)').run(userId, ach.id);
    }
  });
  unlock();
  res.json({ score, total: quizRows.length, completed: Boolean(completed) });
});

// Progress summary
app.get('/api/me/progress', auth, (req, res) => {
  const userId = (req as any).user.uid as number;
  const rows = db.prepare('SELECT lesson_id, started, completed, score, updated_at FROM progress WHERE user_id = ?').all(userId);
  res.json(rows);
});

// Mark lesson as started (acknowledged learning content)
app.post('/api/lessons/:id/start', auth, (req, res) => {
  const userId = (req as any).user.uid as number;
  const lessonId = Number(req.params.id);
  if (!Number.isFinite(lessonId)) return res.status(400).json({ error: 'Invalid lesson id' });
  const exists = db.prepare('SELECT id FROM lessons WHERE id = ?').get(lessonId) as any;
  if (!exists) return res.status(404).json({ error: 'Lesson not found' });
  try {
    db.prepare(`INSERT INTO progress (user_id, lesson_id, started, updated_at)
                VALUES (?, ?, 1, CURRENT_TIMESTAMP)
                ON CONFLICT(user_id, lesson_id) DO UPDATE SET started=1, updated_at=CURRENT_TIMESTAMP`).run(userId, lessonId);
  } catch (e: any) {
    return res.status(400).json({ error: 'Could not mark started. Please log in again and retry.' });
  }
  res.json({ ok: true });
});

// Achievements
app.get('/api/me/achievements', auth, (req, res) => {
  const userId = (req as any).user.uid as number;
  const rows = db.prepare(`
    SELECT a.code, a.title, a.description, ua.unlocked_at
    FROM achievements a
    JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = ?
    ORDER BY ua.unlocked_at DESC
  `).all(userId);
  res.json(rows);
});

// Full-text like search across lesson title/summary/content
app.get('/api/search', (req, res) => {
  const q = String((req.query.q || '') as string).trim();
  if (!q) return res.json([]);
  const like = `%${q.replace(/%/g, '')}%`;
  const rows = db.prepare(
    'SELECT id, title, summary, language, topic FROM lessons WHERE title LIKE ? OR summary LIKE ? OR content LIKE ? LIMIT 50'
  ).all(like, like, like);
  res.json(rows);
});

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${PORT}`);
});


