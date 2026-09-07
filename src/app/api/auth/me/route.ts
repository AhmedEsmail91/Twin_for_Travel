import { handleMe } from '@/modules/auth/auth.controller';
import { withApiHandler } from '@/lib/http/handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withApiHandler(() => handleMe());
