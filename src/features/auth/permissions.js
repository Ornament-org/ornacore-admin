import { useMemo } from "react";
import { useSelector } from "react-redux";

export const hasPermission = (user, permissionKey) =>
  Boolean(user?.roles?.includes("SUPER_ADMIN") || user?.permissions?.includes(permissionKey));

export const canView = hasPermission;
export const canCreate = hasPermission;
export const canUpdate = hasPermission;
export const canDelete = hasPermission;

export function usePermissions() {
  const user = useSelector((state) => state.auth.user);

  return useMemo(
    () => ({
      user,
      roles: user?.roles ?? [],
      permissions: user?.permissions ?? [],
      isSuperAdmin: Boolean(user?.roles?.includes("SUPER_ADMIN")),
      hasPermission: (permissionKey) => hasPermission(user, permissionKey),
      canView: (permissionKey) => hasPermission(user, permissionKey),
      canCreate: (permissionKey) => hasPermission(user, permissionKey),
      canUpdate: (permissionKey) => hasPermission(user, permissionKey),
      canDelete: (permissionKey) => hasPermission(user, permissionKey),
    }),
    [user],
  );
}
