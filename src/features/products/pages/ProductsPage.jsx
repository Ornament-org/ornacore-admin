import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EntityCell } from "../../../components/common/EntityCell.jsx";
import { PreviewListPage } from "../../../components/common/PreviewListPage.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { StatusToggle } from "../../../components/common/StatusToggle.jsx";
import { productRows } from "../../../data/demoData.js";
import { apiErrorMessage } from "../../../services/apiClient.js";
import { metalService, productService } from "../../../services/resourceServices.js";
import { formatCurrency } from "../../../utils/formatters.js";

const statusByTitle = {
  "Draft Products": "DRAFT",
  "Out of Stock Products": "OUT_OF_STOCK",
};

const mapProducts = (rows) =>
  rows.map((row) => {
    const firstVariant = row.variants?.[0];
    const categoryMappings = row.categoryMappings ?? [];
    const primaryCategory =
      categoryMappings.find((mapping) => mapping.isPrimary)?.category ??
      categoryMappings[0]?.category ??
      row.category;
    const stock = row.variants?.reduce(
      (total, variant) => total + Number(variant.inventory?.onHandQuantity ?? 0),
      0,
    );
    return {
      ...row,
      metal: row.metal?.name ?? "—",
      category: primaryCategory
        ? `${primaryCategory.name}${
            categoryMappings.length > 1 ? ` +${categoryMappings.length - 1}` : ""
          }`
        : "—",
      primaryImage:
        row.images?.find((image) => image.isPrimary)?.media?.secureUrl ??
        row.images?.[0]?.media?.secureUrl ??
        null,
      variant: row.variants?.length
        ? `${row.variants.length} variant${row.variants.length > 1 ? "s" : ""}`
        : "No variants",
      price: firstVariant?.basePrice ? formatCurrency(firstVariant.basePrice) : "Pricing rules",
      stock: stock ?? 0,
    };
  });

export function ProductsPage({ title = "All Products" }) {
  const navigate = useNavigate();
  const [statusError, setStatusError] = useState("");
  const [metals, setMetals] = useState([]);
  const query = useMemo(
    () => (statusByTitle[title] ? { status: statusByTitle[title] } : {}),
    [title],
  );
  const metalFilterTabs = useMemo(
    () => ({
      label: "Filter products by metal",
      paramKey: "metalId",
      allLabel: "All",
      options: metals.map((metal) => ({
        label: metal.name,
        value: metal.id,
      })),
    }),
    [metals],
  );

  useEffect(() => {
    metalService
      .list({ isActive: true, pageSize: 100, sortBy: "displayOrder", sortDirection: "ASC" })
      .then((response) => setMetals(response.data ?? []))
      .catch((requestError) => setStatusError(apiErrorMessage(requestError)));
  }, []);

  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Product",
        render: (value, row) => (
          <EntityCell
            imageAlt=""
            imageUrl={row.primaryImage}
            initials={row.metal.slice(0, 1)}
            title={value}
            subtitle={row.designCode}
          />
        ),
      },
      { key: "category", label: "Category" },
      { key: "variant", label: "Variant" },
      { key: "price", label: "Price" },
      { key: "stock", label: "Stock" },
      {
        key: "status",
        label: "Status",
        render: (value, row, context) =>
          ["ACTIVE", "INACTIVE"].includes(value) ? (
            <StatusToggle
              checked={value === "ACTIVE"}
              compact
              onChange={async (active) => {
                setStatusError("");
                await productService.update(row.id, {
                  status: active ? "ACTIVE" : "INACTIVE",
                });
                context?.refresh?.();
              }}
              onError={(requestError) => setStatusError(apiErrorMessage(requestError))}
            />
          ) : (
            <StatusBadge status={value} />
          ),
      },
    ],
    [],
  );
  const rowActions = ({ refresh }) => [
    {
      label: "Edit product",
      icon: Pencil,
      onClick: (record) => navigate(`/products/${record.id}/edit`),
    },
    {
      label: "Delete",
      icon: Trash2,
      danger: true,
      onClick: async (record) => {
        if (window.confirm(`Delete ${record.name}? This action cannot be undone.`)) {
          await productService.remove(record.id);
          refresh();
        }
      },
    },
  ];

  return (
    <PreviewListPage
      eyebrow="Products"
      title={title}
      description="Control product identity, variants, pricing, images, and publishing state."
      moduleName="Product management"
      columns={columns}
      rows={productRows}
      service={productService}
      mapRows={mapProducts}
      query={query}
      rowActions={rowActions}
      externalError={statusError}
      filterTabs={metalFilterTabs}
      statusOptions={["DRAFT", "ACTIVE", "INACTIVE", "OUT_OF_STOCK"]}
      primaryAction="Create Product"
      onPrimaryAction={() => navigate("/products/create")}
    />
  );
}
