import { MapPin, User } from "lucide-react";
import "./OwnerInfo.scss";

export function OwnerInfo({ ownerName, city, state }) {
  const location = [city, state].filter(Boolean).join(", ");

  return (
    <div className="sk-owner">
      <span className="sk-owner__row">
        <User size={11} />
        {ownerName}
      </span>
      {location && (
        <span className="sk-owner__row sk-owner__row--muted">
          <MapPin size={11} />
          {location}
        </span>
      )}
    </div>
  );
}
