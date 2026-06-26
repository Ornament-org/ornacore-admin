import {
  Boxes,
  CircleDollarSign,
  Download,
  PackageSearch,
  ShoppingBag,
  Store,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../components/common/Button.jsx";
import { Card } from "../../../components/common/Card.jsx";
import { FormAlert } from "../../../components/common/FormAlert.jsx";
import { PageHeader } from "../../../components/layout/PageHeader.jsx";
import { DataTable } from "../../../components/table/DataTable.jsx";
import { apiErrorMessage } from "../../../services/apiClient.js";
import { reportService } from "../../../services/resourceServices.js";
import { formatCurrency, formatDate } from "../../../utils/formatters.js";
import { SkeletonTable } from "../../../components/skeleton/SkeletonTable.jsx";
import "../Reports.scss";

const reports = [
  {
    key: "sales",
    title: "Sales Report",
    icon: TrendingUp,
    description: "Revenue, order value, and growth trends.",
  },
  {
    key: "shopkeepers",
    title: "Shopkeeper Report",
    icon: Store,
    description: "Activity, approval, credit, and due exposure.",
  },
  {
    key: "products",
    title: "Product Report",
    icon: PackageSearch,
    description: "Sales velocity and category contribution.",
  },
  {
    key: "inventory",
    title: "Inventory Report",
    icon: Boxes,
    description: "Stock health, movements, and low-stock risk.",
  },
  {
    key: "payments",
    title: "Payment Report",
    icon: CircleDollarSign,
    description: "Collections, due aging, and payment methods.",
  },
  {
    key: "orders",
    title: "Order Report",
    icon: ShoppingBag,
    description: "Lifecycle performance and fulfillment status.",
  },
];

const salesColumns = [
  { key: "date", label: "Date" },
  { key: "orders", label: "Orders" },
  { key: "sales", label: "Sales" },
];

const inventoryColumns = [
  { key: "product", label: "Product" },
  { key: "sku", label: "SKU" },
  { key: "onHand", label: "On Hand" },
  { key: "reserved", label: "Reserved" },
  { key: "reorder", label: "Reorder Level" },
];

const reportTables = {
  sales: {
    columns: salesColumns,
    map: (row, index) => ({
      id: `${row.date}-${index}`,
      date: formatDate(row.date),
      orders: row.orders,
      sales: formatCurrency(row.sales, 2),
    }),
  },
  inventory: {
    columns: inventoryColumns,
    map: (row) => ({
      id: row.id,
      product: row.variant?.product?.name ?? "—",
      sku: row.variant?.sku ?? "—",
      onHand: row.onHandQuantity,
      reserved: row.reservedQuantity,
      reorder: row.reorderLevel,
    }),
  },
  shopkeepers: {
    columns: [
      { key: "shop", label: "Shopkeeper" },
      { key: "status", label: "Status" },
      { key: "orders", label: "Orders" },
      { key: "purchases", label: "Purchases" },
      { key: "due", label: "Due" },
    ],
    map: (row) => ({
      id: row.id,
      shop: row.shop_name,
      status: row.status,
      orders: row.orders,
      purchases: formatCurrency(row.purchases, 2),
      due: formatCurrency(row.due_amount, 2),
    }),
  },
  products: {
    columns: [
      { key: "designCode", label: "Design Code" },
      { key: "product", label: "Product" },
      { key: "category", label: "Category" },
      { key: "quantity", label: "Quantity Sold" },
      { key: "sales", label: "Sales" },
    ],
    map: (row) => ({
      id: row.id,
      designCode: row.design_code,
      product: row.name,
      category: row.category,
      quantity: row.quantity_sold,
      sales: formatCurrency(row.sales, 2),
    }),
  },
  payments: {
    columns: [
      { key: "date", label: "Date" },
      { key: "method", label: "Method" },
      { key: "transactions", label: "Transactions" },
      { key: "amount", label: "Amount" },
    ],
    map: (row, index) => ({
      id: `${row.date}-${row.method}-${index}`,
      date: formatDate(row.date),
      method: row.method,
      transactions: row.transactions,
      amount: formatCurrency(row.amount, 2),
    }),
  },
  orders: {
    columns: [
      { key: "status", label: "Order Status" },
      { key: "orders", label: "Orders" },
      { key: "value", label: "Order Value" },
    ],
    map: (row) => ({
      id: row.status,
      status: row.status,
      orders: row.orders,
      value: formatCurrency(row.value, 2),
    }),
  },
};

export function ReportsPage() {
  const navigate = useNavigate();
  const { reportType } = useParams();
  const active = Object.hasOwn(reportTables, reportType) ? reportType : null;
  const [request, setRequest] = useState({
    type: null,
    rows: [],
    error: null,
    complete: false,
  });

  useEffect(() => {
    if (!active) return undefined;
    let current = true;
    reportService[active]
      .list()
      .then((response) => {
        if (current) {
          setRequest({
            type: active,
            rows: response.data ?? [],
            error: null,
            complete: true,
          });
        }
      })
      .catch((requestError) => {
        if (current) {
          setRequest({
            type: active,
            rows: [],
            error: apiErrorMessage(requestError),
            complete: true,
          });
        }
      });
    return () => {
      current = false;
    };
  }, [active]);

  const currentRequest = request.type === active;
  const error = currentRequest ? request.error : null;
  const loading = Boolean(active) && (!currentRequest || !request.complete);

  const tableRows = useMemo(() => {
    const rows = currentRequest ? request.rows : [];
    return active ? rows.map(reportTables[active].map) : [];
  }, [active, currentRequest, request.rows]);

  const exportReport = () => {
    if (!tableRows.length) return;
    const content = JSON.stringify(tableRows, null, 2);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([content], { type: "application/json" }));
    link.download = `${active ?? "business"}-report.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Reports"
        title={active ? reports.find((report) => report.key === active)?.title : "Business Reports"}
        description="Business intelligence designed for fast operational decisions."
        actions={
          <Button icon={Download} variant="secondary" onClick={exportReport}>
            Export
          </Button>
        }
      />
      {error && <FormAlert>{error}</FormAlert>}
      {!active ? (
        <div className="report-grid">
          {reports.map((report) => (
            <Card className="report-card" key={report.title}>
              <span>
                <report.icon size={22} />
              </span>
              <div>
                <h2>{report.title}</h2>
                <p>{report.description}</p>
              </div>
              <button onClick={() => navigate(`/reports/${report.key}`)}>Open report</button>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="list-card" padded={false}>
          {loading ? (
            <SkeletonTable rows={6} cols={4} />
          ) : (
            <DataTable columns={reportTables[active].columns} rows={tableRows} />
          )}
        </Card>
      )}
    </div>
  );
}
