import { Permission, Role, rolePermissions } from "@/config/permissions";
import { useAuth } from "@/context/auth_context";
import { useCallback } from "react";

export function useRbacPermission() {
  const { LoginStatus, user } = useAuth();
  const checkPermission = useCallback(
    (permission: Permission) => {
      if (!LoginStatus) return false;
      const permissions = rolePermissions[user.role as Role];
      return permissions.includes(permission);
    },
    [LoginStatus, user],
  );
  const roleBasedPermissions = useCallback(
    (role: Role | undefined) => {
      if (!LoginStatus) return [];
      return rolePermissions[role as Role];
    },
    [LoginStatus],
  );

  return { checkPermission, roleBasedPermissions };
}
