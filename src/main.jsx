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
import "./index.css";

const AppBootstrap = () => {
  const { theme } = useTheme();

  return (
    <BrowserRouter>
      <SessionBootstrap>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          theme={theme}
          autoClose={4000}
        />
      </SessionBootstrap>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <SchoolBrandingProvider>
          <AppBootstrap />
        </SchoolBrandingProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
