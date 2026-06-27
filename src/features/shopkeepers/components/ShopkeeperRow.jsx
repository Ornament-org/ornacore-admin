import { DueOverview } from "./DueOverview.jsx";
import { OwnerInfo } from "./OwnerInfo.jsx";
import { RowActions } from "./RowActions.jsx";
import { ShopkeeperIdentity } from "./ShopkeeperIdentity.jsx";
import { ShopkeeperStatusBadge } from "./ShopkeeperStatusBadge.jsx";

export function ShopkeeperRow({ row, onAction }) {
  return (
    <tr className="sk-table__row">
      <td className="sk-table__cell">
        <ShopkeeperIdentity
          shopName={row.shopName}
          shopId={row.shopId ?? row.id}
          phone={row.phone}
        />
      </td>
      <td className="sk-table__cell">
        <OwnerInfo ownerName={row.ownerName} city={row.city} state={row.state} />
      </td>
      <td className="sk-table__cell">
        <ShopkeeperStatusBadge
          status={row.status}
          sinceDate={row.approvedAt ?? row.createdAt}
        />
      </td>
      <td className="sk-table__cell">
        <DueOverview metalDues={row.metalDues} cashDue={row.cashDue} />
      </td>
      <td className="sk-table__cell sk-table__cell--actions">
        <RowActions row={row} onAction={onAction} />
      </td>
    </tr>
  );
}
