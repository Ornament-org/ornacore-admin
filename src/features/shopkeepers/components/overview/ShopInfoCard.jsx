import { MapPin, Store } from "lucide-react";
import { StatusBadge } from "../../../../components/common/StatusBadge.jsx";

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : null;

const fullAddress = (a) =>
  [a?.addressLine1, a?.addressLine2, a?.city, a?.state, a?.pincode]
    .filter(Boolean)
    .join(", ");

function Row({ label, value, href }) {
  return (
    <div className="sic-row">
      <span className="sic-row__label">{label}</span>
      {href ? (
        <a className="sic-row__value sic-row__link" href={href} rel="noreferrer" target="_blank">
          {value || "—"}
        </a>
      ) : (
        <span className="sic-row__value">{value || "—"}</span>
      )}
    </div>
  );
}

export function ShopInfoCard({ shop = {}, owner = {}, address = {} }) {
  const hasMap = address?.latitude && address?.longitude;
  const mapSrc = hasMap
    ? `https://maps.google.com/maps?q=${address.latitude},${address.longitude}&z=16&output=embed`
    : null;
  const addr = fullAddress(address);

  return (
    <div className="shop-info-card">

      {/* ── Header ────────────────────────��─────────────────── */}
      <div className="shop-info-card__header">
        <div className="shop-info-card__header-icon">
          <Store size={18} />
        </div>
        <h2 className="shop-info-card__header-title">Shop & Owner Details</h2>
      </div>

      {/* ── Two-column body ──────────────────────────────────── */}
      <div className="shop-info-card__body">

        {/* Shop Info */}
        <div className="shop-info-card__section">
          <div className="shop-info-card__section-label">Shop Information</div>
          <Row label="Shop Name"      value={shop.shopName} />
          <Row label="Business Type"  value={shop.businessType} />
          <Row label="GST Number"     value={shop.gstNumber} />
          <Row label="PAN Number"     value={shop.panNumber} />
          <Row label="Registered"     value={fmtDate(shop.registrationDate)} />
          {shop.status ? (
            <div className="sic-row">
              <span className="sic-row__label">Status</span>
              <StatusBadge status={shop.status} />
            </div>
          ) : (
            <Row label="Status" value={null} />
          )}
        </div>

        {/* Owner & Contact */}
        <div className="shop-info-card__section">
          <div className="shop-info-card__section-label">Owner & Contact</div>
          <Row label="Owner Name"  value={owner.ownerName} />
          <Row
            label="Mobile"
            value={owner.mobile}
            href={owner.mobile ? `tel:${owner.mobile}` : null}
          />
          <Row
            label="Email"
            value={owner.email}
            href={owner.email ? `mailto:${owner.email}` : null}
          />
          <Row label="Alt. Mobile" value={owner.alternateMobile} />
        </div>
      </div>

      {/* ── Address strip ─────────────────────────────���──────── */}
      <div className="shop-info-card__address">
        <MapPin className="shop-info-card__address-pin" size={15} />
        <span>{addr || "Address not added"}</span>
      </div>

      {/* ── Map ─────────────────────────────────────────────── */}
      {hasMap ? (
        <div className="shop-info-card__map">
          <iframe
            allowFullScreen
            loading="lazy"
            src={mapSrc}
            title="Shop location"
          />
        </div>
      ) : (
        <div className="shop-info-card__map-placeholder">
          <MapPin size={22} />
          <span>Map location not added</span>
        </div>
      )}

    </div>
  );
}
