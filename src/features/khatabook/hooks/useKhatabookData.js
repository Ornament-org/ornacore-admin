import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchKhatabookMetals,
  fetchKhatabookOrders,
  invalidateShopkeeper,
  selectMetals,
  selectMetalsStatus,
  selectOrders,
  selectOrdersStatus,
} from "../store/khatabookSlice.js";

export function useKhatabookMetals(shopkeeperId) {
  const dispatch = useDispatch();
  const metals   = useSelector(selectMetals(shopkeeperId));
  const status   = useSelector(selectMetalsStatus(shopkeeperId));

  useEffect(() => {
    if (!shopkeeperId || status !== "idle") return;
    dispatch(fetchKhatabookMetals(shopkeeperId));
  }, [dispatch, shopkeeperId, status]);

  return { metals, loading: status === "loading" || status === "idle", status };
}

// BUG-6 fix: selectors now use composite key (shopkeeperId + metalId + search)
// so filtered results never overwrite the unfiltered cache entry.
// BUG-5 fix: `status` is included in effect deps so that after invalidateShopkeeper
// sets the composite key back to "idle", this hook automatically re-fetches.
export function useKhatabookOrders(shopkeeperId, { metalId = "", search = "" } = {}) {
  const dispatch = useDispatch();
  const orders   = useSelector(selectOrders(shopkeeperId, metalId, search));
  const status   = useSelector(selectOrdersStatus(shopkeeperId, metalId, search));

  useEffect(() => {
    if (!shopkeeperId || status !== "idle") return;
    dispatch(fetchKhatabookOrders({ shopkeeperId, metalId, search }));
  }, [dispatch, shopkeeperId, metalId, search, status]);

  return { orders, loading: status === "loading" || status === "idle" };
}

// BUG-5 fix: a single invalidate is now sufficient — it marks all composite order
// cache keys for this shopkeeper as "idle", which causes useKhatabookOrders to
// re-fetch automatically on the next render.
export function useKhatabookRefresh(shopkeeperId) {
  const dispatch = useDispatch();
  return () => dispatch(invalidateShopkeeper(shopkeeperId));
}
