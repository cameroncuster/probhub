import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const problemUrl = url.searchParams.get('url');
  if (!problemUrl) {
    return json({ error: 'No URL provided' }, { status: 400 });
  }

  try {
    const response = await fetch(problemUrl);
    if (!response.ok) {
      return json({ error: 'Failed to fetch problem' }, { status: response.status });
    }
    const html = await response.text();
    return json({ html });
  } catch (error) {
    console.error('Error fetching Kattis problem:', error);
    return json({ error: 'Failed to fetch problem' }, { status: 500 });
  }
};
