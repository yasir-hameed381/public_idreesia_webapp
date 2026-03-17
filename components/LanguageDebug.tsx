'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';

export const LanguageDebug = () => {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, padding: '10px', background: '#f0f0f0' }}>
      <p>Current Language: {locale}</p>
      <p>Path: {pathname}</p>
    </div>
  );
};