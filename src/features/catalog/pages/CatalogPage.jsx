import { Image as ImageIcon, Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PreviewListPage } from "../../../components/common/PreviewListPage.jsx";
import { ResourceFormModal } from "../../../components/common/ResourceFormModal.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { StatusToggle } from "../../../components/common/StatusToggle.jsx";
import { apiErrorMessage } from "../../../services/apiClient.js";
import { categoryService, metalService } from "../../../services/resourceServices.js";
import { CategoryFormModal } from "../components/CategoryFormModal.jsx";
import { CategoryTreeView } from "../components/CategoryTreeView.jsx";
import "../Catalog.scss";

const catalogRows = [
  { id: "CAT-01", name: "Gold", parent: "Metal", products: 842, order: 1, status: "ACTIVE" },
  { id: "CAT-02", name: "Silver", parent: "Metal", products: 265, order: 2, status: "ACTIVE" },
  { id: "CAT-03", name: "Diamond", parent: "Metal", products: 124, order: 3, status: "ACTIVE" },
  { id: "CAT-04", name: "Platinum", parent: "Metal", products: 17, order: 4, status: "ACTIVE" },
];

const mapCatalogRows = (rows) =>
  rows.map((row) => ({
    ...row,
    parent: row.parent?.name ?? (row.code ? "Metal master" : "Root category"),
    children: row.code ? "—" : (row.childCount ?? 0),
    products: row.productCount ?? row.products?.length ?? 0,
    order: row.sortOrder ?? row.displayOrder,
    status: row.status ?? (row.isActive ? "ACTIVE" : "INACTIVE"),
  }));

const extractRows = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.items)) return response.items;
  return [];
};

function CategoryNameCell({ row }) {
  return (
    <div className="catalog-name-cell">
      <span className={`catalog-name-cell__image ${row.image?.secureUrl ? "has-image" : ""}`}>
        {row.image?.secureUrl ? (
          <img alt="" src={row.image.secureUrl} />
        ) : (
          <ImageIcon aria-hidden="true" size={18} />
        )}
      </span>
      <span>
        <strong>{row.name}</strong>
        <small>{row.slug || row.path || "Category"}</small>
      </span>
    </div>
  );
}

export function CatalogPage({ title = "Metals" }) {
  const [modal, setModal] = useState({ open: false, record: null, refresh: null });
  const [categories, setCategories] = useState([]);
  const [metals, setMetals] = useState([]);
  const [statusError, setStatusError] = useState("");
  const serviceByTitle = {
    Metals: metalService,
    Categories: categoryService,
  };
  const service = serviceByTitle[title];
  const editable = Boolean(service);

  const loadCategoryOptions = useCallback(() => {
    if (title !== "Categories") return Promise.resolve();
    return categoryService
      .tree()
      .then((response) => setCategories(response.data?.flat ?? []))
      .catch(() => setCategories([]));
  }, [title]);

  const loadMetals = useCallback(() => {
    if (title !== "Categories") return Promise.resolve();
    return metalService
      .list({ isActive: true, pageSize: 100, sortBy: "displayOrder", sortDirection: "ASC" })
      .then((response) => setMetals(extractRows(response)))
      .catch(() => {
        setMetals([]);
      });
  }, [title]);

  const handleCategoryRefresh = useCallback(async () => {
    await Promise.all([loadCategoryOptions(), loadMetals()]);
  }, [loadCategoryOptions, loadMetals]);

  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Name",
        render:
          title === "Categories"
            ? (_value, row) => <CategoryNameCell row={row} />
            : (value) => value,
      },
      { key: "id", label: "Code / ID" },
      { key: "parent", label: "Parent" },
      { key: "children", label: "Children" },
      { key: "products", label: "Mapped Products" },
      { key: "order", label: "Sort Order" },
      {
        key: "status",
        label: "Status",
        render: (value, row, context) =>
          title === "Categories" ? (
            <StatusToggle
              checked={value === "ACTIVE"}
              compact
              onChange={async (active) => {
                setStatusError("");
                await categoryService.update(row.id, {
                  status: active ? "ACTIVE" : "INACTIVE",
                });
                context?.refresh?.();
                await loadCategoryOptions();
              }}
              onError={(requestError) => setStatusError(apiErrorMessage(requestError))}
            />
          ) : (
            <StatusBadge status={value} />
          ),
      },
    ],
    [loadCategoryOptions, title],
  );

  useEffect(() => {
    loadCategoryOptions();
    loadMetals();
  }, [loadCategoryOptions, loadMetals]);

  const fields = useMemo(() => {
    const common = [
      { name: "name", label: "Name", required: true },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        nullable: true,
        fullWidth: true,
      },
      { name: "displayOrder", label: "Display order", type: "number", min: 0, defaultValue: 0 },
      { name: "isActive", label: "Active", type: "checkbox", defaultValue: true },
    ];
    if (title === "Metals") {
      return [{ name: "code", label: "Code", required: true }, ...common];
    }
    return common;
  }, [title]);

  const parentCategoryOptions = useMemo(() => {
    const recordId = modal.record?.id ? String(modal.record.id) : null;
    return categories.filter(
      (category) =>
        String(category.id) !== recordId && !category.ancestorIds?.map(String).includes(recordId),
    );
  }, [categories, modal.record]);

  const rowActions = ({ refresh }) => [
    {
      label: "Edit",
      icon: Pencil,
      onClick: (record) => setModal({ open: true, record: { ...record }, refresh }),
    },
    {
      label: "Delete",
      icon: Trash2,
      danger: true,
      onClick: async (record) => {
        if (window.confirm(`Delete ${record.name}?`)) {
          await service.remove(record.id);
          refresh();
        }
      },
    },
  ];

  return (
    <>
      {title === "Categories" ? (
        <div className="page-stack">
          <div className="page-header">
            <div className="page-header__content">
              <span className="page-header__eyebrow">Catalog</span>
              <h1 className="page-header__title">Categories</h1>
              <p className="page-header__description">
                Maintain metals and an unlimited parent-child category hierarchy.
              </p>
            </div>
            <button
              className="button button--primary"
              onClick={() => setModal({ open: true, record: null, refresh: null })}
            >
              Add Category
            </button>
          </div>
          {statusError && <div className="form-alert">{statusError}</div>}
          <CategoryTreeView
            categories={categories}
            metals={metals}
            onEdit={(record) => setModal({ open: true, record: { ...record }, refresh: null })}
            onDelete={async (record) => {
              if (window.confirm(`Delete ${record.name}?`)) {
                await service.remove(record.id);
                handleCategoryRefresh();
              }
            }}
            onRefresh={handleCategoryRefresh}
            statusError={statusError}
            setStatusError={setStatusError}
          />
        </div>
      ) : (
        <PreviewListPage
          eyebrow="Catalog"
          title={title}
          description="Maintain metals and an unlimited parent-child category hierarchy."
          moduleName="Catalog management"
          columns={columns}
          rows={catalogRows}
          service={service}
          mapRows={mapCatalogRows}
          rowActions={editable ? rowActions : []}
          externalError={statusError}
          hidePrimaryAction={!editable}
          primaryAction={`Add ${title.replace(/s$/, "")}`}
          onPrimaryAction={(refresh) => setModal({ open: true, record: null, refresh })}
        />
      )}
      {title === "Categories" ? (
        <CategoryFormModal
          categories={parentCategoryOptions}
          metals={metals}
          open={modal.open}
          record={modal.record}
          onClose={() => setModal({ open: false, record: null, refresh: null })}
          onSubmit={async (payload) => {
            if (modal.record) await service.update(modal.record.id, payload);
            else await service.create(payload);
            await handleCategoryRefresh();
          }}
        />
      ) : (
        <ResourceFormModal
          description={`Configure this ${title.replace(/s$/, "").toLowerCase()} for the product hierarchy.`}
          fields={fields}
          open={modal.open}
          record={modal.record}
          title={`${modal.record ? "Edit" : "Add"} ${title.replace(/s$/, "")}`}
          onClose={() => setModal({ open: false, record: null, refresh: null })}
          onSubmit={async (payload) => {
            if (modal.record) await service.update(modal.record.id, payload);
            else await service.create(payload);
            modal.refresh?.();
          }}
        />
      )}
    </>
  );
}
