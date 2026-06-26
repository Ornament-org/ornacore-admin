import { LockKeyhole } from "lucide-react";
import { usePermissions } from "../features/auth/permissions.js";
import "../components/common/SectionState.scss";

export function PermissionRoute({ permission, children }) {
  const { hasPermission } = usePermissions();
  const isAllowed = hasPermission(permission);

  if (isAllowed) return children;

  return (
    <div className="permission-denied">
      <span>
        <LockKeyhole size={25} />
      </span>
      <h1>Permission required</h1>
      <p>Your account does not have the `{permission}` permission.</p>
    </div>
  );
}
