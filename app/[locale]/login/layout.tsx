import { Providers } from "../(website)/providers";
import "../../assets/styles/globals.css";
import { NextIntlClientProvider } from "next-intl";

export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  // Dynamically import messages for the current locale
  const messages = require(`../../../messages/${locale}.json`);
  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
