import type { APIContext } from 'astro';
import { blogFeed } from '../../lib/feeds';

export const GET = (context: APIContext): Promise<Response> => blogFeed(context, 'tr');
