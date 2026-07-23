import type { Metadata } from "next";
import { Suspense } from "react";
import { ZoomTestPlanContent } from "@/components/zoom-test-plan-content";
import { SERVICE_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Zoom Integration Test Plan | ${SERVICE_NAME}`,
  description: `Zoom Marketplace reviewers test plan (JA/EN) — authorization, scopes, and booking Zoom meeting creation for ${SERVICE_NAME}`,
  robots: { index: false, follow: false },
};

export default function ZoomTestPlanPage() {
  return (
    <Suspense fallback={null}>
      <ZoomTestPlanContent />
    </Suspense>
  );
}
