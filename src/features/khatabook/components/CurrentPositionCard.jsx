import { Card } from "../../../components/common/Card.jsx";
import { formatQuantity } from "./khatabookFormatters.js";

export function CurrentPositionCard({ position, metal }) {
  return (
    <Card className="current-position">
      <h3>Current Position</h3>
      <div className="current-position__metal">
        <span>Metal</span>
        <strong>{metal?.name || "—"}</strong>
      </div>
      <div className="current-position__metrics">
        <span>Current Outstanding Due</span>
        <strong className="is-red">{formatQuantity(position?.outstandingDue)}</strong>
        <span>Credit Limit</span>
        <strong>{formatQuantity(position?.creditLimit)}</strong>
        <span>Available Credit</span>
        <strong className="is-green">{formatQuantity(position?.availableCredit)}</strong>
      </div>
    </Card>
  );
}
