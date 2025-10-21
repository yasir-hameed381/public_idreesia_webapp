"use client";

import { ReactNode, useState, useEffect } from "react";
import "../../assets/styles/globals.css";
import "../../../app/nprogress.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../../../store/store";
import { AppSidebar } from "./sidebar";
import { useRouter } from "next/navigation";
import { ToastProvider } from "../../../context/ToastContext";
import { PermissionProvider } from "../../../context/PermissionContext";
import { useAuth } from "../../../hooks/useAuth";
import { authService } from "../../../services/auth-service";
import { ThemeProvider, useTheme } from "@/context/useTheme";
import LoadingBar from "../../../components/LoadingBar";
import GlobalLoading from "../../../components/GlobalLoading";

// Separate component that uses Redux hooks
function AdminContent({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const router = useRouter();
  const { isAuthenticated, isLoading, user, isInitialized } = useAuth();
  const { resolvedTheme } = useTheme();

  // Dynamically import PrimeReact theme based on current theme
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

  // Reduced timeout for faster navigation
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoadingTimeout(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  // Check if we're on the client side before accessing window
  useEffect(() => {
    // Function to determine if viewport is mobile size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    // Check on initial load
    checkMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Quick check for authentication before showing loading
  const quickAuthCheck = () => {
    const hasToken = authService.hasToken();
    const userData = localStorage.getItem("user");
    return { hasToken, hasUser: !!userData };
  };

  // Show loading while checking authentication (but only briefly)
  if ((isLoading || !isInitialized) && !loadingTimeout) {
    const { hasToken, hasUser } = quickAuthCheck();

    // If no token or user data, redirect immediately
    if (!hasToken || !hasUser) {
      console.log("No auth data found, redirecting to login");
      router.replace("/login");
      return <GlobalLoading text="Redirecting to login..." />;
    }

    return <GlobalLoading text="Loading authentication..." />;
  }

  // If timeout reached, check authentication status directly
  if (loadingTimeout) {
    console.log("Checking authentication status after timeout");
    const { hasToken, hasUser } = quickAuthCheck();

    if (!hasToken || !hasUser) {
      console.log("No authentication found, redirecting to login");
      router.replace("/login");
      return <GlobalLoading text="Redirecting to login..." />;
    }
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    router.replace("/login");
    return <GlobalLoading text="Redirecting to login..." />;
  }

  // Redirect to home if not admin
  if (!user || !authService.isUserAdmin(user)) {
    console.log("Not admin, redirecting to home");
    router.replace("/");
    return <GlobalLoading text="Redirecting..." />;
  }

  console.log("Authentication successful, rendering admin content");

  return (
    <>
      {/* Pass the collapsed state and toggle function to the sidebar */}
      <AppSidebar
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />

      {/* Adjust main content margin based on sidebar state */}
      <main
        className={`
        flex-1 min-h-screen 
        transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? "sm:ml-20" : "sm:ml-64"}
        ml-0
      `}
      >
        {/* Optional: Mobile toggle button that only shows on small screens */}
        {isMobile && (
          <button
            onClick={toggleSidebar}
            className="fixed z-50 top-4 left-4 p-2 rounded-md bg-gray-200 shadow-md lg:hidden"
            aria-label="Toggle sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        )}

        {children}
      </main>
    </>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <LoadingBar />
        <Provider store={store}>
          <ToastProvider>
            <PersistGate loading={<GlobalLoading text="Loading app state..." />} persistor={persistor}>
              <ThemeProvider>
                <PermissionProvider>
                  <AdminContent>{children}</AdminContent>
                </PermissionProvider>
              </ThemeProvider>
            </PersistGate>
          </ToastProvider>
        </Provider>
      </body>
    </html>
  );
}
