import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { storeSettingsService } from "../../../services/resourceServices.js";

// displayName is the one app name shown everywhere post-login (sidebar brand mark,
// browser tab, favicon) — it comes from Settings, not the hardcoded "ORNACORE" string.
// Fetched once per session via the unpermissioned /branding endpoint (any authenticated
// staff member, not just settings.view holders — see store-settings.routes.js).
const DEFAULT_DISPLAY_NAME = "ORNACORE";

const initialState = {
  displayName: DEFAULT_DISPLAY_NAME,
  logo: null,
  favicon: null,
  status: "idle", // "idle" -> "loading" -> "loaded" | "failed"
};

export const fetchBranding = createAsyncThunk("branding/fetch", async () => {
  const response = await storeSettingsService.getBranding();
  return response.data;
});

const brandingSlice = createSlice({
  name: "branding",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranding.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBranding.fulfilled, (state, action) => {
        state.status = "loaded";
        state.displayName = action.payload.displayName?.trim() || DEFAULT_DISPLAY_NAME;
        state.logo = action.payload.logo || null;
        state.favicon = action.payload.favicon || null;
      })
      .addCase(fetchBranding.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export default brandingSlice.reducer;
