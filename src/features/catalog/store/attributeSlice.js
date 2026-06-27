import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { attributeService } from "../../../services/resourceServices.js";

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchAttributes = createAsyncThunk(
  "attributes/fetchList",
  async (params = {}) => {
    const res = await attributeService.list({ pageSize: 200, ...params });
    return res.data ?? [];
  },
);

export const fetchAttributeById = createAsyncThunk(
  "attributes/fetchById",
  async (id) => {
    const res = await attributeService.get(id);
    return res.data;
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  rows: [],
  listStatus: "idle",      // idle | loading | succeeded | failed

  selected: null,          // full attribute object with .values[]
  selectedStatus: "idle",  // idle | loading | succeeded | failed
};

const attributeSlice = createSlice({
  name: "attributes",
  initialState,
  reducers: {
    invalidateList(state) {
      state.listStatus = "idle";
    },
    invalidateSelected(state) {
      state.selectedStatus = "idle";
    },
    invalidateAll(state) {
      state.listStatus = "idle";
      state.selectedStatus = "idle";
    },
    clearSelected(state) {
      state.selected = null;
      state.selectedStatus = "idle";
    },
    // Optimistic update when a value is removed from selected
    removeValueFromSelected(state, action) {
      if (state.selected) {
        state.selected.values = (state.selected.values ?? []).filter(
          (v) => String(v.id) !== String(action.payload),
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // list
      .addCase(fetchAttributes.pending, (state) => {
        state.listStatus = "loading";
      })
      .addCase(fetchAttributes.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.rows = action.payload;
      })
      .addCase(fetchAttributes.rejected, (state) => {
        state.listStatus = "failed";
      })
      // single
      .addCase(fetchAttributeById.pending, (state) => {
        state.selectedStatus = "loading";
      })
      .addCase(fetchAttributeById.fulfilled, (state, action) => {
        state.selectedStatus = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchAttributeById.rejected, (state) => {
        state.selectedStatus = "failed";
      });
  },
});

export const {
  invalidateList,
  invalidateSelected,
  invalidateAll,
  clearSelected,
  removeValueFromSelected,
} = attributeSlice.actions;

export default attributeSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectAttributeRows       = (s) => s.attributes.rows;
export const selectAttributeListStatus = (s) => s.attributes.listStatus;
export const selectSelectedAttribute   = (s) => s.attributes.selected;
export const selectSelectedStatus      = (s) => s.attributes.selectedStatus;
