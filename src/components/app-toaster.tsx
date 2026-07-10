"use client";

import { Toaster } from "sonner";

const TOAST_WIDTH = "300px";

export function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      className="app-toaster"
      swipeDirections={["right"]}
      style={
        {
          "--width": TOAST_WIDTH,
        } as React.CSSProperties
      }
      toastOptions={{
        className: "app-toast",
        style: {
          width: TOAST_WIDTH,
        },
      }}
    />
  );
}
