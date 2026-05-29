import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { getAuthUser, suggestions } from '../store';

// GET /api/suggestions
app.http('suggestions-get', {
  methods: ['GET'],
  route: 'suggestions',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    const user = getAuthUser(request);
    if (!user) return { status: 401, jsonBody: { error: 'Authentication required' } };

    const result = Array.from(suggestions.values()).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );

    return { jsonBody: result };
  },
});

// POST /api/suggestions
app.http('suggestions-create', {
  methods: ['POST'],
  route: 'suggestions',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    const user = getAuthUser(request);
    if (!user) return { status: 401, jsonBody: { error: 'Authentication required' } };

    const body = (await request.json()) as { title?: string; description?: string };

    if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
      return { status: 400, jsonBody: { error: 'Title is required' } };
    }

    if (body.title.trim().length > 100) {
      return { status: 400, jsonBody: { error: 'Title must be 100 characters or less' } };
    }

    const desc = typeof body.description === 'string' ? body.description.trim() : '';
    if (desc.length > 200) {
      return { status: 400, jsonBody: { error: 'Description must be 200 characters or less' } };
    }

    const id = uuidv4();
    const suggestion = {
      id,
      title: body.title.trim(),
      description: desc,
      userId: user.id,
      username: user.username,
      createdAt: new Date().toISOString(),
    };
    suggestions.set(id, suggestion);

    return { status: 201, jsonBody: suggestion };
  },
});

// DELETE /api/suggestions/{id}
app.http('suggestions-delete', {
  methods: ['DELETE'],
  route: 'suggestions/{id}',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    const user = getAuthUser(request);
    if (!user) return { status: 401, jsonBody: { error: 'Authentication required' } };

    const id = request.params.id!;
    const suggestion = suggestions.get(id);
    if (!suggestion) return { status: 404, jsonBody: { error: 'Suggestion not found' } };

    if (!user.isAdmin && user.id !== suggestion.userId) {
      return { status: 403, jsonBody: { error: 'Not authorized to delete this suggestion' } };
    }

    suggestions.delete(id);
    return { jsonBody: { success: true } };
  },
});
