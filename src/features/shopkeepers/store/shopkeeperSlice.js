import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { shopkeeperService } from "../../../services/resourceServices.js";

const getMeta = (r) => r?.meta ?? r?.data?.meta ?? null;
const getTotal = (r) => getMeta(r)?.totalItems ?? getMeta(r)?.total ?? 0;
const getRows = (r) => {
  if (Array.isArray(r?.data)) return r.data;
  if (Array.isArray(r?.data?.items)) return r.data.items;
  if (Array.isArray(r?.items)) return r.items;
  return [];
};

export const fetchShopkeepers = createAsyncThunk(
  "shopkeepers/fetchList",
  async (params) => {
    const res = await shopkeeperService.list(params);
    const rawMeta = getMeta(res);
    return {
      rows: getRows(res),
      meta: rawMeta ? { ...rawMeta, total: getTotal(res) } : null,
      params,
    };
  },
);

export const fetchShopkeeperStats = createAsyncThunk(
  "shopkeepers/fetchStats",
  async () => {
    const [totalRes, approvedRes, pendingRes] = await Promise.allSettled([
      shopkeeperService.list({ pageSize: 1 }),
      shopkeeperService.list({ pageSize: 1, status: "APPROVED" }),
      shopkeeperService.list({ pageSize: 1, status: "PENDING_REVIEW" }),
    ]);
    const val = (r) => (r.status === "fulfilled" ? getTotal(r.value) : 0);
    const total    = val(totalRes);
    const approved = val(approvedRes);
    const pending  = val(pendingRes);
    return {
      total,
      approved,
      approvedPercent: total && approved ? Math.round((approved / total) * 100) : null,
      pendingApproval: pending,
      overdue: 0,
    };
  },
);

const initialState = {
  rows: [],
  meta: null,
  params: null,
  listStatus: "idle",   // idle | loading | succeeded | failed
  stats: { total: 0, approved: 0, approvedPercent: null, pendingApproval: 0, overdue: 0 },
  statsStatus: "idle",
};

const shopkeeperSlice = createSlice({
  name: "shopkeepers",
  initialState,
  reducers: {
    invalidateList: (state) => {
      state.listStatus = "idle";
    },
    invalidateStats: (state) => {
      state.statsStatus = "idle";
    },
    invalidateAll: (state) => {
      state.listStatus = "idle";
      state.statsStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShopkeepers.pending, (state) => {
        state.listStatus = "loading";
      })
      .addCase(fetchShopkeepers.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.rows   = action.payload.rows;
        state.meta   = action.payload.meta;
        state.params = action.payload.params;
      })
      .addCase(fetchShopkeepers.rejected, (state) => {
        state.listStatus = "failed";
      })
      .addCase(fetchShopkeeperStats.pending, (state) => {
        state.statsStatus = "loading";
      })
      .addCase(fetchShopkeeperStats.fulfilled, (state, action) => {
        state.statsStatus = "succeeded";
        state.stats = action.payload;
      })
      .addCase(fetchShopkeeperStats.rejected, (state) => {
        state.statsStatus = "failed";
      });
  },
});

export const { invalidateList, invalidateStats, invalidateAll } = shopkeeperSlice.actions;
export default shopkeeperSlice.reducer;

// ── Selectors ────────────────────────────────────────────────────────────────
export const selectShopkeeperRows   = (s) => s.shopkeepers.rows;
export const selectShopkeeperMeta   = (s) => s.shopkeepers.meta;
export const selectShopkeeperParams = (s) => s.shopkeepers.params;
export const selectShopkeeperStats  = (s) => s.shopkeepers.stats;
export const selectListStatus       = (s) => s.shopkeepers.listStatus;
export const selectStatsStatus      = (s) => s.shopkeepers.statsStatus;
