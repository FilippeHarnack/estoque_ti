"use client";

import dynamic from "next/dynamic";

const ITInventoryDashboard = dynamic(
  () => import("@/components/ITInventoryDashboard"),
  { ssr: false }
);

export default function Home() {
  return <ITInventoryDashboard />;
}