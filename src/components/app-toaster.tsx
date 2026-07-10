"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
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
  );
}
