import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Upwork Expert Test",
  description: "A demo Upwork-style expert assessment portal by Zubair-Hussain.",
  icons: {
    icon: "/assets/upwork-logo.svg",
    shortcut: "/assets/upwork-logo.svg",
    apple: "/assets/upwork-logo.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
