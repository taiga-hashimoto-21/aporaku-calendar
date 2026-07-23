import type { Metadata } from "next";
import { Suspense } from "react";
import { ZoomDocsContent } from "@/components/zoom-docs-content";
import { SERVICE_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Zoom連携 | ${SERVICE_NAME}`,
  description: `${SERVICE_NAME} の Zoom 連携の追加・利用・解除方法`,
};

export default function ZoomDocsPage() {
  return (
    <Suspense fallback={null}>
      <ZoomDocsContent />
    </Suspense>
  );
}
