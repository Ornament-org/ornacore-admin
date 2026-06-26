import { CreditCard, Truck, Wallet, Weight } from "lucide-react";

const CARDS = [
  { key: "totalGoldDue",       label: "Total Gold Due",     Icon: Weight,     color: "amber"  },
  { key: "totalGoldDelivered", label: "Gold Delivered",     Icon: Truck,      color: "blue"   },
  { key: "totalGoldReceived",  label: "Gold Received",      Icon: Wallet,     color: "green"  },
  { key: "availableCredit",    label: "Available Credit",   Icon: CreditCard, color: "purple" },
];

export function GoldSummaryCards({ summary }) {
  return (
    <div className="shopkeeper-details__metrics">
      {CARDS.map(({ key, label, Icon, color }) => {
        const metric = summary?.[key] ?? { grams: "0.000", inrEquivalent: "0.00" };
        return (
          <div className="sd-metric" key={key}>
            <div className={`sd-metric__icon sd-metric__icon--${color}`}>
              <Icon size={22} />
            </div>
            <div className="sd-metric__body">
              <div className="sd-metric__label">{label}</div>
              <div className="sd-metric__value">{metric.grams} g</div>
              <div className="sd-metric__sub">₹ {Number(metric.inrEquivalent ?? 0).toLocaleString("en-IN")}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
