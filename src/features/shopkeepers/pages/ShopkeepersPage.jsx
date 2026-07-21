import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Plus,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/common/Button.jsx";
import { PageHeader } from "../../../components/layout/PageHeader.jsx";
import { ResourceFormModal } from "../../../components/common/ResourceFormModal.jsx";
import { useResourceData } from "../../../hooks/useResourceData.js";
import { metalService, shopkeeperService } from "../../../services/resourceServices.js";
import { MetalCreditLimitEditor } from "../components/MetalCreditLimitEditor.jsx";
import { ShopkeeperTable } from "../components/ShopkeeperTable.jsx";
import { ShopkeeperToolbar } from "../components/ShopkeeperToolbar.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { useShopkeeperStats } from "../hooks/useShopkeeperData.js";
import { invalidateAll } from "../store/shopkeeperSlice.js";
import { useDispatch } from "react-redux";
import "./ShopkeepersPage.scss";

const PAGE_SIZE = 20;

const STATUS_BY_TITLE = {
  "Pending Approval": "PENDING_REVIEW",
  "Approved Shopkeepers": "APPROVED",
  "Rejected Shopkeepers": "REJECTED",
  "Suspended Shopkeepers": "SUSPENDED",
};

const SORT_PARAM = {
  recent: "-createdAt",
  oldest: "createdAt",
  due_desc: "-cashDue",
  due_asc: "cashDue",
};

const mapShopkeepers = (rows) =>
  rows.map((row) => {
    const creditLimits = row.metalCreditLimits ?? row.creditLimits ?? [];
    const metalDues =
      Array.isArray(row.metalDues) && row.metalDues.length > 0
        ? row.metalDues
        : creditLimits.map((cl) => ({
            metalId: String(cl.metalId ?? cl.metal?.id ?? ""),
            name: cl.metal?.name ?? "Metal",
            code: cl.metal?.code ?? "",
            dueGrams: "0.000",
          }));
    return {
      ...row,
      shopId: row.shopId ?? row.id,
      creditLimits,
      metalDues,
      cashDue: row.cashDue ?? row.dueAmount ?? 0,
    };
  });

export function ShopkeepersPage({ title = "All Shopkeepers" }) {
  const navigate = useNavigate();
  const titleStatus = STATUS_BY_TITLE[title];

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [metals, setMetals] = useState([]);
  const [modal, setModal] = useState({ open: false, type: null, record: null });
  const dispatch = useDispatch();

  // Stats from Redux — fetched once, shared across all components
  const { stats } = useShopkeeperStats();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    metalService
      .list({ isActive: true, pageSize: 100 })
      .then((r) => setMetals(Array.isArray(r) ? r : (r?.data ?? [])))
      .catch(() => setMetals([]));
  }, []);

  const params = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      sort: SORT_PARAM[sort],
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(titleStatus
        ? { status: titleStatus }
        : statusFilter
          ? { status: statusFilter }
          : {}),
    }),
    [page, debouncedSearch, sort, titleStatus, statusFilter],
  );

  const { rows, loading, meta } = useResourceData({
    service: shopkeeperService,
    params,
    mapRows: mapShopkeepers,
    refreshKey,
  });

  const total = meta?.totalItems ?? meta?.total ?? 0;
  const refresh = () => {
    dispatch(invalidateAll());
    setRefreshKey((k) => k + 1);
  };

  const statCards = [
    {
      title: "Total Shopkeepers",
      value: stats.total,
      subtitle: "Active relationships",
      icon: Users,
      type: "total",
    },
    {
      title: "Approved",
      value: stats.approved,
      subtitle: stats.approvedPercent ? `${stats.approvedPercent}% of total` : "of total",
      icon: CheckCircle2,
      type: "approved",
    },
    {
      title: "Pending Approval",
      value: stats.pendingApproval,
      subtitle: "Awaiting review",
      icon: Clock,
      type: "pending",
    },
    {
      title: "Overdue Accounts",
      value: stats?.overdue ?? null,
      subtitle: "Require attention",
      icon: AlertCircle,
      type: "overdue",
    },
  ];

  const creditLimitField = useMemo(
    () => ({
      name: "creditLimits",
      label: "Credit limits in gm",
      type: "custom",
      fullWidth: true,
      defaultValue: [],
      render: ({ value, setValue }) => (
        <MetalCreditLimitEditor metals={metals} value={value} onChange={setValue} />
      ),
      serialize: (value = []) =>
        value
          .filter((r) => r.metalId && r.creditLimitGrams !== "")
          .map((r) => ({
            metalId: Number(r.metalId),
            creditLimitGrams: Number(r.creditLimitGrams),
          })),
    }),
    [metals],
  );

  const modalFields = useMemo(() => {
    if (modal.type === "approve") {
      return [
        creditLimitField,
        { name: "internalNote", label: "Internal note", type: "textarea", nullable: true },
      ];
    }
    if (modal.type === "edit") {
      return [
        { name: "ownerName", label: "Owner name", required: true },
        { name: "shopName", label: "Shop name", required: true },
        { name: "city", label: "City", nullable: true },
        { name: "state", label: "State", nullable: true },
        { name: "pincode", label: "Pincode", nullable: true },
        { name: "gstNumber", label: "GST number", nullable: true },
        {
          name: "addressLine1",
          label: "Address",
          type: "textarea",
          nullable: true,
          fullWidth: true,
        },
        creditLimitField,
      ];
    }
    return [
      { name: "reason", label: "Reason", type: "textarea", required: true, fullWidth: true },
    ];
  }, [creditLimitField, modal.type]);

  const openModal = (type, record) => setModal({ open: true, type, record });
  const closeModal = () => setModal({ open: false, type: null, record: null });

  const handleAction = (action, record) => {
    if (action === "delete") {
      if (window.confirm(`Delete ${record.shopName}? This cannot be undone.`)) {
        shopkeeperService.remove(record.id).then(refresh);
      }
      return;
    }
    openModal(action, record);
  };

  const handleModalSubmit = async (payload) => {
    if (modal.type === "edit") {
      await shopkeeperService.update(modal.record.id, payload);
    } else if (modal.type === "approve") {
      await shopkeeperService.approve(modal.record.id, payload);
    } else if (modal.type === "suspend") {
      await shopkeeperService.suspend(modal.record.id, payload);
    } else if (modal.type === "reject") {
      await shopkeeperService.reject(modal.record.id, payload);
    } else if (modal.type === "block") {
      await shopkeeperService.block(modal.record.id, payload);
    }
    refresh();
  };

  const modalTitle = {
    edit: "Edit shopkeeper",
    approve: "Approve shopkeeper",
    suspend: "Suspend shopkeeper",
    reject: "Reject shopkeeper",
    block: "Block shopkeeper",
  }[modal.type] ?? "Shopkeeper action";

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Shopkeepers"
        title={title}
        description="Manage and monitor your B2B shopkeeper relationships."
        actions={
          <>
            <Button variant="secondary" size="sm" icon={Download}>
              Export
            </Button>
            <Button size="sm" icon={Plus} onClick={() => navigate("/shopkeepers/new")}>
              Add Shopkeeper
            </Button>
          </>
        }
      />

      <div className="sk-stats-grid">
        {statCards.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      <div className="sk-list-card">
        <div className="sk-list-card__toolbar">
          <ShopkeeperToolbar
            search={search}
            status={statusFilter}
            sort={sort}
            onSearch={setSearch}
            onStatus={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
            onSort={setSort}
            onRefresh={refresh}
            hideStatusFilter={!!titleStatus}
          />
        </div>
        <ShopkeeperTable
          rows={rows}
          loading={loading}
          page={page}
          total={total}
          pageSize={PAGE_SIZE}
          onPage={setPage}
          onAction={handleAction}
        />
      </div>

      <ResourceFormModal
        open={modal.open}
        title={modalTitle}
        description={`Update ${modal.record?.shopName ?? "shopkeeper"} safely with an audited action.`}
        fields={modalFields}
        record={modal.type === "edit" ? modal.record : null}
        submitLabel={modal.type === "approve" ? "Approve account" : "Confirm action"}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
