import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import MotionProvider from "@/components/providers/MotionProvider";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GTB Development — Player Development Platform",
    template: "%s | GTB Development",
  },
  description: "Growth. Train. Build. — One Ecosystem. Limitless Development.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={`${montserrat.variable} h-full`}>
      <body className="min-h-full bg-[#0A0A0A] text-white antialiased">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
