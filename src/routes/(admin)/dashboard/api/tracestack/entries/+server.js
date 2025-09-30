export const PATCH = async ({ request, platform }) => {
  // Update entry (status, entry_type, etc.)
  const data = await request.json();
  if (!data.id) {
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
// CRUD for session entries
import * as db from '../../../../../../lib/server/database.js';

// For demo: use a static user (replace with real auth in production)
const DEMO_USER_EMAIL = 'demo@tracestack.local';

export const GET = async ({ url, platform }) => {
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
  // Create entry for a session
  const data = await request.json();
  data.created_by = DEMO_USER_EMAIL;
  const result = await db.tracestack_create_entry(platform, data);
  if (result.error) {
    return new Response(JSON.stringify({ error: result.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ id: result.id }), { status: 201 });
};