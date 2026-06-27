import { useEffect, useMemo, useState } from "react";
import { env } from "../config/env.js";
import { apiErrorMessage } from "../services/apiClient.js";

const extractRows = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.items)) return response.items;
  return [];
};

const identityRows = (rows) => rows;

export function useResourceData({
  service,
  previewRows,
  params,
  mapRows = identityRows,
  refreshKey = 0,
}) {
  const previewMode = env.enableDemoData || !service;
  const requestKey = useMemo(() => JSON.stringify(params ?? {}), [params]);
  const [request, setRequest] = useState({
    service: null,
    requestKey: null,
    rows: [],
    error: null,
    complete: false,
  });

  useEffect(() => {
    if (previewMode) return undefined;

    let active = true;

    service
      .list(params)
      .then((response) => {
        if (active) {
          const rows = extractRows(response);
          const rawMeta = response?.meta ?? response?.data?.meta ?? null;
          const normalizedMeta = rawMeta
            ? { ...rawMeta, total: rawMeta.totalItems ?? rawMeta.total ?? 0 }
            : null;
          setRequest({
            service,
            requestKey,
            rows: mapRows(rows),
            meta: normalizedMeta,
            error: null,
            complete: true,
          });
        }
      })
      .catch((requestError) => {
        if (active) {
          setRequest({
            service,
            requestKey,
            rows: [],
            meta: null,
            error: apiErrorMessage(requestError),
            complete: true,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [mapRows, params, previewMode, refreshKey, requestKey, service]);

  const isCurrentRequest = request.service === service;
  const isCurrentParams = request.requestKey === requestKey;

  return {
    rows: previewMode ? previewRows : isCurrentRequest ? request.rows : [],
    loading: previewMode ? false : !isCurrentRequest || !isCurrentParams || !request.complete,
    error: isCurrentRequest && isCurrentParams ? request.error : null,
    meta: isCurrentRequest && isCurrentParams ? request.meta : null,
    previewMode,
  };
}
