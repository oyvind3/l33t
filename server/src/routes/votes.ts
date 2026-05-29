import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { AuthRequest, requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/polls/:id/vote - vote on a poll
router.post('/:id/vote', requireAuth, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { optionIndex } = req.body as { optionIndex?: number };

  if (optionIndex === undefined || typeof optionIndex !== 'number') {
    res.status(400).json({ error: 'optionIndex is required and must be a number' });
    return;
  }

  const poll = db.prepare('SELECT id, status, options FROM polls WHERE id = ?').get(id) as
    | { id: string; status: string; options: string }
    | undefined;

  if (!poll) {
    res.status(404).json({ error: 'Poll not found' });
    return;
  }

  if (poll.status !== 'open') {
    res.status(400).json({ error: 'Poll is not open for voting' });
    return;
  }

  const options = JSON.parse(poll.options) as string[];
  if (optionIndex < 0 || optionIndex >= options.length) {
    res.status(400).json({ error: 'Invalid option index' });
    return;
  }

  // Upsert vote
  const existingVote = db.prepare('SELECT id FROM votes WHERE pollId = ? AND userId = ?').get(id, req.user!.id) as
    | { id: string }
    | undefined;

  if (existingVote) {
    db.prepare('UPDATE votes SET optionIndex = ?, updatedAt = datetime(\'now\') WHERE id = ?').run(optionIndex, existingVote.id);
    res.json({ message: 'Vote updated', optionIndex });
  } else {
    const voteId = uuidv4();
    db.prepare('INSERT INTO votes (id, pollId, optionIndex, userId, username) VALUES (?, ?, ?, ?, ?)').run(
      voteId,
      id,
      optionIndex,
      req.user!.id,
      req.user!.username
    );
    res.status(201).json({ message: 'Vote recorded', optionIndex });
  }
});

// GET /api/polls/:id/votes - get votes for a poll
router.get('/:id/votes', requireAuth, (req: AuthRequest, res) => {
  const { id } = req.params;

  const poll = db.prepare('SELECT id, status, options FROM polls WHERE id = ?').get(id) as
    | { id: string; status: string; options: string }
    | undefined;

  if (!poll) {
    res.status(404).json({ error: 'Poll not found' });
    return;
  }

  // Only show votes if status is 'results' or user is admin
  if (poll.status !== 'results' && !req.user!.isAdmin) {
    res.status(403).json({ error: 'Votes are not visible yet' });
    return;
  }

  const votes = db.prepare('SELECT optionIndex, userId, username, createdAt FROM votes WHERE pollId = ?').all(id);
  res.json(votes);
});

export default router;
