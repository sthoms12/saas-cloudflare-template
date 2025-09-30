// CRUD for sessions
import * as db from '../../../../../../lib/server/database.js';

// For demo: use a static user (replace with real auth in production)
const DEMO_USER_EMAIL = 'demo@tracestack.local';

export const GET = async ({ platform }) => {
  // List sessions for the demo user
  const result = await db.tracestack_list_sessions(platform, DEMO_USER_EMAIL);
  if (result.error) {
    return new Response(JSON.stringify({ error: result.message }), { status: 500 });
  }
  return new Response(JSON.stringify(result.sessions), { status: 200 });
};

export const POST = async ({ request, platform }) => {
  // Create session for the demo user
  const data = await request.json();
  data.created_by = DEMO_USER_EMAIL;
  const result = await db.tracestack_create_session(platform, data);
  if (result.error) {
    return new Response(JSON.stringify({ error: result.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ id: result.id }), { status: 201 });
};