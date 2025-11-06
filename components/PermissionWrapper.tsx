"use client";

import React, { ReactNode } from "react";
import { usePermissions } from "@/context/PermissionContext";
import { PermissionName } from "@/types/permission";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface PermissionWrapperProps {
  children: ReactNode;
  requiredPermission?: PermissionName | PermissionName[];
  fallback?: ReactNode;
  redirectTo?: string;
  showAccessDenied?: boolean;
}

export const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  children,
  requiredPermission,
  fallback = null,
  redirectTo = "/dashboard",
  showAccessDenied = false,
}) => {
  const { hasPermission, user } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    // If no permission required, allow access
    if (!requiredPermission) return;

    // In Laravel, super_admin users still need roles with permissions
    // Check if user has required permission
    if (!hasPermission(requiredPermission)) {
      if (showAccessDenied) {
        // Show access denied message instead of redirecting
        return;
      } else {
        // Redirect to specified page
        router.replace(redirectTo);
      }
    }
  }, [
    requiredPermission,
    hasPermission,
    router,
    redirectTo,
    showAccessDenied,
  ]);

  // If no permission required, render children
  if (!requiredPermission) {
    return <>{children}</>;
  }

  // In Laravel, super_admin users still need roles with permissions
  // Check if user has required permission
  if (!hasPermission(requiredPermission)) {
    if (showAccessDenied) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page.
            </p>
            {user?.role && (
              <p className="text-sm text-gray-500">
                Your role:{" "}
                <span className="font-semibold">{user.role.name}</span>
              </p>
            )}
            <button
              onClick={() => router.push(redirectTo)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Higher-order component for page-level permission protection
export const withPermission = (
  WrappedComponent: React.ComponentType<any>,
  requiredPermission?: PermissionName | PermissionName[],
  options?: {
    fallback?: ReactNode;
    redirectTo?: string;
    showAccessDenied?: boolean;
  }
) => {
  return (props: any) => (
    <PermissionWrapper
      requiredPermission={requiredPermission}
      fallback={options?.fallback}
      redirectTo={options?.redirectTo}
      showAccessDenied={options?.showAccessDenied}
    >
      <WrappedComponent {...props} />
    </PermissionWrapper>
  );
};

// Specific permission wrappers for common use cases
export const AdminOnly: React.FC<{ children: ReactNode }> = ({ children }) => (
  <PermissionWrapper
    requiredPermission={["view users", "view roles"]}
    showAccessDenied={true}
  >
    {children}
  </PermissionWrapper>
);

export const ContentManager: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <PermissionWrapper
    requiredPermission={["view-content", "create-content"]}
    showAccessDenied={true}
  >
    {children}
  </PermissionWrapper>
);

export const ReportViewer: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <PermissionWrapper
    requiredPermission={["view-reports"]}
    showAccessDenied={true}
  >
    {children}
  </PermissionWrapper>
);
