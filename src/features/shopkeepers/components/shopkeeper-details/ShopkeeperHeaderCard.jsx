import { Mail, MapPin, Pencil, Phone } from "lucide-react";
import { StatusBadge } from "../../../../components/common/StatusBadge.jsx";

function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function ShopkeeperHeaderCard({ details, onEdit, onEditLimits }) {
  const shop = details?.shop ?? {};
  const owner = details?.owner ?? {};
  const address = details?.address ?? {};

  const memberSince = details?.memberSince
    ? new Date(details.memberSince).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : null;

  return (
    <div className="sd-header">
      <div className="sd-header__left">
        <div className="sd-header__avatar">
          {initials(shop.shopName) || "?"}
        </div>

        <div className="sd-header__info">
          <div className="sd-header__name-row">
            <h1 className="sd-header__name">{shop.shopName ?? "Shopkeeper"}</h1>
            {details?.status && <StatusBadge status={details.status} />}
          </div>

          <div className="sd-header__meta">
            {details?.shopkeeperId && <span>ID: {details.shopkeeperId}</span>}
            {memberSince && <><span className="dot">·</span><span>Since {memberSince}</span></>}
            {shop.businessType && <><span className="dot">·</span><span>{shop.businessType}</span></>}
            {shop.gstNumber && <><span className="dot">·</span><span>GST: {shop.gstNumber}</span></>}
          </div>

          <div className="sd-header__contacts">
            {owner.mobile && (
              <span className="sd-header__chip">
                <Phone size={12} /> {owner.mobile}
              </span>
            )}
            {owner.email && (
              <span className="sd-header__chip">
                <Mail size={12} /> {owner.email}
              </span>
            )}
            {address.city && (
              <span className="sd-header__chip">
                <MapPin size={12} /> {[address.city, address.state].filter(Boolean).join(", ")}
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        className="sd-header__edit-btn"
        onClick={onEdit}
        aria-label="Edit shopkeeper"
        title="Edit"
      >
        <Pencil size={15} />
      </button>
    </div>
  );
}
