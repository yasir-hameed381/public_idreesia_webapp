'use client';

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { usePathname } from "next/navigation";
import { store, persistor } from "../../store/store";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { ThemeProvider } from "../../context/useTheme";

const ADMIN_ROUTE_SEGMENTS = new Set([
  "admin", "zone", "regions", "mehfildirectary", "committees", "ehadKarkun", "karkunan",
  "mehfil-reports", "tabarukats", "new-ehads", "tarteeb-requests", "khatoot",
  "response-templates", "admin-users", "roles", "categories", "tags", "Namaz",
  "naat-Shareef", "taleemats", "mehfil", "wazaifs", "messages", "Parhaiyan",
  "feedback", "file-uploader", "duty-types", "duty-roster", "coordinators",
  "users", "settings",
]);

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segmentAfterLocale = pathname?.split("/")[2] ?? "";
  const isAdmin = ADMIN_ROUTE_SEGMENTS.has(segmentAfterLocale);
  const isKarkunPortal = pathname?.includes("karkun-portal");
  const isCommitteePortal = pathname?.includes("committee-portal");
  const hideSiteHeaderFooter = isAdmin || isKarkunPortal || isCommitteePortal;

  return (
    <ThemeProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {hideSiteHeaderFooter ? (
            <>{children}</>
          ) : (
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          )}
        </PersistGate>
      </Provider>
    </ThemeProvider>
  );
}