import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

export const LanguageDebug = () => {
  const { i18n } = useTranslation();
  const router = useRouter();

  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, padding: '10px', background: '#f0f0f0' }}>
      <p>Current Language: {i18n.language}</p>
      <p>Router Locale: {router.locale}</p>
    </div>
  );
};