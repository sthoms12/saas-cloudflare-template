// CRUD for sessions
import * as db from '../../../../../../lib/server/database.js';
import { check_rate_limit } from '../../../../../../lib/server/rate_limit.js';

// For demo: use a static user (replace with real auth in production)
const DEMO_USER_EMAIL = 'demo@tracestack.local';

export const GET = async ({ platform, request }) => {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }
  // Rate limit by IP for GET requests
  const ip = platform?.request?.headers.get('cf-connecting-ip') || 'unknown';
  const allowed = await check_rate_limit(platform, 'tracestack-sessions-get', ip, 'na');
  if (!allowed) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 });
  }
  // List sessions for the demo user
  const result = await db.tracestack_list_sessions(platform, DEMO_USER_EMAIL);
  if (result.error) {
    return new Response(JSON.stringify({ error: result.message }), { status: 500 });
  }
  return new Response(JSON.stringify(result.sessions), { status: 200 });
};

export const POST = async ({ request, platform }) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }
  let data;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }
  if (!data || typeof data !== 'object' || !data.name || typeof data.name !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
  }
  data.created_by = DEMO_USER_EMAIL;
  // Rate limit by IP for POST requests
  const ip = platform?.request?.headers.get('cf-connecting-ip') || 'unknown';
  const allowed = await check_rate_limit(platform, 'tracestack-sessions-post', ip, 'na');
  if (!allowed) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 });
  }
  // Create session for the demo user
  const result = await db.tracestack_create_session(platform, data);
  if (result.error) {
    return new Response(JSON.stringify({ error: result.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ id: result.id }), { status: 201 });
};