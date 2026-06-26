import clsx from "clsx";
import { RefreshCw, Search, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../../../components/common/Button.jsx";
import { SkeletonTable } from "../../../components/skeleton/SkeletonTable.jsx";
import { rbacService } from "../../../services/resourceServices.js";
import { apiErrorMessage } from "../../../services/apiClient.js";
import { usePermissions } from "../../auth/permissions.js";
import "./RolesPermissions.scss";

const roleColorClasses = ["green", "blue", "orange", "violet", "slate"];

const humanize = (value) =>
  String(value)
    .replaceAll("_", " ")
    .replaceAll(".", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const groupPermissions = (permissions) =>
  permissions.reduce((groups, permission) => {
    const moduleName = permission.module || "general";
    if (!groups[moduleName]) groups[moduleName] = [];
    groups[moduleName].push(permission);
    return groups;
  }, {});

export function RolesPermissionsPage() {
  const { isSuperAdmin } = usePermissions();
  const [matrixData, setMatrixData] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [error, setError] = useState(null);

  const loadMatrix = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await rbacService.permissionsMatrix();
      setMatrixData(response.data);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatrix();
  }, [loadMatrix]);

  const roles = matrixData?.roles ?? [];
  const allPermissions = matrixData?.permissions ?? [];

  const allowedLookup = useMemo(() => {
    const lookup = new Map();
    for (const entry of matrixData?.matrix ?? []) {
      lookup.set(`${entry.roleId}:${entry.permissionId}`, Boolean(entry.allowed));
    }
    return lookup;
  }, [matrixData]);

  const filteredPermissions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return allPermissions;

    return allPermissions.filter((permission) =>
      [permission.permissionName, permission.permissionKey, permission.module]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
    );
  }, [allPermissions, query]);

  const groupedPermissions = useMemo(
    () => groupPermissions(filteredPermissions),
    [filteredPermissions],
  );

  const moduleCount = Object.keys(groupedPermissions).length;
  const assignedCount = allPermissions.reduce((count, permission) => {
    return (
      count +
      roles.reduce((roleCount, role) => {
        const isSuperAdminRole = role.name === "SUPER_ADMIN";
        const key = `${role.id}:${permission.id}`;
        const checked = isSuperAdminRole || allowedLookup.get(key);
        return roleCount + (checked ? 1 : 0);
      }, 0)
    );
  }, 0);

  const totalCells = Math.max(roles.length * allPermissions.length, 1);
  const assignedPercent = Math.round((assignedCount / totalCells) * 100);

  const updatePermission = async ({ role, permission, allowed }) => {
    const key = `${role.id}:${permission.id}`;
    setSavingKey(key);
    setMatrixData((current) => ({
      ...current,
      matrix: current.matrix.map((entry) =>
        entry.roleId === role.id && entry.permissionId === permission.id
          ? { ...entry, allowed }
          : entry,
      ),
    }));

    try {
      await rbacService.updateRolePermission({
        roleId: role.id,
        permissionId: permission.id,
        allowed,
      });
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
      await loadMatrix();
    } finally {
      setSavingKey(null);
    }
  };

  if (loading && !matrixData) return <SkeletonTable rows={10} cols={6} />;

  return (
    <div className="rbac-page">
      <header className="rbac-header">
        <div className="rbac-header__content">
          <div className="rbac-header__icon">
            <ShieldCheck size={24} />
          </div>

          <div>
            <p className="eyebrow">Access Control</p>
            <h1>Roles & Permissions</h1>
            <p>
              Manage role based access permissions for every application feature.
            </p>
          </div>
        </div>

        <Button icon={RefreshCw} variant="secondary" onClick={loadMatrix}>
          Refresh
        </Button>
      </header>

      <section className="rbac-stats">
        <div className="rbac-stat-card">
          <span>Roles</span>
          <strong>{roles.length}</strong>
        </div>
        <div className="rbac-stat-card">
          <span>Permissions</span>
          <strong>{allPermissions.length}</strong>
        </div>
        <div className="rbac-stat-card">
          <span>Modules</span>
          <strong>{moduleCount}</strong>
        </div>
        <div className="rbac-stat-card success">
          <span>Access</span>
          <strong>{isSuperAdmin ? "Editable" : "Read Only"}</strong>
        </div>
      </section>

      <section className="rbac-toolbar">
        <div className="rbac-search">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search permissions..."
          />
        </div>

        <div className="rbac-status">
          <ShieldCheck size={16} />
          <span>
            {isSuperAdmin ? "Editable as Super Admin" : "Read-only access"}
          </span>
        </div>
      </section>

      {error && <div className="rbac-alert">{error}</div>}

      <div
        className="rbac-table"
        style={{ "--role-count": Math.max(roles.length, 1) }}
      >
        <div className="rbac-table__head">
          <div className="rbac-table__permission-cell">Permission</div>

          {roles.map((role, index) => (
            <div
              className={clsx(
                "rbac-table__role-cell",
                `rbac-table__role-cell--${
                  roleColorClasses[index % roleColorClasses.length]
                }`,
              )}
              key={role.id}
            >
              {role.name}
            </div>
          ))}
        </div>

        {Object.entries(groupedPermissions).map(([moduleName, permissions]) => (
          <div className="rbac-module" key={moduleName}>
            <div className="rbac-module__title">{humanize(moduleName)}</div>

            {permissions.map((permission) => (
              <div className="rbac-table__row" key={permission.id}>
                <div className="rbac-table__permission-cell">
                  <strong>{permission.permissionName}</strong>
                  <span>{permission.permissionKey}</span>
                </div>

                {roles.map((role) => {
                  const isSuperAdminRole = role.name === "SUPER_ADMIN";
                  const key = `${role.id}:${permission.id}`;
                  const checked = isSuperAdminRole || allowedLookup.get(key);

                  return (
                    <label className="rbac-check" key={role.id}>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={
                          !isSuperAdmin ||
                          isSuperAdminRole ||
                          savingKey === key
                        }
                        onChange={(event) =>
                          updatePermission({
                            role,
                            permission,
                            allowed: event.target.checked,
                          })
                        }
                      />
                      <span />
                    </label>
                  );
                })}
              </div>
            ))}
          </div>
        ))}

        {!filteredPermissions.length && (
          <div className="rbac-empty">No permissions match your search.</div>
        )}
      </div>
    </div>
  );
}