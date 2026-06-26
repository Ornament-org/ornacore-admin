import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/store/authSlice.js";
import notificationReducer from "../features/notifications/notificationSlice.js";
import { configureApiClient } from "../services/apiClient.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: true,
    }),
});

configureApiClient({
  getState: store.getState,
  dispatch: store.dispatch,
});
