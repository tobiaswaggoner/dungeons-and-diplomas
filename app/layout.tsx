import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dungeons & Diplomas",
  description: "Educational Dungeon Crawler - Learn through gaming",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
