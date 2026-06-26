import { CalendarClock, Clock, MapPin, Phone, Store, User } from "lucide-react";
import { formatMoney } from "../../../components/khatabookFormatters.js";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function SelectedShopCard({ shop, metals, lastPayment, currentRate, rateUpdatedAt }) {
  if (!shop) return null;

  return (
    <div className="collection-modal__selected-shop">

      {/* Label */}
      <span className="collection-modal__selected-label">Selected Shop</span>

      {/* Name + status */}
      <div className="collection-modal__selected-head">
        <div className="collection-modal__selected-name">
          {shop.shopName ?? shop.name}
          {shop.tier === "PREFERRED" && (
            <span className="collection-modal__preferred-badge" style={{ marginLeft: 8 }}>
              Preferred
            </span>
          )}
        </div>
        <span className="collection-modal__active-badge">
          {shop.status ?? "Active"}
        </span>
      </div>

      {/* Detail rows */}
      <div className="collection-modal__selected-details">
        {(shop.city || shop.state) && (
          <div className="collection-modal__selected-row">
            <MapPin size={12} />
            {[shop.addressLine1, shop.city, shop.state].filter(Boolean).join(", ")}
          </div>
        )}
        {shop.shopId && (
          <div className="collection-modal__selected-row">
            <Store size={12} />
            {shop.shopId}
          </div>
        )}
        {shop.phone && (
          <div className="collection-modal__selected-row">
            <Phone size={12} />
            {shop.phone}
          </div>
        )}
        {shop.ownerName && (
          <div className="collection-modal__selected-row">
            <User size={12} />
            {shop.ownerName}
          </div>
        )}
      </div>

      {/* Metal-wise dues */}
      {metals && metals.length > 0 && (
        <div className="collection-modal__dues-section">
          <div className="collection-modal__dues-label">Current Dues</div>
          <div className="collection-modal__dues-grid">
            {metals.map((m) => {
              const due = Number(m.outstandingDue ?? 0);
              return (
                <div
                  key={m.metal.id}
                  className={`collection-modal__due-chip${due > 0 ? " has-due" : ""}`}
                >
                  <span className="collection-modal__due-chip-metal">{m.metal.name}</span>
                  <span className="collection-modal__due-chip-value">
                    {due > 0 ? `${due.toFixed(3)} gm` : "Clear"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Last payment */}
      {lastPayment && (
        <div className="collection-modal__last-payment">
          <CalendarClock size={13} />
          <span>
            Last payment
            {lastPayment.fineCredit
              ? <>&nbsp;<strong>{Number(lastPayment.fineCredit).toFixed(3)} gm</strong> on</>
              : null}
            &nbsp;<strong>{formatDate(lastPayment.date)}</strong>
          </span>
        </div>
      )}

      {/* Live rate */}
      {currentRate != null && (
        <div className="collection-modal__rate-card">
          <div>
            <div className="collection-modal__rate-label">Live Rate (per 10 gm)</div>
            <div className="collection-modal__rate-value">{formatMoney(currentRate)}</div>
          </div>
          {rateUpdatedAt && (
            <div className="collection-modal__rate-updated">
              <Clock size={10} />
              {rateUpdatedAt}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
