import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SnackbarHost } from "./components/common/SnackbarHost.jsx";
import { hydrateCurrentUser, refreshSession } from "./features/auth/store/authSlice.js";
import { AppRoutes } from "./routes/AppRoutes.jsx";

export default function App() {
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.auth.accessToken);
  const refreshToken = useSelector((state) => state.auth.refreshToken);
  const hasRefreshed = useRef(false);

  useEffect(() => {
    if (refreshToken && !hasRefreshed.current) {
      hasRefreshed.current = true;
      dispatch(refreshSession());
    }
  }, [dispatch]);

  useEffect(() => {
    if (accessToken) dispatch(hydrateCurrentUser());
  }, [accessToken, dispatch]);

  return (
    <>
      <AppRoutes />
      <SnackbarHost />
    </>
  );
}
