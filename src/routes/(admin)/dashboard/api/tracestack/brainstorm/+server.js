// CRUD for brainstorm items
import * as db from '../../../../../../lib/server/database.js';
const DEMO_USER_EMAIL = 'demo@tracestack.local';

export const GET = async ({ url, platform }) => {
  const session_id = url.searchParams.get('session_id');
  if (!session_id) {
    return new Response(JSON.stringify({ error: 'Missing session_id' }), { status: 400 });
  }
  const result = await db.tracestack_list_brainstorm(platform, session_id);
  if (result.error) {
    return new Response(JSON.stringify({ error: result.message }), { status: 500 });
  }
  return new Response(JSON.stringify(result.items), { status: 200 });
};

export const POST = async ({ request, platform }) => {
  const data = await request.json();
  data.created_by = DEMO_USER_EMAIL;
  const result = await db.tracestack_create_brainstorm(platform, data);
  if (result.error) {
    return new Response(JSON.stringify({ error: result.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ id: result.id }), { status: 201 });
};