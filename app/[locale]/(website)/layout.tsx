import { notFound } from "next/navigation";
import { ThemeProvider } from "@/context/useTheme";
import { PermissionProvider } from "../../../context/PermissionContext";
import { ToastProvider } from "../../../context/ToastContext";
import { PrimeThemeLoader } from "./providers";
import "../../../app/assets/styles/globals.css";
import "../../../app/nprogress.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import LoadingBar from "../../../components/LoadingBar";

const locales = ["en", "ur"];

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function WebsiteLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!locales.includes(locale)) notFound();

  return (
    <>
      <LoadingBar />
      <ThemeProvider>
        <PrimeThemeLoader />
        <PermissionProvider>
          <ToastProvider>{children}</ToastProvider>
        </PermissionProvider>
      </ThemeProvider>
    </>
  );
}
