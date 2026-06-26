import { Store } from "lucide-react";
import { StatusBadge } from "../../../../components/common/StatusBadge.jsx";
import { DetailRowsCard } from "./DetailRows.jsx";

export function ShopDetailsCard({ shop }) {
  return (
    <DetailRowsCard
      icon={Store}
      title="Shop Details"
      rows={[
        ["Shop Name", shop?.shopName],
        ["Business Type", shop?.businessType],
        ["GST Number", shop?.gstNumber],
        ["PAN Number", shop?.panNumber],
        ["Registration Date", shop?.registrationDate],
        ["Status", shop?.status ? <StatusBadge status={shop.status} /> : null],
      ]}
    />
  );
}
