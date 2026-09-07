import { handleLogout } from '@/modules/auth/auth.controller';
import { withApiHandler } from '@/lib/http/handler';

export const runtime = 'nodejs';

export const POST = withApiHandler(() => handleLogout());
