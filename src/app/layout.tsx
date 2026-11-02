import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MANDATE - The Financial Control & Security Layer for AI Agents",
  description: "Independent financial authorisation, policy enforcement, and PayPal transaction security for autonomous AI agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[#F5F8FC] text-[#142B4A] antialiased">
        {children}
      </body>
    </html>
  );
}
