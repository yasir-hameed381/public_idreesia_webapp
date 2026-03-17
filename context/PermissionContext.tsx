"use client";

import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { useSelector } from "react-redux";
import { selectAuthUser } from "@/store/selectors";
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
  isAllRegionAdmin: boolean;
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
  const user = useSelector(selectAuthUser);

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
        return false;
      }

      // In Laravel, super_admin users still need roles with permissions
      // They don't automatically get all permissions
      const userPermissions = getUserPermissions();

      if (Array.isArray(permission)) {
        return permission.some((p) => userPermissions.includes(p));
      }

      return userPermissions.includes(permission);
    };

    const hasAnyPermission = (permissions: PermissionName[]): boolean => {
      return hasPermission(permissions);
    };

    const hasAllPermissions = (permissions: PermissionName[]): boolean => {
      if (!userWithPermissions) return false;

      // In Laravel, super_admin users still need roles with permissions
      // They don't automatically get all permissions
      const userPermissions = getUserPermissions();
      return permissions.every((p) => userPermissions.includes(p));
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
      isAllRegionAdmin: userWithPermissions?.is_all_region_admin || false,
      isAdmin: !!(
        userWithPermissions?.is_super_admin ||
        userWithPermissions?.is_mehfil_admin ||
        userWithPermissions?.is_zone_admin ||
        userWithPermissions?.is_region_admin ||
        userWithPermissions?.is_all_region_admin
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
