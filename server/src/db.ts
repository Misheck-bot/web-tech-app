import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';

const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'app.db');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(dbPath);

export function initializeSchema(): void {
  db.exec(`
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
      content TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'KidCode',
      topic TEXT NOT NULL DEFAULT 'Basics'
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
      started INTEGER NOT NULL DEFAULT 0,
      completed INTEGER NOT NULL DEFAULT 0,
      score INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, lesson_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_achievements (
      user_id INTEGER NOT NULL,
      achievement_id INTEGER NOT NULL,
      unlocked_at TEXT DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, achievement_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
    );
  `);
  // Ensure legacy databases have new columns
  const cols = db.prepare("PRAGMA table_info(lessons)").all() as any[];
  const names = new Set(cols.map(c => c.name as string));
  if (!names.has('language')) {
    db.exec("ALTER TABLE lessons ADD COLUMN language TEXT NOT NULL DEFAULT 'KidCode'");
  }
  if (!names.has('topic')) {
    db.exec("ALTER TABLE lessons ADD COLUMN topic TEXT NOT NULL DEFAULT 'Basics'");
  }

  // Ensure progress.started exists for learn-first flow
  const pcols = db.prepare("PRAGMA table_info(progress)").all() as any[];
  const pnames = new Set(pcols.map(c => c.name as string));
  if (!pnames.has('started')) {
    db.exec("ALTER TABLE progress ADD COLUMN started INTEGER NOT NULL DEFAULT 0");
  }
}

export function seedIfEmpty(): void {
  const lessonCount = db.prepare('SELECT COUNT(*) as c FROM lessons').get() as { c: number };
  if (lessonCount.c > 0) return;

  const insertLesson = db.prepare('INSERT INTO lessons (title, summary, content, language, topic) VALUES (?, ?, ?, ?, ?)');
  const lessons = [
    {
      title: 'Sequencing Basics', language: 'KidCode', topic: 'Basics',
      summary: 'Understand step-by-step instructions and order of operations.',
      content: 'Programming executes instructions in sequence. Arrange steps to complete tasks like making a sandwich. In code, this means lines run from top to bottom unless we change the flow.'
    },
    {
      title: 'Loops 101', language: 'KidCode', topic: 'Loops',
      summary: 'Repeat actions using loops.',
      content: 'Loops let us repeat actions many times. For example, repeat 5 times to draw 5 stars.'
    },
    {
      title: 'Conditions', language: 'KidCode', topic: 'Conditions',
      summary: 'Make decisions with if/else.',
      content: 'Conditions let the program choose different paths. If it rains, take an umbrella; else, wear sunglasses.'
    },
    // HTML
    {
      title: 'HTML Introduction', language: 'HTML', topic: 'Basics',
      summary: 'What is HTML and how a web page is structured.',
      content: '<!DOCTYPE html> defines an HTML5 document. Use <html>, <head>, and <body>. Headings use <h1>..</h1>. Paragraphs use <p>..</p>.'
    },
    {
      title: 'HTML Links and Images', language: 'HTML', topic: 'Elements',
      summary: 'Using <a> for links and <img> for images.',
      content: 'Links: <a href="https://example.com">Visit</a>. Images: <img src="cat.jpg" alt="A cat" />. Always include alt text.'
    },
    // CSS
    {
      title: 'CSS Selectors', language: 'CSS', topic: 'Selectors',
      summary: 'Select elements by tag, class, and id.',
      content: 'p { color: blue } selects all paragraphs. .btn selects class="btn". #main selects id="main".'
    },
    {
      title: 'CSS Box Model', language: 'CSS', topic: 'Layout',
      summary: 'Content, padding, border, margin.',
      content: 'Every element is a box. Total size = content + padding + border + margin. Use box-sizing: border-box for predictable sizing.'
    },
    // JavaScript
    {
      title: 'JS Variables', language: 'JavaScript', topic: 'Basics',
      summary: 'let and const, and basic types.',
      content: 'Use let for reassignable variables, const for constants. Example: const name = "Ava"; let age = 10;'
    },
    {
      title: 'JS Conditions', language: 'JavaScript', topic: 'Control Flow',
      summary: 'if/else and comparison operators.',
      content: 'if (age >= 13) { console.log("Teen"); } else { console.log("Kid"); }'
    },
    // Python
    {
      title: 'Python Print', language: 'Python', topic: 'Basics',
      summary: 'Your first output.',
      content: 'print("Hello, world!") prints text to the screen. Strings use quotes.'
    },
    {
      title: 'Python Loops', language: 'Python', topic: 'Loops',
      summary: 'for and while loops.',
      content: 'for i in range(5): print(i) prints 0..4. while loops repeat while a condition is true.'
    }
  ];

  const insertQuiz = db.prepare('INSERT INTO quizzes (lesson_id, question, options_json, answer_index) VALUES (?, ?, ?, ?)');

  const tx = db.transaction(() => {
    for (const l of lessons) {
      const info = insertLesson.run(l.title, l.summary, l.content, l.language, l.topic);
      const lessonId = info.lastInsertRowid as number;

      if (l.title === 'Sequencing Basics') {
        insertQuiz.run(
          lessonId,
          'Which comes first when making tea?',
          JSON.stringify(['Boil water', 'Add tea leaves to dry cup', 'Drink tea']),
          0
        );
      }
      if (l.title === 'Loops 101') {
        insertQuiz.run(
          lessonId,
          'A loop is best for...?',
          JSON.stringify(['Doing something once', 'Repeating an action many times', 'Stopping the program']),
          1
        );
      }
      if (l.title === 'HTML Introduction') {
        insertQuiz.run(
          lessonId,
          'Which tag defines the main content displayed on the page?',
          JSON.stringify(['<head>', '<body>', '<title>']),
          1
        );
      }
      if (l.title === 'CSS Selectors') {
        insertQuiz.run(
          lessonId,
          'Which selector targets an element with id="main"?',
          JSON.stringify(['.main', '#main', 'main']),
          1
        );
      }
      if (l.title === 'JS Variables') {
        insertQuiz.run(
          lessonId,
          'Which keyword defines a constant?',
          JSON.stringify(['var', 'let', 'const']),
          2
        );
      }
      if (l.title === 'Python Print') {
        insertQuiz.run(
          lessonId,
          'What does print("Hi") do?',
          JSON.stringify(['Saves a file', 'Outputs text', 'Creates a variable']),
          1
        );
      }
    }

    // Seed a demo user
    const passwordHash = bcrypt.hashSync('demo1234', 10);
    db.prepare('INSERT OR IGNORE INTO users (email, password_hash, display_name) VALUES (?, ?, ?)')
      .run('demo@example.com', passwordHash, 'Demo Kid');

    // Seed achievements
    const insertAch = db.prepare('INSERT OR IGNORE INTO achievements (code, title, description) VALUES (?, ?, ?)');
    insertAch.run('FIRST_LESSON_COMPLETE', 'First Steps', 'Complete your first lesson.');
    insertAch.run('PERFECT_SCORE', 'Perfect!', 'Score 100% on any lesson quiz.');
    insertAch.run('THREE_LESSONS', 'Getting the Hang', 'Complete three lessons.');
  });

  tx();
}


