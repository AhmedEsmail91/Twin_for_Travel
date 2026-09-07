import {
  handleDeleteSocialLink,
  handleUpdateSocialLink,
} from '@/modules/social/social.controller';
import { withApiHandler } from '@/lib/http/handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { id: string };

export const PATCH = withApiHandler<Params>(async (request, { params }) =>
  handleUpdateSocialLink(request, (await params).id),
);

export const DELETE = withApiHandler<Params>(async (_request, { params }) =>
  handleDeleteSocialLink((await params).id),
);
