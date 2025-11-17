"use client";

import dynamic from "next/dynamic";

// Dynamically import PhaserGame to avoid SSR issues
const PhaserGame = dynamic(() => import("@/components/PhaserGame"), {
  ssr: false,
  loading: () => <div>Loading game...</div>,
});

export default function Home() {
  return (
    <main style={{ textAlign: "center", padding: "2rem" }}>
      <PhaserGame />
    </main>
  );
}
