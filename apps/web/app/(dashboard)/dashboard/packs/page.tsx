"use client";

import dynamic from "next/dynamic";

const PacksContent = dynamic(() => import("./PacksContent"), { ssr: false });

export default function PacksPage() {
  return <PacksContent />;
}
