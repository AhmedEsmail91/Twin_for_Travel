import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/i18n/navigation';

export default async function NotFound() {
  const t = await getTranslations('errors.notFound');

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="mb-6 flex size-16 items-center justify-center rounded-full border border-gold/45 bg-gold/10 text-gold-dark">
        <Icon name="plane" size={28} />
      </span>

      <p className="u-numeric u-label mb-3 text-gold-dark">404</p>
      <h1 className="text-h1 font-display text-navy">{t('title')}</h1>
      <p className="mt-4 max-w-md text-body text-ink-soft">{t('body')}</p>

      <Button as={Link} href="/" variant="primary" className="mt-8">
        {t('cta')}
      </Button>
    </Container>
  );
}
