import { Inter } from 'next/font/google';
import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Providers } from './providers';
import logo1 from "../assets/logo1.png";
import "../../app/assets/styles/globals.css";

const inter = Inter({ subsets: ['latin'] });

export const locales = ['en', 'ur'];

export const metadata: Metadata = {
  title: "سلسلہ محمدیہ امینیہ ادریسیہ تعلیمات | Silsila Muhammadia Ameenia Idreesia",
  description: "Idreesia Web App",
  icons: {
    icon: logo1.src,
    shortcut: logo1.src,
    apple: logo1.src,
  },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

async function getMessages(locale: string) {
  try {
    return (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!locales.includes(locale)) {
    notFound();
  }

  unstable_setRequestLocale(locale);

  const messages = await getMessages(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}