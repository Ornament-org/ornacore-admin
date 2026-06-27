import { ShopkeeperRow } from "./ShopkeeperRow.jsx";
import { TablePagination } from "./TablePagination.jsx";
import "./ShopkeeperTable.scss";

const COLUMNS = ["SHOPKEEPER", "OWNER & LOCATION", "STATUS", "DUE OVERVIEW", "ACTION"];

export function ShopkeeperTable({ rows, loading, page, total, pageSize, onPage, onAction }) {
  return (
    <div className="sk-table-outer">
      <div className="sk-table-scroll">
        <table className="sk-table" aria-label="Shopkeepers">
          <thead className="sk-table__head">
            <tr>
              {COLUMNS.map((col) => (
                <th key={col} className="sk-table__th">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="sk-table__state">
                  <span className="sk-table__spinner" aria-label="Loading" />
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="sk-table__state">
                  <p className="sk-table__empty">No shopkeepers match your filters.</p>
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((row) => (
                <ShopkeeperRow key={row.id} row={row} onAction={onAction} />
              ))}
          </tbody>
        </table>
      </div>
      <div className="sk-table__footer">
        <TablePagination
          page={page}
          total={total}
          pageSize={pageSize}
          onChange={onPage}
        />
      </div>
    </div>
  );
}
