import { useTranslations } from 'next-intl';

import { Badge, type BadgeTone } from '@/components/ui/Badge';
import type { TripStatus } from '@/modules/trips/trip.types';

const TONE_BY_STATUS: Record<TripStatus, BadgeTone> = {
  DRAFT: 'sand',
  UPCOMING: 'gold',
  ONGOING: 'success',
  COMPLETED: 'sand',
  CANCELLED: 'danger',
};

const TONE_ON_IMAGE: Record<TripStatus, BadgeTone> = {
  DRAFT: 'onDark',
  UPCOMING: 'navy',
  ONGOING: 'success',
  COMPLETED: 'onDark',
  CANCELLED: 'danger',
};

/**
 * Reads the *effective* status, so a trip whose end date has passed is labelled
 * "Completed" without anyone updating it by hand.
 */
export function TripStatusBadge({
  status,
  onImage = false,
}: {
  status: TripStatus;
  onImage?: boolean;
}) {
  const t = useTranslations('trips.status');

  return <Badge tone={onImage ? TONE_ON_IMAGE[status] : TONE_BY_STATUS[status]}>{t(status)}</Badge>;
}
