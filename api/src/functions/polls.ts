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
        const pollVotes = votes.filter((v) => v.pollId === poll.id);

        const voteCounts: number[] = poll.options.map((_, i) => {
          return pollVotes.filter((v) => v.optionIndex === i).length;
        });

        const myVotes = pollVotes.filter((v) => v.userId === user.id).map((v) => v.optionIndex);

        // Always show voters so people can see who voted what
        const votersMap: Record<number, Array<{ userId: string; username: string }>> = {};
        poll.options.forEach((_, i) => {
          votersMap[i] = pollVotes
            .filter((v) => v.optionIndex === i)
            .map((v) => ({ userId: v.userId, username: v.username }));
        });

        // Sort options by vote count (most voted first)
        const indices = poll.options.map((_, i) => i);
        indices.sort((a, b) => (voteCounts[b] || 0) - (voteCounts[a] || 0));

        const sortedOptions = indices.map((i) => poll.options[i]);
        const sortedVoteCounts = indices.map((i) => voteCounts[i]);
        const sortedVoters: Record<number, Array<{ userId: string; username: string }>> = {};
        indices.forEach((origIdx, newIdx) => {
          sortedVoters[newIdx] = votersMap[origIdx] || [];
        });
        const sortedUserVotes = myVotes.map((origIdx) => indices.indexOf(origIdx)).filter((i) => i !== -1);

        return {
          id: poll.id,
          title: poll.title,
          description: poll.description,
          category: poll.category,
          status: poll.status,
          options: sortedOptions,
          voteCounts: sortedVoteCounts,
          voters: sortedVoters,
          userVotes: sortedUserVotes,
          totalVotes: sortedVoteCounts.reduce((a, b) => a + b, 0),
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
    const body = (await request.json()) as { option?: string };

    if (!body.option || typeof body.option !== 'string') {
      return { status: 400, jsonBody: { error: 'option (game name) is required' } };
    }

    const poll = polls.get(id);
    if (!poll) return { status: 404, jsonBody: { error: 'Poll not found' } };
    if (poll.status !== 'open') return { status: 400, jsonBody: { error: 'Poll is not open for voting' } };

    const optionIndex = poll.options.indexOf(body.option);
    if (optionIndex === -1) {
      return { status: 400, jsonBody: { error: 'Invalid option' } };
    }

    // Toggle vote: if already voted for this option, remove it. Otherwise, add it.
    const existingIdx = votes.findIndex((v) => v.pollId === id && v.userId === user.id && v.optionIndex === optionIndex);
    if (existingIdx >= 0) {
      votes.splice(existingIdx, 1);
      return { jsonBody: { message: 'Vote removed', option: body.option } };
    }

    votes.push({
      id: uuidv4(),
      pollId: id,
      optionIndex,
      userId: user.id,
      username: user.username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return { status: 201, jsonBody: { message: 'Vote recorded', option: body.option } };
  },
});
