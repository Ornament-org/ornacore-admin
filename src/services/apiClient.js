import axios from "axios";
import { env } from "../config/env.js";
import { authStorage } from "../features/auth/authStorage.js";
import { notifyError, notifySuccess } from "../features/notifications/notificationSlice.js";

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 20000,
  headers: {
    Accept: "application/json",
  },
});

const rawApiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 20000,
  headers: {
    Accept: "application/json",
  },
});

let refreshPromise = null;

const mutationMethods = new Set(["post", "put", "patch", "delete"]);

const titleByStatus = {
  400: "Invalid request",
  401: "Authentication required",
  403: "Permission denied",
  404: "Record not found",
  409: "Action blocked",
  413: "Upload too large",
  422: "Please check the form",
  429: "Too many requests",
};

const titleByMethod = {
  post: "Saved successfully",
  put: "Updated successfully",
  patch: "Updated successfully",
  delete: "Deleted successfully",
};

const successFallbackByMethod = {
  post: "The record has been saved successfully.",
  put: "The record has been updated successfully.",
  patch: "The record has been updated successfully.",
  delete: "The record has been deleted successfully.",
};

const isNotificationDisabled = (config, type) =>
  config?.notification === false ||
  config?.notification?.silent ||
  config?.notification?.[type] === false;

const humanizeField = (field) =>
  String(field)
    .replaceAll("_", " ")
    .replaceAll(".", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const flattenDetails = (details) => {
  if (!details) return [];

  if (Array.isArray(details)) {
    return details
      .map((detail) => {
        if (typeof detail === "string") return detail;
        if (detail?.path && detail?.message)
          return `${humanizeField(detail.path)}: ${detail.message}`;
        if (detail?.field && detail?.message)
          return `${humanizeField(detail.field)}: ${detail.message}`;
        if (detail?.message) return detail.message;
        return null;
      })
      .filter(Boolean);
  }

  if (details.fieldErrors || details.formErrors) {
    return [
      ...(details.formErrors ?? []),
      ...Object.entries(details.fieldErrors ?? {}).flatMap(([field, messages]) =>
        (messages ?? []).map((message) => `${humanizeField(field)}: ${message}`),
      ),
    ];
  }

  if (typeof details === "object") {
    return Object.entries(details)
      .flatMap(([field, value]) => {
        if (Array.isArray(value)) {
          return value.map((message) => `${humanizeField(field)}: ${message}`);
        }
        if (typeof value === "string") return `${humanizeField(field)}: ${value}`;
        return [];
      })
      .filter(Boolean);
  }

  return [];
};

export const getApiError = (error) => {
  const status = error.response?.status;
  const responseError = error.response?.data?.error;
  const message =
    error.userMessage ||
    responseError?.message ||
    error.response?.data?.message ||
    error.message ||
    "Something went wrong";

  return {
    title:
      responseError?.title ||
      titleByStatus[status] ||
      (status >= 500 ? "Server error" : "Action failed"),
    message,
    code: responseError?.code,
    details: flattenDetails(responseError?.details ?? error.response?.data?.details),
    requestId: error.response?.data?.requestId,
    status,
  };
};

const getSuccessMessage = (response) => {
  const method = response.config?.method?.toLowerCase();
  const message = response.data?.message;
  if (message && message !== "Success") return message;
  return successFallbackByMethod[method] ?? "The request completed successfully.";
};

const getErrorMessage = (error) => getApiError(error).message;

export const configureApiClient = ({ getState, dispatch }) => {
  apiClient.interceptors.request.use((config) => {
    const accessToken = getState().auth.accessToken;
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  });

  apiClient.interceptors.response.use(
    (response) => {
      const method = response.config?.method?.toLowerCase();
      if (
        mutationMethods.has(method) &&
        response.data?.success !== false &&
        !isNotificationDisabled(response.config, "success")
      ) {
        dispatch(
          notifySuccess(getSuccessMessage(response), {
            title:
              response.config?.notification?.successTitle ?? titleByMethod[method] ?? "Success",
          }),
        );
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      const status = error.response?.status;
      const session = getState().auth;

      if (error.code === "ERR_CANCELED") return Promise.reject(error);

      if (
        status !== 401 ||
        originalRequest?._retry ||
        !session.refreshToken ||
        originalRequest?.url?.includes("/admin/auth/refresh")
      ) {
        const normalized = getApiError(error);
        error.userMessage = normalized.message;
        if (!isNotificationDisabled(originalRequest, "error")) {
          dispatch(
            notifyError(normalized.message, {
              title: normalized.title,
              details: normalized.details,
              requestId: normalized.requestId,
            }),
          );
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        refreshPromise ??= rawApiClient
          .post("/admin/auth/refresh", { refreshToken: session.refreshToken })
          .then(({ data }) => data.data)
          .finally(() => {
            refreshPromise = null;
          });

        const refreshed = await refreshPromise;
        dispatch({ type: "auth/sessionRefreshed", payload: refreshed });
        authStorage.write({
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
          user: refreshed.user,
        });
        originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        dispatch({ type: "auth/sessionCleared" });
        authStorage.clear();
        refreshError.userMessage = "Your session expired. Please sign in again.";
        dispatch(
          notifyError(refreshError.userMessage, {
            title: "Session expired",
          }),
        );
        return Promise.reject(refreshError);
      }
    },
  );
};

export const apiErrorMessage = getErrorMessage;
