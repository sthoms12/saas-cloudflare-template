import { check_rate_limit } from '../../../../../../lib/server/rate_limit.js';
import * as db from '../../../../../../lib/server/database.js';

// For demo: use a static user (replace with real auth in production)
const DEMO_USER_EMAIL = 'demo@tracestack.local';

export const GET = async ({ url, platform, request }) => {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }
  // Rate limit by IP for GET requests
  const ip = platform?.request?.headers.get('cf-connecting-ip') || 'unknown';
  const allowed = await check_rate_limit(platform, 'tracestack-entries-get', ip, 'na');
  if (!allowed) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 });
  }
  // List entries for a session (session_id as query param)
  const session_id = url.searchParams.get('session_id');
  if (!session_id) {
    return new Response(JSON.stringify({ error: 'Missing session_id' }), { status: 400 });
  }
  const result = await db.tracestack_list_entries(platform, session_id);
  if (result.error) {
    return new Response(JSON.stringify({ error: result.message }), { status: 500 });
  }
  return new Response(JSON.stringify(result.entries), { status: 200 });
};

export const POST = async ({ request, platform }) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }
  // Create entry for a session
  let data;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }
  if (!data || typeof data !== 'object' || !data.session_id || typeof data.content !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
  }
  data.created_by = DEMO_USER_EMAIL;
  const result = await db.tracestack_create_entry(platform, data);
  if (result.error) {
    return new Response(JSON.stringify({ error: result.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ id: result.id }), { status: 201 });
};

export const PATCH = async ({ request, platform }) => {
  if (request.method !== 'PATCH') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }
  let data;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }
  if (!data || typeof data !== 'object' || !data.id) {
    return new Response(JSON.stringify({ error: 'Missing entry id' }), { status: 400 });
  }
  // Build dynamic update query for allowed fields
  const fields = [];
  const values = [];
  if (data.status) {
    fields.push('status = ?');
    values.push(data.status);
  }
  if (data.entry_type) {
    fields.push('entry_type = ?');
    values.push(data.entry_type);
  }
  if (fields.length === 0) {
    return new Response(JSON.stringify({ error: 'No updatable fields provided' }), { status: 400 });
  }
  fields.push('updated_date = ?');
  values.push(new Date().toISOString());
  values.push(data.id);
  const query = `UPDATE session_entry SET ${fields.join(', ')} WHERE id = ?;`;
  try {
    let res = await platform.env.DB.prepare(query).bind(...values).run();
    if (res.success && res.meta && res.meta.changes > 0) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: 'Entry not found or not updated' }), { status: 404 });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};