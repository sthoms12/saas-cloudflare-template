// Server-side layout guard for dashboard: require authentication
import { redirect } from '@sveltejs/kit';
import { getSession } from '../../../lib/server/session.js';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ cookies, locals, url }) {
  // Try to get session from cookies or locals
  let session = locals.session;
  if (!session) {
    session = await getSession(cookies.get('session_id'));
  }
  if (!session || !session.user) {
    throw redirect(302, `/sign-in?redirectTo=${encodeURIComponent(url.pathname)}`);
  }
  return { user: session.user };
}