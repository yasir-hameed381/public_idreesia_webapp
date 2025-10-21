import { Inter } from "next/font/google";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { Providers } from "./providers";
import { PermissionProvider } from "../../../context/PermissionContext";
import "../../../app/assets/styles/globals.css";
import "../../../app/nprogress.css";
import { ToastProvider } from "../../../context/ToastContext";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import LoadingBar from "../../../components/LoadingBar";

const inter = Inter({ subsets: ["latin"] });

const locales = ["en", "ur"];

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) notFound();

  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <LoadingBar />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <PermissionProvider>
              <ToastProvider>{children}</ToastProvider>
            </PermissionProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
