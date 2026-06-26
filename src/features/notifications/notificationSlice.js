import { createSlice, nanoid } from "@reduxjs/toolkit";

const MAX_VISIBLE_NOTIFICATIONS = 5;
const DEFAULT_DURATION_MS = 5200;

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
      state.items.unshift(normalizeNotification(action.payload));
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
    duration: options.duration ?? 7200,
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
