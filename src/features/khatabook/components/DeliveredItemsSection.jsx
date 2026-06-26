import { formatQuantity } from "./khatabookFormatters.js";

export function DeliveredItemsSection({ order }) {
  return (
    <section className="khatabook-section">
      <h3>Items Delivered</h3>
      <div className="khatabook-table">
        <div className="khatabook-table__head">
          <span>Item Name</span>
          <span>Gross Weight</span>
          <span>Tunch/Purity</span>
          <span>Fine Weight</span>
        </div>
        {order.items.map((item) => (
          <div className="khatabook-table__row" key={item.id}>
            <span>{item.itemName}</span>
            <span>{formatQuantity(item.grossWeight)}</span>
            <span>{Number(item.tunch).toLocaleString("en-IN")}</span>
            <span>{formatQuantity(item.fineWeight)}</span>
          </div>
        ))}
      </div>
      <div className="khatabook-section__total">
        <span>Total Fine Delivered</span>
        <strong>{formatQuantity(order.fineDelivered)}</strong>
      </div>
    </section>
  );
}
