import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { AuthRequest, requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/suggestions - get all suggestions
router.get('/', requireAuth, (_req: AuthRequest, res) => {
  const suggestions = db
    .prepare('SELECT * FROM suggestions ORDER BY createdAt DESC')
    .all();
  res.json(suggestions);
});

// POST /api/suggestions - create a suggestion
router.post('/', requireAuth, (req: AuthRequest, res) => {
  const { title, description } = req.body as { title?: string; description?: string };

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  if (title.trim().length > 100) {
    res.status(400).json({ error: 'Title must be 100 characters or less' });
    return;
  }

  const desc = typeof description === 'string' ? description.trim() : '';
  if (desc.length > 200) {
    res.status(400).json({ error: 'Description must be 200 characters or less' });
    return;
  }

  const id = uuidv4();
  db.prepare(
    'INSERT INTO suggestions (id, title, description, userId, username) VALUES (?, ?, ?, ?, ?)'
  ).run(id, title.trim(), desc, req.user!.id, req.user!.username);

  res.status(201).json({
    id,
    title: title.trim(),
    description: desc,
    userId: req.user!.id,
    username: req.user!.username,
  });
});

// DELETE /api/suggestions/:id - delete a suggestion (admin or owner)
router.delete('/:id', requireAuth, (req: AuthRequest, res) => {
  const suggestion = db.prepare('SELECT id, userId FROM suggestions WHERE id = ?').get(req.params.id) as
    | { id: string; userId: string }
    | undefined;

  if (!suggestion) {
    res.status(404).json({ error: 'Suggestion not found' });
    return;
  }

  if (!req.user!.isAdmin && req.user!.id !== suggestion.userId) {
    res.status(403).json({ error: 'Not authorized to delete this suggestion' });
    return;
  }

  db.prepare('DELETE FROM suggestions WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
