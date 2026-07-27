import type { Metadata, Viewport } from "next";
import { brand } from "@funberry/config";
import "./globals.css";
import { ClientLayout } from "./ClientLayout";


export const metadata: Metadata = {
  title: `${brand.name} - Fun Learning Games for Kids`,
  description: brand.tagline,
};

// Correct scaling on phones + honor notch/safe areas (viewportFit: cover).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#7c3aed",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-sky-100/80 via-fuchsia-50/40 to-amber-50/50">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
