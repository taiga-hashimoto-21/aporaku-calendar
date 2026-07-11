import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { AdminAuthProvider } from "./lib/admin-auth";
import { AuthProvider } from "./lib/auth";
import { router } from "./router";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element #root not found");
}

createRoot(rootEl).render(
  <StrictMode>
    <AuthProvider>
      <AdminAuthProvider>
        <RouterProvider router={router} />
        <Toaster
          position="bottom-right"
          className="app-toaster"
          swipeDirections={["right"]}
          toastOptions={{
            className: "app-toast",
            style: {
              width: "auto",
            },
          }}
        />
      </AdminAuthProvider>
    </AuthProvider>
  </StrictMode>
);
