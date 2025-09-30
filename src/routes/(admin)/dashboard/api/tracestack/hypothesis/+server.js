// CRUD for hypotheses
import * as db from '../../../../../../lib/server/database.js';
import { check_rate_limit } from '../../../../../../lib/server/rate_limit.js';
const DEMO_USER_EMAIL = 'demo@tracestack.local';

export const GET = async ({ url, platform, request }) => {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }
  // Rate limit by IP for GET requests
  const ip = platform?.request?.headers.get('cf-connecting-ip') || 'unknown';
  const allowed = await check_rate_limit(platform, 'tracestack-hypothesis-get', ip, 'na');
  if (!allowed) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 });
  }
  const session_id = url.searchParams.get('session_id');
  if (!session_id) {
    return new Response(JSON.stringify({ error: 'Missing session_id' }), { status: 400 });
  }
  const result = await db.tracestack_list_hypotheses(platform, session_id);
  if (result.error) {
    return new Response(JSON.stringify({ error: result.message }), { status: 500 });
  }
  return new Response(JSON.stringify(result.items), { status: 200 });
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
  if (!data || typeof data !== 'object' || !data.session_id || typeof data.description !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
  }
  data.created_by = DEMO_USER_EMAIL;
  // Rate limit by IP for POST requests
  const ip = platform?.request?.headers.get('cf-connecting-ip') || 'unknown';
  const allowed = await check_rate_limit(platform, 'tracestack-hypothesis-post', ip, 'na');
  if (!allowed) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 });
  }
  const result = await db.tracestack_create_hypothesis(platform, data);
  if (result.error) {
    return new Response(JSON.stringify({ error: result.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ id: result.id }), { status: 201 });
};