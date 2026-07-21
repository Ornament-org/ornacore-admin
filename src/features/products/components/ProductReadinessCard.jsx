import { Check } from "lucide-react";
import { Card } from "../../../components/common/Card.jsx";

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProductReadinessCard({ items }) {
  const completeCount = items.filter((item) => item.done).length;
  const percent = items.length ? Math.round((completeCount / items.length) * 100) : 0;
  const offset = CIRCUMFERENCE * (1 - percent / 100);

  return (
    <Card className="product-readiness-card">
      <div className="card-heading">
        <h2>Readiness</h2>
      </div>
      <div className="product-readiness-card__gauge">
        <svg viewBox="0 0 100 100" width="88" height="88">
          <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="var(--line)" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="var(--gold)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <strong>{percent}%</strong>
      </div>
      <ul className="product-readiness-card__list">
        {items.map((item) => (
          <li key={item.label} className={item.done ? "is-done" : ""}>
            <span className="product-readiness-card__check">{item.done ? <Check size={12} /> : null}</span>
            {item.label}
          </li>
        ))}
      </ul>
    </Card>
  );
}
