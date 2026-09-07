import {
  handleGetSettings,
  handleUpdateSettings,
} from '@/modules/settings/settings.controller';
import { withApiHandler } from '@/lib/http/handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withApiHandler(() => handleGetSettings());
export const PUT = withApiHandler((request) => handleUpdateSettings(request));
