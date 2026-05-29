import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';

const router = Router();

const ADMIN_PASSWORD = 'lanparty2026';

router.post('/', (req, res) => {
  const { username, adminPassword } = req.body as { username?: string; adminPassword?: string };

  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    res.status(400).json({ error: 'Username is required' });
    return;
  }

  const trimmed = username.trim();
  if (trimmed.length > 30) {
    res.status(400).json({ error: 'Username must be 30 characters or less' });
    return;
  }

  // Check if username already exists
  const existing = db.prepare('SELECT id, username, isAdmin FROM users WHERE username = ?').get(trimmed) as
    | { id: string; username: string; isAdmin: number }
    | undefined;

  if (existing) {
    // Return existing user (re-login)
    res.json({ id: existing.id, username: existing.username, isAdmin: !!existing.isAdmin });
    return;
  }

  // Check if this is the first user (auto-admin) or if admin password is provided
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  const isAdmin = userCount.count === 0 || adminPassword === ADMIN_PASSWORD;

  const id = uuidv4();
  db.prepare('INSERT INTO users (id, username, isAdmin) VALUES (?, ?, ?)').run(id, trimmed, isAdmin ? 1 : 0);

  res.status(201).json({ id, username: trimmed, isAdmin });
});

export default router;
