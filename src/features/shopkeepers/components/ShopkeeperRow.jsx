import { DueOverview } from "./DueOverview.jsx";
import { OwnerInfo } from "./OwnerInfo.jsx";
import { RowActions } from "./RowActions.jsx";
import { ShopkeeperIdentity } from "./ShopkeeperIdentity.jsx";
import { ShopkeeperStatusBadge } from "./ShopkeeperStatusBadge.jsx";

export function ShopkeeperRow({ row, onAction }) {
  return (
    <tr className="sk-table__row">
      <td className="sk-table__cell" data-label="Shopkeeper">
        <ShopkeeperIdentity
          shopName={row.shopName}
          shopId={row.shopId ?? row.id}
          phone={row.phone}
        />
      </td>
      <td className="sk-table__cell" data-label="Owner & Location">
        <OwnerInfo ownerName={row.ownerName} city={row.city} state={row.state} />
      </td>
      <td className="sk-table__cell" data-label="Status">
        <ShopkeeperStatusBadge
          status={row.status}
          sinceDate={row.approvedAt ?? row.createdAt}
        />
      </td>
      <td className="sk-table__cell" data-label="Due Overview">
        <DueOverview metalDues={row.metalDues} cashDue={row.cashDue} />
      </td>
      <td className="sk-table__cell sk-table__cell--actions" data-label="Action">
        <RowActions row={row} onAction={onAction} />
      </td>
    </tr>
  );
}
