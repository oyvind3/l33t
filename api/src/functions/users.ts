import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { getUserByUsername, addUser, getUserCount } from '../store';

const ADMIN_PASSWORD = 'lanparty2026';

app.http('users', {
  methods: ['POST'],
  route: 'users',
  handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
    const body = (await request.json()) as { username?: string; adminPassword?: string };
    const { username, adminPassword } = body;

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return { status: 400, jsonBody: { error: 'Username is required' } };
    }

    const trimmed = username.trim();
    if (trimmed.length > 30) {
      return { status: 400, jsonBody: { error: 'Username must be 30 characters or less' } };
    }

    const existing = getUserByUsername(trimmed);
    if (existing) {
      return { jsonBody: { id: existing.id, username: existing.username, isAdmin: existing.isAdmin } };
    }

    const isAdmin = getUserCount() === 0 || adminPassword === ADMIN_PASSWORD;
    const id = uuidv4();
    const user = { id, username: trimmed, isAdmin, createdAt: new Date().toISOString() };
    addUser(user);

    return { status: 201, jsonBody: { id, username: trimmed, isAdmin } };
  },
});
