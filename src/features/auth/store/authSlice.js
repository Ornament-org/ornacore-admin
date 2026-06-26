import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiErrorMessage } from "../../../services/apiClient.js";
import { authService } from "../../../services/authService.js";
import { authStorage } from "../authStorage.js";

const storedSession = authStorage.read();

export const loginAdmin = createAsyncThunk(
  "auth/loginAdmin",
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials);
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error));
    }
  },
);

export const hydrateCurrentUser = createAsyncThunk(
  "auth/hydrateCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.me();
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error));
    }
  },
);

export const refreshSession = createAsyncThunk(
  "auth/refreshSession",
  async (_, { getState, rejectWithValue }) => {
    try {
      const refreshToken = getState().auth.refreshToken;
      return await authService.refreshSession(refreshToken);
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error));
    }
  },
);

export const logoutAdmin = createAsyncThunk("auth/logoutAdmin", async (_, { getState }) => {
  const refreshToken = getState().auth.refreshToken;
  try {
    await authService.logout(refreshToken);
  } finally {
    authStorage.clear();
  }
});

const initialState = {
  user: storedSession?.user ?? null,
  accessToken: storedSession?.accessToken ?? null,
  refreshToken: storedSession?.refreshToken ?? null,
  status: storedSession ? "authenticated" : "anonymous",
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionRefreshed(state, action) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.status = "authenticated";
    },
    sessionCleared(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.status = "anonymous";
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "authenticated";
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        authStorage.write({
          user: action.payload.user,
          accessToken: action.payload.accessToken,
          refreshToken: action.payload.refreshToken,
        });
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unable to sign in";
      })
      .addCase(hydrateCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(hydrateCurrentUser.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.status = "anonymous";
        authStorage.clear();
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        authStorage.write({
          user: action.payload.user,
          accessToken: action.payload.accessToken,
          refreshToken: action.payload.refreshToken,
        });
      })
      .addCase(refreshSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unable to refresh session";
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.status = "anonymous";
        authStorage.clear();
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.status = "anonymous";
      });
  },
});

export const authActions = authSlice.actions;
export default authSlice.reducer;
