"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
(0, db_1.initializeSchema)();
(0, db_1.seedIfEmpty)();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
// Auth endpoints
app.post('/api/auth/register', (req, res) => {
    const { email, password, displayName } = req.body;
    if (!email || !password || !displayName)
        return res.status(400).json({ error: 'Missing fields' });
    try {
        const passwordHash = bcrypt_1.default.hashSync(password, 10);
        const stmt = db_1.db.prepare('INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)');
        const info = stmt.run(email, passwordHash, displayName);
        const token = jsonwebtoken_1.default.sign({ uid: info.lastInsertRowid, email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token });
    }
    catch (e) {
        if (String(e.message).includes('UNIQUE'))
            return res.status(409).json({ error: 'Email already registered' });
        res.status(500).json({ error: 'Registration failed' });
    }
});
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'Missing fields' });
    const user = db_1.db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user)
        return res.status(401).json({ error: 'Invalid credentials' });
    const ok = bcrypt_1.default.compareSync(password, user.password_hash);
    if (!ok)
        return res.status(401).json({ error: 'Invalid credentials' });
    const token = jsonwebtoken_1.default.sign({ uid: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, displayName: user.display_name });
});
// JWT middleware
function auth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token)
        return res.status(401).json({ error: 'Missing token' });
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    }
    catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
// Lessons
app.get('/api/lessons', (_req, res) => {
    const rows = db_1.db.prepare('SELECT id, title, summary FROM lessons').all();
    res.json(rows);
});
app.get('/api/lessons/:id', (req, res) => {
    const id = Number(req.params.id);
    const lesson = db_1.db.prepare('SELECT * FROM lessons WHERE id = ?').get(id);
    if (!lesson)
        return res.status(404).json({ error: 'Not found' });
    const quizzes = db_1.db.prepare('SELECT id, question, options_json FROM quizzes WHERE lesson_id = ?').all(id);
    const mapped = quizzes.map(q => ({ id: q.id, question: q.question, options: JSON.parse(q.options_json) }));
    res.json({ ...lesson, quizzes: mapped });
});
// Submit quiz and save progress
app.post('/api/lessons/:id/submit', auth, (req, res) => {
    const userId = req.user.uid;
    const lessonId = Number(req.params.id);
    const { answers } = req.body;
    const quizRows = db_1.db.prepare('SELECT id, answer_index FROM quizzes WHERE lesson_id = ?').all(lessonId);
    let score = 0;
    for (let i = 0; i < quizRows.length; i++) {
        const q = quizRows[i];
        if (answers[i] === q.answer_index)
            score++;
    }
    const completed = quizRows.length > 0 ? (score === quizRows.length ? 1 : 0) : 1;
    db_1.db.prepare(`INSERT INTO progress (user_id, lesson_id, completed, score, updated_at)
              VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
              ON CONFLICT(user_id, lesson_id) DO UPDATE SET completed=excluded.completed, score=excluded.score, updated_at=CURRENT_TIMESTAMP`)
        .run(userId, lessonId, completed, score);
    res.json({ score, total: quizRows.length, completed: Boolean(completed) });
});
// Progress summary
app.get('/api/me/progress', auth, (req, res) => {
    const userId = req.user.uid;
    const rows = db_1.db.prepare('SELECT lesson_id, completed, score, updated_at FROM progress WHERE user_id = ?').all(userId);
    res.json(rows);
});
const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map