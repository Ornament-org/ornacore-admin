import { ImageOff } from "lucide-react";
import { Card } from "../../../components/common/Card.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";

const formatMoney = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value));
};

const priceLabel = (variants) => {
  const prices = variants.map((variant) => Number(variant.basePrice)).filter((value) => Number.isFinite(value) && value > 0);
  if (!prices.length) return "Price not set";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatMoney(min) : `${formatMoney(min)} – ${formatMoney(max)}`;
};

export function ProductLivePreviewCard({ name, coverImageUrl, status, metalName, purity, categoryName, description, variants }) {
  return (
    <Card className="product-preview-card">
      <div className="card-heading">
        <h2>Live Preview</h2>
      </div>
      <div className="product-preview-card__thumb">
        {coverImageUrl ? <img src={coverImageUrl} alt="" /> : <ImageOff size={24} />}
      </div>
      <div className="product-preview-card__body">
        <div className="product-preview-card__top">
          <strong>{name || "Untitled product"}</strong>
          <StatusBadge status={(status || "").replaceAll("_", " ")} />
        </div>
        <span className="product-preview-card__price">{priceLabel(variants)}</span>
        <dl className="product-preview-card__meta">
          <div>
            <dt>Metal</dt>
            <dd>{metalName || "—"}{purity ? ` · ${purity}` : ""}</dd>
          </div>
          <div>
            <dt>Category</dt>
            <dd>{categoryName || "—"}</dd>
          </div>
          <div>
            <dt>Variants</dt>
            <dd>{variants.length || 1}</dd>
          </div>
        </dl>
        {description && <p className="product-preview-card__description">{description}</p>}
      </div>
    </Card>
  );
}
