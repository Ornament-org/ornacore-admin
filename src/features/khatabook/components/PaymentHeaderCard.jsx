import { Card } from "../../../components/common/Card.jsx";

export function PaymentHeaderCard({ shopkeeper }) {
  return (
    <Card className="payment-header">
      <div className="payment-header__info">
        <h2>{shopkeeper?.shopName || "Shopkeeper"}</h2>
        <div className="payment-header__details">
          <span>ID: {shopkeeper?.shopkeeperId || "—"}</span>
          <span>Member Since: {shopkeeper?.memberSince || "—"}</span>
        </div>
      </div>
    </Card>
  );
}
