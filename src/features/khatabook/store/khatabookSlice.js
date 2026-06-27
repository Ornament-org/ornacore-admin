import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { khatabookService } from "../../../services/resourceServices.js";

const normalizeList = (res) =>
  Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : (res?.data ?? []);

// BUG-6: key orders cache by shopkeeper+metal+search so filters don't corrupt shared cache
export const ordersKey = (shopkeeperId, metalId = "", search = "") =>
  `${shopkeeperId}:${metalId}:${search}`;

// ── Thunks ───────────────────────────────────────────────────────────────────

export const fetchKhatabookMetals = createAsyncThunk(
  "khatabook/fetchMetals",
  async (shopkeeperId) => {
    const res = await khatabookService.metals(shopkeeperId);
    return { shopkeeperId: String(shopkeeperId), metals: normalizeList(res) };
  },
);

export const fetchKhatabookOrders = createAsyncThunk(
  "khatabook/fetchOrders",
  async ({ shopkeeperId, metalId = "", search = "", pageSize = 50 }) => {
    const res = await khatabookService.orders(shopkeeperId, {
      metalId: metalId || undefined,
      search:  search  || undefined,
      pageSize,
    });
    return {
      cacheKey: ordersKey(shopkeeperId, metalId, search),
      orders: normalizeList(res),
    };
  },
);

// ── Slice ────────────────────────────────────────────────────────────────────

const khatabookSlice = createSlice({
  name: "khatabook",
  initialState: {
    metals:        {},   // { [shopkeeperId]: metal[] }
    orders:        {},   // { [cacheKey]: order[] }       BUG-6 fix
    metalsStatus:  {},   // { [shopkeeperId]: "idle"|"loading"|"succeeded"|"failed" }
    ordersStatus:  {},   // { [cacheKey]: "idle"|"loading"|"succeeded"|"failed" }
    addCollectionModal: {
      open: false,
      shopkeeperId: null,
      metalId: null,
    },
  },
  reducers: {
    invalidateShopkeeper: (state, action) => {
      const id = String(action.payload);
      state.metalsStatus[id] = "idle";
      // BUG-6 fix: invalidate ALL order cache keys that belong to this shopkeeper
      Object.keys(state.ordersStatus).forEach((key) => {
        if (key.startsWith(`${id}:`)) state.ordersStatus[key] = "idle";
      });
    },
    invalidateOrders: (state, action) => {
      const id = String(action.payload);
      Object.keys(state.ordersStatus).forEach((key) => {
        if (key.startsWith(`${id}:`)) state.ordersStatus[key] = "idle";
      });
    },
    invalidateAll: (state) => {
      state.metalsStatus = {};
      state.ordersStatus = {};
    },
    openAddCollectionModal: (state, action) => {
      state.addCollectionModal.open = true;
      state.addCollectionModal.shopkeeperId = action.payload?.shopkeeperId ?? null;
      state.addCollectionModal.metalId = action.payload?.metalId ?? null;
    },
    closeAddCollectionModal: (state) => {
      state.addCollectionModal.open = false;
      state.addCollectionModal.shopkeeperId = null;
      state.addCollectionModal.metalId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // metals
      .addCase(fetchKhatabookMetals.pending, (state, { meta }) => {
        state.metalsStatus[String(meta.arg)] = "loading";
      })
      .addCase(fetchKhatabookMetals.fulfilled, (state, { payload }) => {
        state.metals[payload.shopkeeperId]       = payload.metals;
        state.metalsStatus[payload.shopkeeperId] = "succeeded";
      })
      .addCase(fetchKhatabookMetals.rejected, (state, { meta }) => {
        state.metalsStatus[String(meta.arg)] = "failed";
      })
      // orders — BUG-6: use composite cache key
      .addCase(fetchKhatabookOrders.pending, (state, { meta }) => {
        const key = ordersKey(meta.arg.shopkeeperId, meta.arg.metalId, meta.arg.search);
        state.ordersStatus[key] = "loading";
      })
      .addCase(fetchKhatabookOrders.fulfilled, (state, { payload }) => {
        state.orders[payload.cacheKey]       = payload.orders;
        state.ordersStatus[payload.cacheKey] = "succeeded";
      })
      .addCase(fetchKhatabookOrders.rejected, (state, { meta }) => {
        const key = ordersKey(meta.arg.shopkeeperId, meta.arg.metalId, meta.arg.search);
        state.ordersStatus[key] = "failed";
      });
  },
});

export const {
  invalidateShopkeeper,
  invalidateOrders,
  invalidateAll,
  openAddCollectionModal,
  closeAddCollectionModal,
} = khatabookSlice.actions;
export default khatabookSlice.reducer;

// ── Selectors ────────────────────────────────────────────────────────────────
export const selectMetals       = (id) => (s) => s.khatabook.metals[String(id)] ?? [];
export const selectMetalsStatus = (id) => (s) => s.khatabook.metalsStatus[String(id)] ?? "idle";

// BUG-6 fix: selectors now require the full cache key
export const selectOrders = (shopkeeperId, metalId = "", search = "") => (s) =>
  s.khatabook.orders[ordersKey(shopkeeperId, metalId, search)] ?? [];
export const selectOrdersStatus = (shopkeeperId, metalId = "", search = "") => (s) =>
  s.khatabook.ordersStatus[ordersKey(shopkeeperId, metalId, search)] ?? "idle";

export const selectAddCollectionModal = (s) => s.khatabook.addCollectionModal;
