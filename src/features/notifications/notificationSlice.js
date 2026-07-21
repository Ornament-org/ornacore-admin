import { createSlice, nanoid } from "@reduxjs/toolkit";

const MAX_VISIBLE_NOTIFICATIONS = 3;
const DEFAULT_DURATION_MS = 3000;

const normalizeNotification = (payload) => ({
  id: payload.id ?? nanoid(),
  type: payload.type ?? "info",
  title: payload.title ?? (payload.type === "error" ? "Something went wrong" : "Notification"),
  message: payload.message ?? "",
  details: payload.details ?? [],
  requestId: payload.requestId ?? null,
  duration: payload.duration ?? DEFAULT_DURATION_MS,
  createdAt: Date.now(),
});

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
  },
  reducers: {
    pushNotification(state, action) {
      const next = normalizeNotification(action.payload);
      // Collapse repeats of the same message (e.g. a background call retrying
      // and failing the same way) into one — bump it back to the front and
      // restart its timer instead of stacking a duplicate on screen.
      const duplicate = state.items.find(
        (item) => item.type === next.type && item.message === next.message,
      );
      if (duplicate) {
        state.items = state.items.filter((item) => item.id !== duplicate.id);
        next.id = duplicate.id;
      }
      state.items.unshift(next);
      state.items = state.items.slice(0, MAX_VISIBLE_NOTIFICATIONS);
    },
    dismissNotification(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearNotifications(state) {
      state.items = [];
    },
  },
});

export const { pushNotification, dismissNotification, clearNotifications } =
  notificationSlice.actions;

export const notifySuccess = (message, options = {}) =>
  pushNotification({
    type: "success",
    title: options.title ?? "Success",
    message,
    ...options,
  });

export const notifyError = (message, options = {}) =>
  pushNotification({
    type: "error",
    title: options.title ?? "Action failed",
    message,
    duration: options.duration ?? 4500,
    ...options,
  });

export const notifyInfo = (message, options = {}) =>
  pushNotification({
    type: "info",
    title: options.title ?? "Heads up",
    message,
    ...options,
  });

export default notificationSlice.reducer;
