import toast from 'react-hot-toast';
import type { User, Poll } from './types';

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

  const res = await fetch(url, { ...options, headers });
  const data = await res.json();

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

export async function vote(pollId: string, optionIndex: number): Promise<void> {
  await request('/api/polls/' + pollId + '/vote', {
    method: 'POST',
    body: JSON.stringify({ optionIndex }),
  });
}

export async function deletePoll(pollId: string): Promise<void> {
  await request('/api/polls/' + pollId, {
    method: 'DELETE',
  });
}
