# Research Project Report: CodeLearn (formerly KidCoder)

This document outlines the research motivation, related work, methodology, data model, implementation, and evaluation for CodeLearn, a W3Schools‑style learning site with interactive playground and progress tracking.

## Problem Statement and Need
Children aged 8–13 often struggle to connect abstract programming ideas to tangible outcomes. Existing tools either target text-based coding (high cognitive load) or block-based systems (limited transfer to text). There is a gap for ultra-lightweight, web-first, mobile-friendly content that teaches concepts with immediate feedback and persists progress without requiring accounts on third-party platforms.

## Related Work
- Scratch: excellent for visual logic; limited exposure to text-like syntax.
- Code.org: curated courses and block activities; less customizable for small institutions.
- Khan Academy CS: strong pedagogy; requires deeper reading and keyboard interaction.

These solutions are impactful but less optimized for short mobile attention spans with low-friction text-like interactions and immediate persistence. KidCoder introduces a pseudo-code playground with constrained grammar that bridges from natural language to code, plus micro-lessons and quizzes with persistence.

## Methodology and System Design
- Frontend: React + TypeScript, React Router, Bootstrap. Pages: Home, Learn (catalog), Lessons list/detail with quizzes, Playground, Dashboard, Login/Register, Search, References, Tutorials by language.
- Playground: dynamic, no hardcoded templates; JS executed in a sandboxed Function with safe context; Python‑like code transpiled to JS (supports f‑strings, range, print), HTML/CSS validated and previewed as text.
- Backend: Express + SQLite (better‑sqlite3). Connection initialized in `server/src/db.ts` (file path `server/data/app.db`).
- Auth: JWT‑based; client stores token and displayName in localStorage via Zustand store.
- Data: lessons, quizzes, users, progress (started/completed/score), achievements and user_achievements.
- Real‑time UX: client dispatches a `progress-updated` CustomEvent after quiz submit or achievement unlock; Dashboard listens and refetches immediately.

## Data Model
- users(id, email, password_hash, display_name, created_at)
- lessons(id, title, summary, content, language, topic)
- quizzes(id, lesson_id, question, options_json, answer_index)
- progress(id, user_id, lesson_id, started, completed, score, updated_at, UNIQUE(user_id,lesson_id))
- achievements(id, code UNIQUE, title, description)
- user_achievements(user_id, achievement_id, unlocked_at, PRIMARY KEY(user_id,achievement_id))

## Implementation Details
- REST Endpoints: register, login, list lessons, catalog (languages/topics), search, get lesson details+quizzes, start lesson (ack), submit answers (score + completion), progress summary, achievements (list). Unlock endpoint recommended for new flow: `POST /api/achievements/unlock`.
- Client routes: Home, Learn, Lessons, LessonDetail, Playground, Dashboard, Login, Register, Search, TutorialPage (`/tutorials/:language`), ReferencePage (`/reference/:language`).
- Navbar: simplified top‑level links (Tutorials → /learn, References → /reference/html) plus redirects for `/tutorials` and `/reference` to working defaults.
- Back navigation: reusable `<BackButton />` added to main pages.
- Responsiveness: Bootstrap grid, utility classes; simplified base CSS to avoid conflicts.

## Evaluation
- Accuracy: quizzes validate understanding; scoring done server‑side; client displays Score X/Y and “Completed!” when applicable.
- Usability: “Take Quiz” flow with start gate; immediate score; dashboard auto‑refresh on submit; clear back navigation.
- Robustness: SQLite with foreign keys; unique constraints on progress and user_achievements; client retries limited and shows errors inline.

## Ethics and Accessibility
- No tracking beyond app usage; accounts require minimal data.
- Keyboard navigation supported by semantic HTML; color contrast from Bootstrap.

## Limitations and Future Work
- Harden JS sandbox further; expand Python transpiler coverage; add live HTML iframe preview in a safe sandbox.
- Add `/api/achievements/unlock` on server (client already calls when quiz starts) and additional achievement logic (first lesson, perfect score, streaks).
- Adaptive learning paths and teacher dashboard; content authoring UI.

## References
- Bootstrap Docs.
- MDN Web Docs on Web Accessibility.
