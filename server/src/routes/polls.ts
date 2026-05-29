import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { AuthRequest, requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/polls - get all polls
router.get('/', requireAuth, (req: AuthRequest, res) => {
  const polls = db.prepare('SELECT * FROM polls ORDER BY createdAt DESC').all() as Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    options: string;
    createdAt: string;
  }>;

  const result = polls.map((poll) => {
    const options = JSON.parse(poll.options) as string[];
    const isAdmin = req.user!.isAdmin;
    const showVotes = poll.status === 'results' || isAdmin;

    let voteCounts: number[] = [];
    let voters: Record<number, Array<{ userId: string; username: string }>> = {};
    let userVote: number | null = null;

    if (showVotes || poll.status === 'open') {
      // Get vote counts
      const counts = db
        .prepare('SELECT optionIndex, COUNT(*) as count FROM votes WHERE pollId = ? GROUP BY optionIndex')
        .all(poll.id) as Array<{ optionIndex: number; count: number }>;

      voteCounts = options.map((_, i) => {
        const found = counts.find((c) => c.optionIndex === i);
        return found ? found.count : 0;
      });

      // Get current user's vote
      const myVote = db.prepare('SELECT optionIndex FROM votes WHERE pollId = ? AND userId = ?').get(poll.id, req.user!.id) as
        | { optionIndex: number }
        | undefined;
      userVote = myVote ? myVote.optionIndex : null;
    }

    if (showVotes) {
      // Get voter details per option
      const allVotes = db
        .prepare('SELECT optionIndex, userId, username FROM votes WHERE pollId = ?')
        .all(poll.id) as Array<{ optionIndex: number; userId: string; username: string }>;

      voters = {};
      options.forEach((_, i) => {
        voters[i] = allVotes.filter((v) => v.optionIndex === i).map((v) => ({ userId: v.userId, username: v.username }));
      });
    }

    return {
      id: poll.id,
      title: poll.title,
      description: poll.description,
      category: poll.category,
      status: poll.status,
      options,
      voteCounts,
      voters: showVotes ? voters : undefined,
      userVote,
      totalVotes: voteCounts.reduce((a, b) => a + b, 0),
      createdAt: poll.createdAt,
    };
  });

  res.json(result);
});

// POST /api/polls - create a new poll (admin only)
router.post('/', requireAdmin, (req: AuthRequest, res) => {
  const { title, description, category, options } = req.body as {
    title?: string;
    description?: string;
    category?: string;
    options?: string[];
  };

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  if (!options || !Array.isArray(options) || options.length < 2) {
    res.status(400).json({ error: 'At least 2 options are required' });
    return;
  }

  const validCategories = ['FPS', 'MOBA', 'Strategy', 'Party Games', 'Aktiviteter', 'Annet'];
  const cat = category && validCategories.includes(category) ? category : 'Annet';

  const id = uuidv4();
  const cleanOptions = options.map((o) => String(o).trim()).filter((o) => o.length > 0);

  if (cleanOptions.length < 2) {
    res.status(400).json({ error: 'At least 2 non-empty options are required' });
    return;
  }

  db.prepare('INSERT INTO polls (id, title, description, category, options) VALUES (?, ?, ?, ?, ?)').run(
    id,
    title.trim(),
    (description || '').trim(),
    cat,
    JSON.stringify(cleanOptions)
  );

  res.status(201).json({
    id,
    title: title.trim(),
    description: (description || '').trim(),
    category: cat,
    status: 'open',
    options: cleanOptions,
  });
});

// PATCH /api/polls/:id/status - change poll status (admin only)
router.patch('/:id/status', requireAdmin, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status } = req.body as { status?: string };

  const validStatuses = ['open', 'closed', 'results'];
  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({ error: 'Status must be one of: open, closed, results' });
    return;
  }

  const poll = db.prepare('SELECT id FROM polls WHERE id = ?').get(id);
  if (!poll) {
    res.status(404).json({ error: 'Poll not found' });
    return;
  }

  db.prepare('UPDATE polls SET status = ? WHERE id = ?').run(status, id);
  res.json({ id, status });
});

// DELETE /api/polls/:id - delete a poll (admin only)
router.delete('/:id', requireAdmin, (req: AuthRequest, res) => {
  const { id } = req.params;

  const poll = db.prepare('SELECT id FROM polls WHERE id = ?').get(id);
  if (!poll) {
    res.status(404).json({ error: 'Poll not found' });
    return;
  }

  db.prepare('DELETE FROM votes WHERE pollId = ?').run(id);
  db.prepare('DELETE FROM polls WHERE id = ?').run(id);
  res.json({ success: true });
});

export default router;
