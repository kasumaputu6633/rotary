import type { Metadata } from "next";
import localFont from "next/font/local";
import DropdownOverlay from "./_components/DropdownOverlay";
import FloatingChat from "./_features/chat/_components/FloatingChat";
import { getSessionUserId } from "@/lib/auth";
import "./globals.css";

const openSauce = localFont({
  variable: "--font-open-sauce",
  display: "swap",
  src: [
    { path: "./fonts/OpenSauceOne-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/OpenSauceOne-Italic.ttf", weight: "400", style: "italic" },
    { path: "./fonts/OpenSauceOne-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/OpenSauceOne-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/OpenSauceOne-Bold.ttf", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "Rotary | E-Commerce Barang Bekas & Penampung Limbah",
  description:
    "Marketplace barang bekas untuk jual, beli, dan donasi, sekaligus direktori lokasi penampung limbah.",
  applicationName: "Rotary",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUserId = await getSessionUserId();

  return (
    <html
      lang="id"
      className={`${openSauce.variable} h-full antialiased`}
    >
      <body id="page-top" className="min-h-full flex flex-col">
        <DropdownOverlay />
        {children}
        <FloatingChat currentUserId={currentUserId} />
      {/* impeccable-live-start */}
<script src="http://localhost:8400/live.js"></script>
{/* impeccable-live-end */}
</body>
    </html>
  );
}
