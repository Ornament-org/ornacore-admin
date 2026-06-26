import { UserRound } from "lucide-react";
import { DetailRowsCard } from "./DetailRows.jsx";

export function OwnerDetailsCard({ owner }) {
  return (
    <DetailRowsCard
      icon={UserRound}
      title="Owner Details"
      rows={[
        ["Owner Name", owner?.ownerName],
        ["Mobile Number", owner?.mobile],
        ["Email", owner?.email],
        ["Alternate Mobile", owner?.alternateMobile],
      ]}
    />
  );
}
