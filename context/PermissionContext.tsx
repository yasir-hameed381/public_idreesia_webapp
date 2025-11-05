"use client";

import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  UserWithPermissions,
  PermissionName,
  PERMISSIONS,
} from "@/types/permission";

interface PermissionContextType {
  user: UserWithPermissions | null;
  hasPermission: (permission: PermissionName | PermissionName[]) => boolean;
  hasAnyPermission: (permissions: PermissionName[]) => boolean;
  hasAllPermissions: (permissions: PermissionName[]) => boolean;
  isSuperAdmin: boolean;
  isMehfilAdmin: boolean;
  isZoneAdmin: boolean;
  isRegionAdmin: boolean;
  isAdmin: boolean;
  getUserPermissions: () => string[];
}

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined
);

interface PermissionProviderProps {
  children: ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({
  children,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const permissionContextValue = useMemo(() => {
    const userWithPermissions = user as UserWithPermissions | null;

    // Log when permission context is initialized
    if (userWithPermissions) {
      // Combine permissions from all roles if user has multiple roles
      const allPermissions = new Set<string>();
      if (userWithPermissions.roles && userWithPermissions.roles.length > 0) {
        userWithPermissions.roles.forEach((role) => {
          if (role.permissions) {
            role.permissions.forEach((perm) => allPermissions.add(perm.name));
          }
        });
      } else if (userWithPermissions.role?.permissions) {
        userWithPermissions.role.permissions.forEach((perm) =>
          allPermissions.add(perm.name)
        );
      }

      console.log("🔐 PermissionContext initialized for user:", {
        name: userWithPermissions.name,
        email: userWithPermissions.email,
        role: userWithPermissions.role?.name || "No role",
        roles:
          userWithPermissions.roles?.map((r) => r.name) || [
            userWithPermissions.role?.name || "No role",
          ],
        permissions: Array.from(allPermissions),
        totalRoles: userWithPermissions.roles?.length || (userWithPermissions.role ? 1 : 0),
        is_super_admin: userWithPermissions.is_super_admin,
        is_mehfil_admin: userWithPermissions.is_mehfil_admin,
        is_zone_admin: userWithPermissions.is_zone_admin,
        is_region_admin: userWithPermissions.is_region_admin,
      });
    } else {
      console.log("🔐 PermissionContext initialized - No user logged in");
    }

    const getUserPermissions = (): string[] => {
      if (!userWithPermissions) {
        return [];
      }

      // Combine permissions from all roles (like Laravel)
      const allPermissions = new Set<string>();

      // Check if user has multiple roles
      if (userWithPermissions.roles && userWithPermissions.roles.length > 0) {
        // User has multiple roles - combine permissions from all
        userWithPermissions.roles.forEach((role) => {
          if (role.permissions && Array.isArray(role.permissions)) {
            role.permissions.forEach((perm) => {
              allPermissions.add(perm.name);
            });
          }
        });
      } else if (userWithPermissions.role?.permissions) {
        // Single role - use its permissions
        userWithPermissions.role.permissions.forEach((perm) => {
          allPermissions.add(perm.name);
        });
      }

      return Array.from(allPermissions);
    };

    const hasPermission = (
      permission: PermissionName | PermissionName[]
    ): boolean => {
      if (!userWithPermissions) {
        console.log("❌ No user logged in");
        return false;
      }

      // Super admin has all permissions
      if (userWithPermissions.is_super_admin) {
        console.log(
          `🔑 Super admin access granted for permission: ${
            Array.isArray(permission) ? permission.join(", ") : permission
          }`
        );
        return true;
      }

      const userPermissions = getUserPermissions();

      // Debug logging
      console.log(
        `🔍 Checking permission: ${
          Array.isArray(permission) ? permission.join(", ") : permission
        }`
      );
      console.log(
        `👤 User permissions (${userPermissions.length} total from ${userWithPermissions.roles?.length || (userWithPermissions.role ? 1 : 0)} role(s)):`,
        userPermissions
      );
      console.log(`👤 User role(s):`, 
        userWithPermissions.roles?.map(r => r.name).join(', ') || userWithPermissions.role?.name || 'No role'
      );
      console.log(`👤 Is super admin:`, userWithPermissions.is_super_admin);

      if (Array.isArray(permission)) {
        const hasAny = permission.some((p) => userPermissions.includes(p));
        console.log(
          `🔑 Checking multiple permissions: ${permission.join(
            ", "
          )} - Result: ${hasAny ? "GRANTED" : "DENIED"}`
        );
        return hasAny;
      }

      const hasPermissionResult = userPermissions.includes(permission);
      console.log(
        `🔑 Checking permission: "${permission}" - Result: ${
          hasPermissionResult ? "GRANTED" : "DENIED"
        }`
      );

      // Additional debug for specific permission
      if (!hasPermissionResult) {
        console.log(
          `❌ Permission "${permission}" not found in user permissions`
        );
        console.log(`🔍 Looking for exact match in:`, userPermissions);
        const similarPermissions = userPermissions.filter((p) =>
          p.toLowerCase().includes(permission.toLowerCase().split(" ")[0])
        );
        if (similarPermissions.length > 0) {
          console.log(`🔍 Similar permissions found:`, similarPermissions);
        }
      }

      return hasPermissionResult;
    };

    const hasAnyPermission = (permissions: PermissionName[]): boolean => {
      return hasPermission(permissions);
    };

    const hasAllPermissions = (permissions: PermissionName[]): boolean => {
      if (!userWithPermissions) return false;

      // Super admin has all permissions
      if (userWithPermissions.is_super_admin) {
        console.log(
          `🔑 Super admin access granted for all permissions: ${permissions.join(
            ", "
          )}`
        );
        return true;
      }

      const userPermissions = getUserPermissions();
      const hasAll = permissions.every((p) => userPermissions.includes(p));
      console.log(
        `🔑 Checking all permissions: ${permissions.join(", ")} - Result: ${
          hasAll ? "GRANTED" : "DENIED"
        }`
      );
      return hasAll;
    };

    return {
      user: userWithPermissions,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      isSuperAdmin: userWithPermissions?.is_super_admin || false,
      isMehfilAdmin: userWithPermissions?.is_mehfil_admin || false,
      isZoneAdmin: userWithPermissions?.is_zone_admin || false,
      isRegionAdmin: userWithPermissions?.is_region_admin || false,
      isAdmin: !!(
        userWithPermissions?.is_super_admin ||
        userWithPermissions?.is_mehfil_admin ||
        userWithPermissions?.is_zone_admin ||
        userWithPermissions?.is_region_admin
      ),
      getUserPermissions,
    };
  }, [user]);

  return (
    <PermissionContext.Provider value={permissionContextValue}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
};

// Higher-order component for permission-based rendering
export const withPermission = (
  WrappedComponent: React.ComponentType<any>,
  requiredPermission: PermissionName | PermissionName[]
) => {
  return (props: any) => {
    const { hasPermission } = usePermissions();

    if (!hasPermission(requiredPermission)) {
      return null; // Or return a fallback component
    }

    return <WrappedComponent {...props} />;
  };
};

// Permission guard component
interface PermissionGuardProps {
  permission: PermissionName | PermissionName[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback = null,
}) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Admin guard component
interface AdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({
  children,
  fallback = null,
}) => {
  const { isAdmin } = usePermissions();

  if (!isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
