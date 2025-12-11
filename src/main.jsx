import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { I18nContextProvider, StoreContextProvider } from "./contexts";
import { router } from "./router";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <StoreContextProvider>
      <I18nContextProvider>
        <RouterProvider router={router} />
      </I18nContextProvider>
    </StoreContextProvider>
  </StrictMode>
);
