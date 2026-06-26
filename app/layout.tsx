import type { Metadata } from "next";
import { Poppins, Roboto_Serif } from "next/font/google";
import DropdownOverlay from "./_components/DropdownOverlay";
import FloatingChat from "./_features/chat/_components/FloatingChat";
import { getSessionUserId } from "@/lib/auth";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const robotoSerif = Roboto_Serif({
  variable: "--font-roboto-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
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
      className={`${poppins.variable} ${robotoSerif.variable} h-full antialiased`}
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
