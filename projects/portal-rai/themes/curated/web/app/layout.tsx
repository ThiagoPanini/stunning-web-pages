import type { Metadata } from "next";
import "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Responsible AI · Home · Curated",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body className="bg-night">{children}</body>
    </html>
  );
}
