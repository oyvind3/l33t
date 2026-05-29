import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { getAuthUser, polls, votes } from '../store';

// GET /api/polls
app.http('polls-get', {
  methods: ['GET'],
  route: 'polls',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    const user = getAuthUser(request);
    if (!user) return { status: 401, jsonBody: { error: 'Authentication required' } };

    const result = Array.from(polls.values())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((poll) => {
        const isAdmin = user.isAdmin;
        const showVotes = poll.status === 'results' || isAdmin;
        const pollVotes = votes.filter((v) => v.pollId === poll.id);

        const voteCounts: number[] = poll.options.map((_, i) => {
          return pollVotes.filter((v) => v.optionIndex === i).length;
        });

        const myVote = pollVotes.find((v) => v.userId === user.id);
        const userVote = myVote ? myVote.optionIndex : null;

        let votersMap: Record<number, Array<{ userId: string; username: string }>> | undefined;
        if (showVotes) {
          votersMap = {};
          poll.options.forEach((_, i) => {
            votersMap![i] = pollVotes
              .filter((v) => v.optionIndex === i)
              .map((v) => ({ userId: v.userId, username: v.username }));
          });
        }

        return {
          id: poll.id,
          title: poll.title,
          description: poll.description,
          category: poll.category,
          status: poll.status,
          options: poll.options,
          voteCounts,
          voters: votersMap,
          userVote,
          totalVotes: voteCounts.reduce((a, b) => a + b, 0),
          createdAt: poll.createdAt,
        };
      });

    return { jsonBody: result };
  },
});

// POST /api/polls (admin only)
app.http('polls-create', {
  methods: ['POST'],
  route: 'polls',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    const user = getAuthUser(request);
    if (!user) return { status: 401, jsonBody: { error: 'Authentication required' } };
    if (!user.isAdmin) return { status: 403, jsonBody: { error: 'Admin access required' } };

    const body = (await request.json()) as {
      title?: string;
      description?: string;
      category?: string;
      options?: string[];
    };

    if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
      return { status: 400, jsonBody: { error: 'Title is required' } };
    }

    if (!body.options || !Array.isArray(body.options) || body.options.length < 2) {
      return { status: 400, jsonBody: { error: 'At least 2 options are required' } };
    }

    const validCategories = ['FPS', 'MOBA', 'Strategy', 'Party Games', 'Aktiviteter', 'Annet'];
    const cat = body.category && validCategories.includes(body.category) ? body.category : 'Annet';
    const cleanOptions = body.options.map((o) => String(o).trim()).filter((o) => o.length > 0);

    if (cleanOptions.length < 2) {
      return { status: 400, jsonBody: { error: 'At least 2 non-empty options are required' } };
    }

    const id = uuidv4();
    const poll = {
      id,
      title: body.title.trim(),
      description: (body.description || '').trim(),
      category: cat,
      status: 'open' as const,
      options: cleanOptions,
      createdAt: new Date().toISOString(),
    };
    polls.set(id, poll);

    return { status: 201, jsonBody: poll };
  },
});

// PATCH /api/polls/{id}/status (admin only)
app.http('polls-status', {
  methods: ['PATCH'],
  route: 'polls/{id}/status',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    const user = getAuthUser(request);
    if (!user) return { status: 401, jsonBody: { error: 'Authentication required' } };
    if (!user.isAdmin) return { status: 403, jsonBody: { error: 'Admin access required' } };

    const id = request.params.id!;
    const body = (await request.json()) as { status?: string };

    const validStatuses = ['open', 'closed', 'results'];
    if (!body.status || !validStatuses.includes(body.status)) {
      return { status: 400, jsonBody: { error: 'Status must be one of: open, closed, results' } };
    }

    const poll = polls.get(id);
    if (!poll) return { status: 404, jsonBody: { error: 'Poll not found' } };

    poll.status = body.status as 'open' | 'closed' | 'results';
    return { jsonBody: { id, status: body.status } };
  },
});

// DELETE /api/polls/{id} (admin only)
app.http('polls-delete', {
  methods: ['DELETE'],
  route: 'polls/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    const user = getAuthUser(request);
    if (!user) return { status: 401, jsonBody: { error: 'Authentication required' } };
    if (!user.isAdmin) return { status: 403, jsonBody: { error: 'Admin access required' } };

    const id = request.params.id!;
    const poll = polls.get(id);
    if (!poll) return { status: 404, jsonBody: { error: 'Poll not found' } };

    // Remove votes for this poll
    for (let i = votes.length - 1; i >= 0; i--) {
      if (votes[i].pollId === id) votes.splice(i, 1);
    }

    polls.delete(id);
    return { jsonBody: { success: true } };
  },
});

// POST /api/polls/{id}/vote
app.http('polls-vote', {
  methods: ['POST'],
  route: 'polls/{id}/vote',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    const user = getAuthUser(request);
    if (!user) return { status: 401, jsonBody: { error: 'Authentication required' } };

    const id = request.params.id!;
    const body = (await request.json()) as { optionIndex?: number };

    if (body.optionIndex === undefined || typeof body.optionIndex !== 'number') {
      return { status: 400, jsonBody: { error: 'optionIndex is required and must be a number' } };
    }

    const poll = polls.get(id);
    if (!poll) return { status: 404, jsonBody: { error: 'Poll not found' } };
    if (poll.status !== 'open') return { status: 400, jsonBody: { error: 'Poll is not open for voting' } };
    if (body.optionIndex < 0 || body.optionIndex >= poll.options.length) {
      return { status: 400, jsonBody: { error: 'Invalid option index' } };
    }

    const existingIdx = votes.findIndex((v) => v.pollId === id && v.userId === user.id);
    if (existingIdx >= 0) {
      votes[existingIdx].optionIndex = body.optionIndex;
      votes[existingIdx].updatedAt = new Date().toISOString();
      return { jsonBody: { message: 'Vote updated', optionIndex: body.optionIndex } };
    }

    votes.push({
      id: uuidv4(),
      pollId: id,
      optionIndex: body.optionIndex,
      userId: user.id,
      username: user.username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return { status: 201, jsonBody: { message: 'Vote recorded', optionIndex: body.optionIndex } };
  },
});
