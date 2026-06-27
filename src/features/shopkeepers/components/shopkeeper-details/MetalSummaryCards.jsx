import { CreditCard, Truck, Wallet, Weight } from "lucide-react";

export function MetalSummaryCards({ summary }) {
  const metalName = summary?.primaryMetal?.name ?? "Metal";

  const CARDS = [
    { key: "totalDue",       label: `Total ${metalName} Due`,  Icon: Weight,     color: "amber"  },
    { key: "totalDelivered", label: `${metalName} Delivered`,  Icon: Truck,      color: "blue"   },
    { key: "totalReceived",  label: `${metalName} Received`,   Icon: Wallet,     color: "green"  },
    { key: "availableCredit", label: "Available Credit",       Icon: CreditCard, color: "purple" },
  ];

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
