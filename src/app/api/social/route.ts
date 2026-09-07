import {
  handleCreateSocialLink,
  handleListSocialLinks,
} from '@/modules/social/social.controller';
import { withApiHandler } from '@/lib/http/handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withApiHandler((request) => handleListSocialLinks(request));
export const POST = withApiHandler((request) => handleCreateSocialLink(request));
