import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { store } from "./store/index.js";
import AppRoutes from "./routes/AppRoutes.jsx";
import SessionBootstrap from "./components/SessionBootstrap.jsx";
import { ThemeProvider, useTheme } from "./theme/ThemeContext.jsx";
import { SchoolBrandingProvider } from "./context/SchoolBrandingContext.jsx";
import { ErrorBoundary, ServerMaintenance } from "./components/index.js";
import "./index.css";

const BACKEND_URL = "http://localhost:5000";

const AppBootstrap = () => {
  const { theme } = useTheme();
  const [isServerDown, setIsServerDown] = React.useState(false);
  const [serverErrorInfo, setServerErrorInfo] = React.useState(null);

  React.useEffect(() => {
    const handleOffline = (e) => {
      setIsServerDown(true);
      if (e?.detail) setServerErrorInfo(e.detail);
    };

    window.addEventListener("server:offline", handleOffline);
    return () => window.removeEventListener("server:offline", handleOffline);
  }, []);

  const handleRetry = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/health`, { cache: "no-store" }).catch(
        async () => fetch(`${BACKEND_URL}/api/v1/company/profile`, { cache: "no-store" })
      );
      if (res && res.status >= 200 && res.status < 400) {
        setIsServerDown(false);
        setServerErrorInfo(null);
        window.location.reload();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <BrowserRouter>
      {/* ── Server Maintenance Fullscreen Overlay ─── */}
      {isServerDown && (
        <ServerMaintenance errorInfo={serverErrorInfo} onRetry={handleRetry} />
      )}

      <ErrorBoundary>
        <SessionBootstrap>
          <AppRoutes />
          <ToastContainer position="top-right" theme={theme} autoClose={4000} />
        </SessionBootstrap>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider>
          <SchoolBrandingProvider>
            <AppBootstrap />
          </SchoolBrandingProvider>
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);
