"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initializeSchema = initializeSchema;
exports.seedIfEmpty = seedIfEmpty;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dataDir = path_1.default.join(process.cwd(), 'data');
const dbPath = path_1.default.join(dataDir, 'app.db');
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
exports.db = new better_sqlite3_1.default(dbPath);
function initializeSchema() {
    exports.db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      content TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      options_json TEXT NOT NULL,
      answer_index INTEGER NOT NULL,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      score INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, lesson_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    );
  `);
}
function seedIfEmpty() {
    const lessonCount = exports.db.prepare('SELECT COUNT(*) as c FROM lessons').get();
    if (lessonCount.c > 0)
        return;
    const insertLesson = exports.db.prepare('INSERT INTO lessons (title, summary, content) VALUES (?, ?, ?)');
    const lessons = [
        {
            title: 'Sequencing Basics',
            summary: 'Understand step-by-step instructions and order of operations.',
            content: 'Programming executes instructions in sequence. Arrange steps to complete tasks like making a sandwich. In code, this means lines run from top to bottom unless we change the flow.'
        },
        {
            title: 'Loops 101',
            summary: 'Repeat actions using loops.',
            content: 'Loops let us repeat actions many times. For example, repeat 5 times to draw 5 stars.'
        },
        {
            title: 'Conditions',
            summary: 'Make decisions with if/else.',
            content: 'Conditions let the program choose different paths. If it rains, take an umbrella; else, wear sunglasses.'
        }
    ];
    const insertQuiz = exports.db.prepare('INSERT INTO quizzes (lesson_id, question, options_json, answer_index) VALUES (?, ?, ?, ?)');
    const tx = exports.db.transaction(() => {
        for (const l of lessons) {
            const info = insertLesson.run(l.title, l.summary, l.content);
            const lessonId = info.lastInsertRowid;
            if (l.title === 'Sequencing Basics') {
                insertQuiz.run(lessonId, 'Which comes first when making tea?', JSON.stringify(['Boil water', 'Add tea leaves to dry cup', 'Drink tea']), 0);
            }
            if (l.title === 'Loops 101') {
                insertQuiz.run(lessonId, 'A loop is best for...?', JSON.stringify(['Doing something once', 'Repeating an action many times', 'Stopping the program']), 1);
            }
        }
        // Seed a demo user
        const passwordHash = bcrypt_1.default.hashSync('demo1234', 10);
        exports.db.prepare('INSERT OR IGNORE INTO users (email, password_hash, display_name) VALUES (?, ?, ?)')
            .run('demo@example.com', passwordHash, 'Demo Kid');
    });
    tx();
}
//# sourceMappingURL=db.js.map