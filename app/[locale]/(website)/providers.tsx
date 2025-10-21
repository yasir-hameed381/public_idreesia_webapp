"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../../../store/store";
import { ThemeProvider, useTheme } from "@/context/useTheme";
import { PermissionProvider } from "../../../context/PermissionContext";
import { useEffect } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

// Component to handle dynamic PrimeReact theme loading
function PrimeThemeLoader() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const loadPrimeTheme = async () => {
      // Remove existing PrimeReact theme
      const existingLink = document.querySelector('link[href*="primereact"]');
      if (existingLink) {
        existingLink.remove();
      }

      // Add new theme based on current theme
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        resolvedTheme === "dark"
          ? "https://cdn.jsdelivr.net/npm/primereact@10.0.0/resources/themes/lara-dark-indigo/theme.css"
          : "https://cdn.jsdelivr.net/npm/primereact@10.0.0/resources/themes/lara-light-indigo/theme.css";
      document.head.appendChild(link);
    };

    loadPrimeTheme();
  }, [resolvedTheme]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <PermissionProvider>
            <PrimeThemeLoader />
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </PermissionProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
