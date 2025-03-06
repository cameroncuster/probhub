// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { redirect } from '@sveltejs/kit';

export const GET = async (event) => {
  const {
    url,
    locals: { supabase }
  } = event;
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      throw redirect(303, `/${next.slice(1)}`);
    } else {
      console.error('Auth error:', error);
      // Redirect to home page or login page with an error parameter
      throw redirect(303, '/?auth_error=true');
    }
  }

  // If no code is present, redirect to home
  throw redirect(303, '/');
};
