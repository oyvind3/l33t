import toast from 'react-hot-toast';
import type { User, Poll } from './types';

const API_BASE = import.meta.env.VITE_API_URL || '';

function getUserId(): string | null {
  const stored = localStorage.getItem('pollapp_user');
  if (stored) {
    try {
      return JSON.parse(stored).id;
    } catch {
      return null;
    }
  }
  return null;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const userId = getUserId();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(userId ? { 'x-user-id': userId } : {}),
    ...(options?.headers as Record<string, string> || {}),
  };

  const res = await fetch(API_BASE + url, { ...options, headers });
  const data = await res.json();

  if (res.status === 401 && userId) {
    // User ID is stale (backend cold start). Re-register.
    const stored = localStorage.getItem('pollapp_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      const regRes = await fetch(API_BASE + '/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: parsed.username }),
      });
      if (regRes.ok) {
        const newUser = await regRes.json();
        localStorage.setItem('pollapp_user', JSON.stringify(newUser));
        // Retry with new ID
        const retryHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          'x-user-id': newUser.id,
          ...(options?.headers as Record<string, string> || {}),
        };
        const retryRes = await fetch(API_BASE + url, { ...options, headers: retryHeaders });
        const retryData = await retryRes.json();
        if (!retryRes.ok) {
          const msg = retryData.error || 'Something went wrong';
          toast.error(msg);
          throw new Error(msg);
        }
        return retryData as T;
      }
    }
  }

  if (!res.ok) {
    const msg = data.error || 'Something went wrong';
    toast.error(msg);
    throw new Error(msg);
  }

  return data as T;
}

export async function registerUser(username: string, adminPassword?: string): Promise<User> {
  return request<User>('/api/users', {
    method: 'POST',
    body: JSON.stringify({ username, adminPassword }),
  });
}

export async function fetchPolls(): Promise<Poll[]> {
  return request<Poll[]>('/api/polls');
}

export async function createPoll(data: {
  title: string;
  description: string;
  category: string;
  options: string[];
}): Promise<Poll> {
  return request<Poll>('/api/polls', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePollStatus(pollId: string, status: string): Promise<void> {
  await request('/api/polls/' + pollId + '/status', {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function vote(pollId: string, option: string): Promise<void> {
  await request('/api/polls/' + pollId + '/vote', {
    method: 'POST',
    body: JSON.stringify({ option }),
  });
}

export async function deletePoll(pollId: string): Promise<void> {
  await request('/api/polls/' + pollId, {
    method: 'DELETE',
  });
}
