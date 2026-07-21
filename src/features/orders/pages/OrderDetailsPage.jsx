import { ArrowLeft, ArrowRightCircle, Truck, UserRoundCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../../components/common/Button.jsx";
import { Card } from "../../../components/common/Card.jsx";
import { EntityCell } from "../../../components/common/EntityCell.jsx";
import { FormAlert } from "../../../components/common/FormAlert.jsx";
import { PageHeader } from "../../../components/layout/PageHeader.jsx";
import { ResourceFormModal } from "../../../components/common/ResourceFormModal.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { orderService } from "../../../services/resourceServices.js";
import { formatCurrency, formatDate } from "../../../utils/formatters.js";
import { ORDER_TRANSITIONS } from "../orderTransitions.js";
import "./OrderDetailsPage.scss";

const formatWeight = (grams) => `${Number(grams ?? 0).toFixed(3).replace(/\.?0+$/, "")} g`;

const primaryImage = (product) =>
  product?.images?.find((image) => image.isPrimary)?.media?.secureUrl
  ?? product?.images?.[0]?.media?.secureUrl
  ?? null;

const weightByMetal = (items) => {
  const groups = new Map();
  items.forEach((item) => {
    const metalName = item.product?.metal?.name ?? "Other";
    const weight = Number(item.variant?.weightGrams ?? 0) * Number(item.quantity ?? 0);
    groups.set(metalName, (groups.get(metalName) ?? 0) + weight);
  });
  return Array.from(groups.entries());
};

export function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ open: false, type: null });

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await orderService.get(id);
      setOrder(response.data);
    } catch (requestError) {
      setError(requestError.userMessage || requestError.message || "Unable to load this order.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  const fields = useMemo(() => {
    if (modal.type === "assign") {
      return [
        { name: "assignedStaffId", label: "Staff ID", type: "number", nullable: true },
        { name: "note", label: "Assignment note", type: "textarea", nullable: true, fullWidth: true },
      ];
    }
    return [
      {
        name: "status",
        label: "Next status",
        type: "select",
        required: true,
        options: ORDER_TRANSITIONS[order?.status] ?? [],
      },
      { name: "note", label: "Status note", type: "textarea", nullable: true, fullWidth: true },
    ];
  }, [modal.type, order?.status]);

  if (loading) {
    return (
      <div className="page-stack">
        <PageHeader eyebrow="Orders" title="Loading order…" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page-stack">
        <PageHeader eyebrow="Orders" title="Order not found" />
        {error && <FormAlert>{error}</FormAlert>}
        <Link className="order-details__back" to="/orders">
          <ArrowLeft size={15} /> Back to Orders
        </Link>
      </div>
    );
  }

  const items = order.items ?? [];
  const weights = weightByMetal(items);
  const shopkeeper = order.shopkeeper;
  const canUpdateStatus = (ORDER_TRANSITIONS[order.status] ?? []).length > 0;

  return (
    <div className="page-stack">
      <PageHeader
        actions={
          <>
            <Button
              disabled={!canUpdateStatus}
              icon={ArrowRightCircle}
              variant="secondary"
              onClick={() => setModal({ open: true, type: "status" })}
            >
              Update status
            </Button>
            <Button icon={UserRoundCheck} variant="secondary" onClick={() => setModal({ open: true, type: "assign" })}>
              Assign staff
            </Button>
          </>
        }
        description={`Placed ${formatDate(order.createdAt, true)}`}
        eyebrow="Orders"
        title={order.orderNumber}
      />

      <Link className="order-details__back" to="/orders">
        <ArrowLeft size={15} /> Back to Orders
      </Link>

      <div className="order-details">
        <div className="order-details__main">
          <Card className="order-details__card">
            <div className="order-details__badges">
              <StatusBadge status={order.status} />
              <StatusBadge status={order.paymentStatus} />
            </div>

            <table className="order-details__table">
              <thead>
                <tr>
                  <th className="order-details__image-col" />
                  <th>Item</th>
                  <th>SKU</th>
                  <th>Metal</th>
                  <th>Weight (each)</th>
                  <th>Qty</th>
                  <th>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const imageUrl = primaryImage(item.product);
                  return (
                    <tr key={item.id}>
                      <td className="order-details__image-col" data-label="Image">
                        <span className="order-details__thumb">
                          {imageUrl ? (
                            <img alt={item.productNameSnapshot} src={imageUrl} />
                          ) : (
                            <span className="order-details__thumb-fallback">
                              {item.productNameSnapshot?.slice(0, 1) ?? "?"}
                            </span>
                          )}
                        </span>
                      </td>
                      <td data-label="Item">{item.productNameSnapshot}</td>
                      <td data-label="SKU">{item.skuSnapshot}</td>
                      <td data-label="Metal">{item.product?.metal?.name ?? "—"}</td>
                      <td data-label="Weight">{formatWeight(item.variant?.weightGrams)}</td>
                      <td data-label="Qty">{Number(item.quantity)}</td>
                      <td data-label="Line Total">
                        {item.pricingSnapshot?.configured === false
                          ? "Not priced"
                          : formatCurrency(item.lineTotal, 2)}
                      </td>
                    </tr>
                  );
                })}
                {!items.length && (
                  <tr>
                    <td className="order-details__empty" colSpan={7}>
                      No items on this order.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>

          {order.notes && (
            <Card className="order-details__card">
              <h2>Notes</h2>
              <p className="order-details__notes">{order.notes}</p>
            </Card>
          )}

          {(order.statusHistory ?? []).length > 0 && (
            <Card className="order-details__card">
              <h2>Status History</h2>
              <div className="order-details__timeline">
                {order.statusHistory
                  .slice()
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((entry) => (
                    <div className="order-details__timeline-row" key={entry.id}>
                      <span className="order-details__timeline-dot" />
                      <div>
                        <strong>{entry.toStatus?.replaceAll("_", " ")}</strong>
                        <span>{formatDate(entry.createdAt, true)}</span>
                        {entry.note && <p>{entry.note}</p>}
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          )}
        </div>

        <aside className="order-details__side">
          <Card className="order-details__card">
            <h2>Shopkeeper</h2>
            <EntityCell
              initials={(shopkeeper?.shopName ?? "—").slice(0, 2).toUpperCase()}
              subtitle={shopkeeper?.city ?? "—"}
              title={shopkeeper?.shopName ?? "—"}
            />
            <div className="order-details__rows">
              <div className="order-details__row">
                <span>Owner</span>
                <strong>{shopkeeper?.ownerName ?? "—"}</strong>
              </div>
              <div className="order-details__row">
                <span>Email</span>
                <strong>{shopkeeper?.user?.email ?? "—"}</strong>
              </div>
              <div className="order-details__row">
                <span>Mobile</span>
                <strong>{shopkeeper?.user?.mobile ?? "—"}</strong>
              </div>
              <div className="order-details__row">
                <span>Assigned Staff</span>
                <strong>{order.assignedStaff?.fullName ?? "Unassigned"}</strong>
              </div>
            </div>
          </Card>

          <Card className="order-details__card">
            <h2>Order Summary</h2>
            <div className="order-details__rows">
              {weights.map(([metalName, weight]) => (
                <div className="order-details__row" key={metalName}>
                  <span>{metalName} Weight</span>
                  <strong>{formatWeight(weight)}</strong>
                </div>
              ))}
              <div className="order-details__row order-details__row--total">
                <span>Grand Total</span>
                <strong>{formatCurrency(order.grandTotal, 2)}</strong>
              </div>
            </div>
          </Card>

          {order.delivery && (
            <Card className="order-details__card">
              <h2><Truck size={15} /> Delivery</h2>
              <div className="order-details__rows">
                <div className="order-details__row">
                  <span>Status</span>
                  <strong>{order.delivery.status?.replaceAll("_", " ")}</strong>
                </div>
                {order.delivery.courierName && (
                  <div className="order-details__row">
                    <span>Courier</span>
                    <strong>{order.delivery.courierName}</strong>
                  </div>
                )}
                {order.delivery.trackingNumber && (
                  <div className="order-details__row">
                    <span>Tracking No.</span>
                    <strong>{order.delivery.trackingNumber}</strong>
                  </div>
                )}
                {order.delivery.dispatchedAt && (
                  <div className="order-details__row">
                    <span>Dispatched</span>
                    <strong>{formatDate(order.delivery.dispatchedAt, true)}</strong>
                  </div>
                )}
                {order.delivery.deliveredAt && (
                  <div className="order-details__row">
                    <span>Delivered</span>
                    <strong>{formatDate(order.delivery.deliveredAt, true)}</strong>
                  </div>
                )}
              </div>
            </Card>
          )}
        </aside>
      </div>

      <ResourceFormModal
        description="Order pricing is recalculated by the backend and stored as an immutable snapshot."
        fields={fields}
        open={modal.open}
        submitLabel={modal.type === "assign" ? "Assign staff" : "Update status"}
        title={modal.type === "assign" ? "Assign order" : `Update ${order.orderNumber}`}
        onClose={() => setModal({ open: false, type: null })}
        onSubmit={async (payload) => {
          if (modal.type === "assign") {
            await orderService.assign(order.id, payload);
          } else {
            await orderService.updateStatus(order.id, payload);
          }
          setModal({ open: false, type: null });
          await loadOrder();
        }}
      />
    </div>
  );
}
