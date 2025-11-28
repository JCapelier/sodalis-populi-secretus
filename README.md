
# Sodalis Populi Secretus

This is a Secret Santa (but it doesn't have to be Christmas to make gifts in a group) web application built with Next.js (App Router, TypeScript, and PostgreSQL). The project was created as a learning exercise to get familiar with the Next.js framework and modern full-stack development practices.

## Features
- User authentication (NextAuth.js)
- Event creation and management (Secret Santa events)
- Add, edit, and manage children and participants
- Draft (pairing) system for Secret Santa assignments
- Exclusion rules and participant management

## Tech Stack
- Next.js (App Router, TypeScript)
- PostgreSQL (with node-pg-migrate for migrations)
- next-auth for authentication
- Tailwind CSS for styling

## Getting Started
1. **Install dependencies:**
	```bash
	npm install
	```
2. **Set up your database:**
	- Configure your PostgreSQL connection in `.env`.
	- Run migrations:
	  ```bash
	  npm run migrate
	  ```
3. **Run the development server:**
	```bash
	npm run dev
	```
4. **Open the app:**
	Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
- `src/app/` — Next.js app routes and API endpoints
- `src/components/` — React components (modals, forms, dashboard, etc.)
- `src/repositories/` — Database access logic (repository pattern)
- `src/services/` — Business logic (e.g., DraftService)
- `src/utils/` — Utility functions (e.g., family jokes)
- `migrations/` — Database migration scripts

## Notes
- This project is for learning and experimentation.
- Family-specific jokes are included for fun in the draft modal.
---

Enjoy your Secret Santa! 🎅
