import { useNavigate } from "react-router-dom";
import { DueOverview } from "./DueOverview.jsx";
import { OwnerInfo } from "./OwnerInfo.jsx";
import { RowActions } from "./RowActions.jsx";
import { ShopkeeperIdentity } from "./ShopkeeperIdentity.jsx";
import { ShopkeeperStatusBadge } from "./ShopkeeperStatusBadge.jsx";

export function ShopkeeperRow({ row, onAction }) {
  const navigate = useNavigate();
  // A pending shop has no detail page to open yet (same rule the View button
  // enforces) — only approved/decided shops are clickable.
  const canOpen = row.status !== "PENDING_REVIEW";

  const openDetails = () => {
    if (canOpen) navigate(`/shopkeepers/${row.id}`);
  };

  return (
    <tr
      className={`sk-table__row${canOpen ? " sk-table__row--clickable" : ""}`}
      onClick={openDetails}
    >
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
      {/* Stop row navigation when using the per-row action buttons/menu. */}
      <td
        className="sk-table__cell sk-table__cell--actions"
        data-label="Action"
        onClick={(event) => event.stopPropagation()}
      >
        <RowActions row={row} onAction={onAction} />
      </td>
    </tr>
  );
}
