import { KeyRound, MailCheck, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EntityCell } from "../../../components/common/EntityCell.jsx";
import { PreviewListPage } from "../../../components/common/PreviewListPage.jsx";
import { ResourceFormModal } from "../../../components/common/ResourceFormModal.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { staffRows } from "../../../data/demoData.js";
import { apiErrorMessage } from "../../../services/apiClient.js";
import { rbacService, roleService, staffService } from "../../../services/resourceServices.js";
import { formatDate } from "../../../utils/formatters.js";
import "../Staff.scss";

const columns = [
  {
    key: "name",
    label: "Staff User",
    render: (value, row) => (
      <EntityCell initials={value.slice(0, 2).toUpperCase()} title={value} subtitle={row.email} />
    ),
  },
  { key: "id", label: "Employee ID" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status", render: (value) => <StatusBadge status={value} /> },
  { key: "lastLogin", label: "Last Login" },
];

const mapStaff = (rows) =>
  rows.map((row) => ({
    ...row,
    name: row.staffProfile?.fullName ?? row.email,
    id: row.staffProfile?.employeeCode ?? `USER-${row.id}`,
    recordId: row.id,
    fullName: row.staffProfile?.fullName ?? "",
    employeeCode: row.staffProfile?.employeeCode ?? "",
    designation: row.staffProfile?.designation ?? "",
    roleId: row.roles?.[0]?.id ?? "",
    role: row.roles?.map((role) => role.name).join(", ") || "No role",
    status: row.mustChangePassword ? "SETUP REQUIRED" : row.status,
    lastLogin: formatDate(row.lastLoginAt, true),
  }));

const mapRoles = (rows) =>
  rows.map((row) => ({
    ...row,
    name: row.name,
    id: row.code,
    recordId: row.id,
    role: `${row.permissions?.length ?? 0} permissions`,
    status: row.isActive ? "ACTIVE" : "INACTIVE",
    lastLogin: row.isSystem ? "System role" : "Custom role",
    permissionIds: row.permissions?.map((permission) => permission.id).join(",") ?? "",
  }));

const roleLabel = (role) => role?.displayName ?? role?.name ?? role?.code ?? "Assigned role";

export function StaffPage({ title = "Staff Users" }) {
  const rolesView = title === "Roles & Permissions";
  const [roles, setRoles] = useState([]);
  const [modal, setModal] = useState({ open: false, type: null, record: null, refresh: null });
  const [notice, setNotice] = useState(null);
  useEffect(() => {
    const loadRoles = rolesView ? roleService.list({ pageSize: 100 }) : rbacService.roles();
    loadRoles
      .then((response) =>
        setRoles((response.data ?? []).filter((role) => role.isActive !== false)),
      )
      .catch(() => setRoles([]));
  }, [rolesView]);

  const accountTypeOptions = useMemo(() => {
    const values = [
      ...new Set(roles.flatMap((role) => role.assignableAccountTypes ?? [])),
    ];
    return values.map((value) => ({ label: value, value }));
  }, [roles]);

  const staffAssignedRole = useMemo(
    () => roles.find((role) => role.assignableAccountTypes?.includes("STAFF")),
    [roles],
  );

  const fields = useMemo(() => {
    if (rolesView) {
      return [
        { name: "code", label: "Role code", required: true },
        { name: "name", label: "Role name", required: true },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          nullable: true,
          fullWidth: true,
        },
        {
          name: "permissionIds",
          label: "Permission IDs (comma separated)",
          nullable: true,
          fullWidth: true,
        },
        { name: "isActive", label: "Active", type: "checkbox", defaultValue: true },
      ];
    }
    return [
      { name: "fullName", label: "Full name", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "mobile", label: "Mobile", nullable: true },
      { name: "designation", label: "Designation", nullable: true },
      { name: "joinedAt", label: "Joining date", type: "date", nullable: true },
      {
        name: "actorType",
        label: "Account type",
        type: "select",
        options: accountTypeOptions,
        defaultValue: accountTypeOptions[0]?.value ?? "STAFF",
        required: true,
      },
      {
        name: "assignedRole",
        label: "Role",
        type: "custom",
        readOnly: true,
        hidden: (values) => values.actorType === "ADMIN",
        render: () => <div className="staff-auto-role">{roleLabel(staffAssignedRole)}</div>,
      },
      {
        name: "roleId",
        label: "Role",
        type: "select",
        hidden: (values) => values.actorType !== "ADMIN",
        options: (values) =>
          roles
            .filter((role) => role.assignableAccountTypes?.includes(values.actorType))
            .map((role) => ({ label: roleLabel(role), value: role.id })),
        required: true,
      },
    ];
  }, [accountTypeOptions, roles, rolesView, staffAssignedRole]);

  const service = rolesView ? roleService : staffService;
  const rowActions = ({ refresh }) => [
    {
      label: "Edit",
      icon: Pencil,
      onClick: (record) => setModal({ open: true, type: "edit", record, refresh }),
    },
    ...(!rolesView
      ? [
          {
            label: "Regenerate credentials & email",
            icon: KeyRound,
            onClick: async (record) => {
              if (
                !window.confirm(
                  `Generate a new temporary password and email it to ${record.email}?`,
                )
              ) {
                return;
              }
              try {
                const result = await staffService.resetPassword(record.recordId, {});
                setNotice(result.data.message);
                refresh();
              } catch (requestError) {
                setNotice(apiErrorMessage(requestError));
              }
            },
          },
        ]
      : []),
    {
      label: rolesView ? "Delete role" : "Deactivate user",
      icon: Trash2,
      danger: true,
      hidden: (record) => rolesView && record.isSystem,
      onClick: async (record) => {
        if (window.confirm(`Confirm ${rolesView ? "delete" : "deactivation"}?`)) {
          await service.remove(record.recordId);
          refresh();
        }
      },
    },
  ];

  return (
    <>
      <div className="page-stack">
        {notice && (
          <div className="staff-notice" role="status">
            <MailCheck size={17} />
            <span>{notice}</span>
          </div>
        )}
        <PreviewListPage
          columns={columns}
          description="Manage internal users, roles, and access permissions."
          eyebrow="Staff & Access"
          mapRows={rolesView ? mapRoles : mapStaff}
          moduleName="Staff and RBAC management"
          primaryAction={rolesView ? "Create Role" : "Add Staff User"}
          rowActions={rowActions}
          rows={staffRows}
          service={service}
          title={title}
          onPrimaryAction={(refresh) =>
            setModal({ open: true, type: "create", record: null, refresh })
          }
        />
      </div>
      <ResourceFormModal
        description={
          rolesView
            ? "Role changes are enforced again by backend RBAC."
            : "Employee code and a temporary password are generated automatically. Login details are emailed after creation."
        }
        fields={fields}
        open={modal.open}
        record={modal.record}
        submitLabel="Save"
        title={`${modal.record ? "Edit" : "Create"} ${rolesView ? "role" : "staff user"}`}
        onClose={() => setModal({ open: false, type: null, record: null, refresh: null })}
        onSubmit={async (payload) => {
          const normalized = rolesView
            ? {
                ...payload,
                permissionIds: String(payload.permissionIds || "")
                  .split(",")
                  .map((value) => Number(value.trim()))
                  .filter(Boolean),
              }
            : {
                ...payload,
                ...(payload.actorType === "STAFF" ? { roleId: undefined } : {}),
              };
          if (modal.record) {
            const result = await service.update(modal.record.recordId, normalized);
            setNotice(result.message || "Staff account updated successfully");
          } else {
            const result = await service.create(normalized);
            setNotice(result.message);
          }
          modal.refresh?.();
        }}
      />
    </>
  );
}
