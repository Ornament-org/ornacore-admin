import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchShopkeepers,
  fetchShopkeeperStats,
  invalidateAll,
  selectListStatus,
  selectShopkeeperMeta,
  selectShopkeeperRows,
  selectShopkeeperStats,
  selectStatsStatus,
} from "../store/shopkeeperSlice.js";

export function useShopkeeperList(params) {
  const dispatch    = useDispatch();
  const rows        = useSelector(selectShopkeeperRows);
  const meta        = useSelector(selectShopkeeperMeta);
  const listStatus  = useSelector(selectListStatus);

  useEffect(() => {
    dispatch(fetchShopkeepers(params));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, JSON.stringify(params)]);

  return {
    rows,
    meta,
    loading: listStatus === "loading" || listStatus === "idle",
    error:   listStatus === "failed",
  };
}

export function useShopkeeperStats() {
  const dispatch    = useDispatch();
  const stats       = useSelector(selectShopkeeperStats);
  const statsStatus = useSelector(selectStatsStatus);

  useEffect(() => {
    if (statsStatus === "idle") dispatch(fetchShopkeeperStats());
  }, [dispatch, statsStatus]);

  return { stats, loading: statsStatus !== "succeeded" };
}

export function useShopkeeperRefresh() {
  const dispatch = useDispatch();
  return () => {
    dispatch(invalidateAll());
    dispatch(fetchShopkeeperStats());
  };
}
