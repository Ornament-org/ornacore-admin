import { Image as ImageIcon, Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CategoryMultiSelect } from "../../../components/categories/CategoryMultiSelect/CategoryMultiSelect.jsx";
import { ImageUploadField } from "../../../components/forms/ImageUploadField/ImageUploadField.jsx";
import { ProductMultiSelect } from "../../../components/products/ProductMultiSelect/ProductMultiSelect.jsx";
import { PreviewListPage } from "../../../components/common/PreviewListPage.jsx";
import { ResourceFormModal } from "../../../components/common/ResourceFormModal.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { StatusToggle } from "../../../components/common/StatusToggle.jsx";
import { apiErrorMessage } from "../../../services/apiClient.js";
import {
  bannerPlaceholderService,
  bannerService,
  categoryService,
  collectionService,
  metalService,
} from "../../../services/resourceServices.js";
import { CategoryFormModal } from "../components/CategoryFormModal.jsx";
import { CategoryTreeView } from "../components/CategoryTreeView.jsx";
import "../Catalog.scss";

const catalogRows = [];

const toDatetimeLocal = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatScheduleRange = (row) => {
  if (!row.startsAt && !row.endsAt) return "Always live";
  const formatter = (value) =>
    new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(
      new Date(value),
    );
  if (row.startsAt && row.endsAt) return `${formatter(row.startsAt)} → ${formatter(row.endsAt)}`;
  if (row.startsAt) return `From ${formatter(row.startsAt)}`;
  return `Until ${formatter(row.endsAt)}`;
};

const mapCatalogRows = (rows) =>
  rows.map((row) => ({
    ...row,
    parent: row.parent?.name ?? (row.code ? "Metal master" : "Root category"),
    children: row.code ? "—" : (row.childCount ?? 0),
    products: row.productCount ?? row.products?.length ?? 0,
    order: row.sortOrder ?? row.displayOrder,
    status: row.status ?? (row.isActive ? "ACTIVE" : "INACTIVE"),
    ...(row.productLinks
      ? { productIds: row.productLinks.map((link) => link.product).filter(Boolean) }
      : {}),
    ...(row.categoryLinks
      ? { categoryIds: row.categoryLinks.map((link) => link.category).filter(Boolean) }
      : {}),
  }));

const extractRows = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.items)) return response.items;
  return [];
};

function CategoryNameCell({ row, fallbackLabel = "Category" }) {
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
        <small>{row.slug || row.path || fallbackLabel}</small>
      </span>
    </div>
  );
}

export function CatalogPage({ title = "Metals" }) {
  const [modal, setModal] = useState({ open: false, record: null, refresh: null });
  const [categories, setCategories] = useState([]);
  const [metals, setMetals] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [statusError, setStatusError] = useState("");
  const serviceByTitle = {
    Metals: metalService,
    Categories: categoryService,
    Collections: collectionService,
    Banners: bannerService,
    "Banner Placements": bannerPlaceholderService,
  };
  const service = serviceByTitle[title];
  const editable = Boolean(service);
  const isCollections = title === "Collections";
  const isBanners = title === "Banners";
  const isBannerPlaceholders = title === "Banner Placements";

  const loadCategoryOptions = useCallback(() => {
    if (title !== "Categories") return Promise.resolve();
    return categoryService
      .tree()
      .then((response) => setCategories(response.data?.flat ?? []))
      .catch(() => setCategories([]));
  }, [title]);

  const loadMetals = useCallback(() => {
    if (!["Categories", "Collections", "Banners"].includes(title)) return Promise.resolve();
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

  const loadPlacements = useCallback(() => {
    if (title !== "Banners") return Promise.resolve();
    return bannerPlaceholderService
      .list()
      .then((response) => setPlacements(extractRows(response)))
      .catch(() => setPlacements([]));
  }, [title]);

  const columns = useMemo(() => {
    if (isBanners) {
      return [
        {
          key: "title",
          label: "Banner",
          render: (_value, row) => (
            <div className="catalog-name-cell">
              <span className={`catalog-name-cell__image ${row.image?.secureUrl ? "has-image" : ""}`}>
                {row.image?.secureUrl ? <img alt="" src={row.image.secureUrl} /> : <ImageIcon aria-hidden="true" size={18} />}
              </span>
              <span>
                <strong>{row.title}</strong>
                <small>{row.subtitle || row.linkUrl || "No link"}</small>
              </span>
            </div>
          ),
        },
        { key: "placement", label: "Placement", render: (_value, row) => row.placement?.name ?? "—" },
        { key: "metal", label: "Metal", render: (_value, row) => row.metal?.name ?? "All Metals" },
        { key: "schedule", label: "Schedule", render: (_value, row) => formatScheduleRange(row) },
        { key: "sortOrder", label: "Sort Order" },
        {
          key: "status",
          label: "Status",
          render: (value, row, context) => (
            <StatusToggle
              checked={value === "ACTIVE"}
              compact
              onChange={async (active) => {
                setStatusError("");
                await bannerService.update(row.id, { status: active ? "ACTIVE" : "INACTIVE" });
                context?.refresh?.();
              }}
              onError={(requestError) => setStatusError(apiErrorMessage(requestError))}
            />
          ),
        },
      ];
    }
    if (isBannerPlaceholders) {
      return [
        { key: "name", label: "Name" },
        { key: "key", label: "Key", render: (value) => <code>{value}</code> },
        { key: "description", label: "Description", render: (value) => value || "—" },
        { key: "usedInCount", label: "Used By", render: (value) => `${value ?? 0} banner${value === 1 ? "" : "s"}` },
        {
          key: "status",
          label: "Status",
          render: (value, row, context) => (
            <StatusToggle
              checked={value === "ACTIVE"}
              compact
              onChange={async (active) => {
                setStatusError("");
                await bannerPlaceholderService.update(row.id, { status: active ? "ACTIVE" : "INACTIVE" });
                context?.refresh?.();
              }}
              onError={(requestError) => setStatusError(apiErrorMessage(requestError))}
            />
          ),
        },
      ];
    }
    if (isCollections) {
      return [
        {
          key: "name",
          label: "Name",
          render: (_value, row) => <CategoryNameCell row={row} fallbackLabel="Collection" />,
        },
        { key: "metal", label: "Metal", render: (_value, row) => row.metal?.name ?? "All Metals" },
        {
          key: "type",
          label: "Made from",
          render: (value) => (value === "CATEGORY" ? "Categories" : "Products"),
        },
        {
          key: "itemCount",
          label: "Items",
          render: (_value, row) =>
            row.type === "CATEGORY" ? (row.categoryIds?.length ?? 0) : (row.productIds?.length ?? 0),
        },
        { key: "order", label: "Sort Order" },
        {
          key: "status",
          label: "Status",
          render: (value, row, context) => (
            <StatusToggle
              checked={value === "ACTIVE"}
              compact
              onChange={async (active) => {
                setStatusError("");
                await collectionService.update(row.id, {
                  status: active ? "ACTIVE" : "INACTIVE",
                });
                context?.refresh?.();
              }}
              onError={(requestError) => setStatusError(apiErrorMessage(requestError))}
            />
          ),
        },
      ];
    }
    return [
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
    ];
  }, [isBanners, isBannerPlaceholders, isCollections, loadCategoryOptions, title]);

  useEffect(() => {
    loadCategoryOptions();
    loadMetals();
    loadPlacements();
  }, [loadCategoryOptions, loadMetals, loadPlacements]);

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
      return [
        { name: "code", label: "Code", required: true },
        ...common,
        {
          name: "rateUnit",
          label: "Rate unit",
          type: "select",
          required: true,
          defaultValue: "PER_10G",
          options: [
            { value: "PER_10G", label: "Per 10 gm (Gold)" },
            { value: "PER_KG",  label: "Per kg (Silver)" },
            { value: "PER_G",   label: "Per gm (Diamond)" },
          ],
        },
      ];
    }
    if (title === "Banner Placements") {
      return [
        { name: "name", label: "Name", required: true },
        {
          name: "key",
          label: "Key (used by the storefront, cannot change later)",
          required: true,
          readOnly: Boolean(modal.record),
          fullWidth: true,
        },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          nullable: true,
          fullWidth: true,
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          defaultValue: "ACTIVE",
          options: [
            { value: "ACTIVE", label: "Active" },
            { value: "INACTIVE", label: "Inactive" },
          ],
        },
      ];
    }
    if (title === "Banners") {
      return [
        { name: "title", label: "Title", required: true },
        { name: "subtitle", label: "Subtitle", nullable: true },
        {
          name: "placementId",
          label: "Placement",
          type: "select",
          required: true,
          options: placements.map((placement) => ({ value: placement.id, label: placement.name })),
        },
        {
          name: "metalId",
          label: "Metal",
          type: "select",
          nullable: true,
          emptyOptionLabel: "All Metals (eligible on every metal tab)",
          options: metals.map((metal) => ({ value: metal.id, label: metal.name })),
        },
        {
          name: "imageId",
          label: "Banner image (desktop)",
          type: "custom",
          fullWidth: true,
          render: ({ values, setValues }) => (
            <ImageUploadField
              previewUrl={
                values._imagePreviewUrl !== undefined
                  ? values._imagePreviewUrl
                  : (modal.record?.image?.secureUrl ?? null)
              }
              folder="banners"
              onSelect={(asset) =>
                setValues((current) => ({
                  ...current,
                  imageId: asset.id,
                  _imagePreviewUrl: asset.secureUrl,
                }))
              }
            />
          ),
        },
        {
          name: "mobileImageId",
          label: "Banner image (mobile, optional)",
          type: "custom",
          fullWidth: true,
          nullable: true,
          render: ({ values, setValues }) => (
            <ImageUploadField
              previewUrl={
                values._mobileImagePreviewUrl !== undefined
                  ? values._mobileImagePreviewUrl
                  : (modal.record?.mobileImage?.secureUrl ?? null)
              }
              folder="banners"
              onSelect={(asset) =>
                setValues((current) => ({
                  ...current,
                  mobileImageId: asset.id,
                  _mobileImagePreviewUrl: asset.secureUrl,
                }))
              }
              onRemove={() =>
                setValues((current) => ({ ...current, mobileImageId: null, _mobileImagePreviewUrl: null }))
              }
            />
          ),
        },
        { name: "linkUrl", label: "Link URL", nullable: true, fullWidth: true },
        { name: "sortOrder", label: "Sort order", type: "number", min: 0, defaultValue: 0 },
        {
          name: "status",
          label: "Status",
          type: "select",
          defaultValue: "ACTIVE",
          options: [
            { value: "ACTIVE", label: "Active" },
            { value: "INACTIVE", label: "Inactive" },
          ],
        },
        {
          name: "startsAt",
          label: "Starts at (optional)",
          type: "custom",
          nullable: true,
          render: ({ value, setValue }) => (
            <input
              type="datetime-local"
              value={toDatetimeLocal(value)}
              onChange={(event) =>
                setValue(event.target.value ? new Date(event.target.value).toISOString() : null)
              }
            />
          ),
        },
        {
          name: "endsAt",
          label: "Ends at (optional)",
          type: "custom",
          nullable: true,
          render: ({ value, setValue }) => (
            <input
              type="datetime-local"
              value={toDatetimeLocal(value)}
              onChange={(event) =>
                setValue(event.target.value ? new Date(event.target.value).toISOString() : null)
              }
            />
          ),
        },
      ];
    }
    if (title === "Collections") {
      return [
        { name: "name", label: "Name", required: true },
        {
          name: "shortDescription",
          label: "Short description",
          type: "textarea",
          nullable: true,
          fullWidth: true,
        },
        {
          name: "mediaId",
          label: "Collection image",
          type: "custom",
          fullWidth: true,
          render: ({ values, setValues }) => (
            <ImageUploadField
              previewUrl={
                values._mediaPreviewUrl !== undefined
                  ? values._mediaPreviewUrl
                  : (modal.record?.image?.secureUrl ?? null)
              }
              folder="collections"
              onSelect={(asset) =>
                setValues((current) => ({
                  ...current,
                  mediaId: asset.id,
                  _mediaPreviewUrl: asset.secureUrl,
                }))
              }
              onRemove={() =>
                setValues((current) => ({ ...current, mediaId: null, _mediaPreviewUrl: null }))
              }
            />
          ),
        },
        {
          name: "metalId",
          label: "Metal",
          type: "select",
          nullable: true,
          emptyOptionLabel: "All Metals (shown on every metal tab)",
          options: metals.map((metal) => ({ value: metal.id, label: metal.name })),
        },
        {
          name: "type",
          label: "Made from",
          type: "select",
          required: true,
          defaultValue: "PRODUCT",
          options: [
            { value: "PRODUCT", label: "Hand-picked products" },
            { value: "CATEGORY", label: "Hand-picked categories" },
          ],
        },
        {
          name: "productIds",
          label: "Products in this collection",
          type: "custom",
          fullWidth: true,
          defaultValue: [],
          hidden: (values) => values.type === "CATEGORY",
          serialize: (value) => (value ?? []).map((product) => product.id),
          render: ({ value, values, setValue }) => (
            <ProductMultiSelect
              selectedProducts={value ?? []}
              metals={metals}
              metalId={values.metalId || ""}
              onChange={(nextProducts) => setValue(nextProducts)}
            />
          ),
        },
        {
          name: "categoryIds",
          label: "Categories in this collection",
          type: "custom",
          fullWidth: true,
          defaultValue: [],
          hidden: (values) => values.type !== "CATEGORY",
          serialize: (value) => (value ?? []).map((category) => category.id),
          render: ({ value, values, setValue }) => (
            <CategoryMultiSelect
              selectedCategories={value ?? []}
              metals={metals}
              metalId={values.metalId || ""}
              onChange={(nextCategories) => setValue(nextCategories)}
            />
          ),
        },
        { name: "sortOrder", label: "Sort order", type: "number", min: 0, defaultValue: 0 },
        {
          name: "status",
          label: "Status",
          type: "select",
          defaultValue: "ACTIVE",
          options: [
            { value: "ACTIVE", label: "Active" },
            { value: "INACTIVE", label: "Inactive" },
          ],
        },
      ];
    }
    return common;
  }, [title, modal.record, placements, metals]);

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
        if (window.confirm(`Delete ${record.name ?? record.title}?`)) {
          try {
            await service.remove(record.id);
            refresh();
          } catch (requestError) {
            setStatusError(apiErrorMessage(requestError));
          }
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
              <span className="page-header__eyebrow">Products</span>
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
          eyebrow={
            isBanners || isBannerPlaceholders ? "CMS" : title === "Metals" ? "Metals" : "Products"
          }
          title={title}
          description={
            isBanners
              ? "Rotating promotional banners shown on the storefront, grouped by placement and schedule."
              : isBannerPlaceholders
                ? "Named slots (e.g. Home Hero) that banners are assigned to — many banners can rotate in one slot."
                : isCollections
                  ? "Curated groupings shown on the storefront home page — name, image, and visibility."
                  : "Maintain metals and an unlimited parent-child category hierarchy."
          }
          moduleName={
            isBanners || isBannerPlaceholders
              ? "Banner management"
              : title === "Metals"
                ? "Metal management"
                : "Product catalog management"
          }
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
          description={
            isBanners
              ? "Choose a placement, upload/select an image, and optionally schedule when it's live."
              : isBannerPlaceholders
                ? "A named slot banners are assigned to, e.g. Home Hero or Category Top."
                : `Configure this ${title.replace(/s$/, "").toLowerCase()} for the product hierarchy.`
          }
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
