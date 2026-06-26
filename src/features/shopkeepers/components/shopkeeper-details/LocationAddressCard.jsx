import { MapPin } from "lucide-react";

const fullAddress = (address) =>
  [address?.addressLine1, address?.addressLine2, address?.city, address?.state, address?.pincode]
    .filter(Boolean)
    .join(", ");

export function LocationAddressCard({ address }) {
  const hasMap = address?.latitude && address?.longitude;
  const mapUrl = hasMap
    ? `https://www.google.com/maps/search/?api=1&query=${address.latitude},${address.longitude}`
    : null;

  return (
    <div className="sd-info-card">
      <div className="sd-info-card__header">
        <div className="sd-info-card__icon">
          <MapPin size={18} />
        </div>
        <h2 className="sd-info-card__title">Location & Address</h2>
      </div>
      <div className="sd-info-card__body">
        <div className="sd-row">
          <span className="sd-row__label">Full Address</span>
          <strong className="sd-row__value">{fullAddress(address) || "—"}</strong>
        </div>
        <div className="sd-row">
          <span className="sd-row__label">City</span>
          <strong className="sd-row__value">{address?.city || "—"}</strong>
        </div>
        <div className="sd-row">
          <span className="sd-row__label">State</span>
          <strong className="sd-row__value">{address?.state || "—"}</strong>
        </div>
        <div className="sd-row">
          <span className="sd-row__label">Pincode</span>
          <strong className="sd-row__value">{address?.pincode || "—"}</strong>
        </div>
      </div>
      <div className="sd-map-preview">
        {hasMap ? (
          <a href={mapUrl} target="_blank" rel="noreferrer">View on Map ↗</a>
        ) : (
          "Map location not added"
        )}
      </div>
    </div>
  );
}
