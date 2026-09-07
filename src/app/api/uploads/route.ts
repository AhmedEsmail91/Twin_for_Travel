import { handleDelete, handleUpload } from '@/modules/media/media.controller';
import { withApiHandler } from '@/lib/http/handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withApiHandler((request) => handleUpload(request));
export const DELETE = withApiHandler((request) => handleDelete(request));
