import { Phone } from "lucide-react";
import { Avatar } from "../../../components/common/Avatar.jsx";
import "./ShopkeeperIdentity.scss";

function getInitials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ShopkeeperIdentity({ shopName, shopId, phone, profileImageUrl }) {
  return (
    <div className="sk-identity">
      <Avatar initials={getInitials(shopName)} imageUrl={profileImageUrl} imageAlt={shopName || "Shopkeeper"} />
      <div className="sk-identity__copy">
        <strong className="sk-identity__name">{shopName}</strong>
        <span className="sk-identity__id">{shopId}</span>
        {phone && (
          <span className="sk-identity__phone">
            <Phone size={10} />
            {phone}
          </span>
        )}
      </div>
    </div>
  );
}
