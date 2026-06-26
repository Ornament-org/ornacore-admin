import { AlertTriangle, CheckCircle2, Info, ShieldAlert, Sparkles, X } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dismissNotification } from "../../features/notifications/notificationSlice.js";
import "./SnackbarHost.scss";

const iconByType = {
  success: CheckCircle2,
  error: ShieldAlert,
  warning: AlertTriangle,
  info: Info,
};

export function SnackbarHost() {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notifications.items);

  useEffect(() => {
    const timers = notifications
      .filter((notification) => notification.duration > 0)
      .map((notification) =>
        window.setTimeout(() => {
          dispatch(dismissNotification(notification.id));
        }, notification.duration),
      );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [dispatch, notifications]);

  return (
    <div aria-live="polite" aria-relevant="additions" className="snackbar-host">
      {notifications.map((notification) => {
        const Icon = iconByType[notification.type] ?? Sparkles;
        return (
          <article
            className={`snackbar snackbar--${notification.type}`}
            key={notification.id}
            role={notification.type === "error" ? "alert" : "status"}
          >
            <span className="snackbar__icon">
              <Icon size={19} />
            </span>
            <div className="snackbar__content">
              <div className="snackbar__heading">
                <strong>{notification.title}</strong>
                <button
                  aria-label="Dismiss notification"
                  type="button"
                  onClick={() => dispatch(dismissNotification(notification.id))}
                >
                  <X size={15} />
                </button>
              </div>
              {notification.message && <p>{notification.message}</p>}
              {notification.details?.length > 0 && (
                <ul>
                  {notification.details.slice(0, 3).map((detail) => (
                    <li key={`${notification.id}-${detail}`}>{detail}</li>
                  ))}
                </ul>
              )}
              {notification.requestId && (
                <small className="snackbar__request">Request ID: {notification.requestId}</small>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
