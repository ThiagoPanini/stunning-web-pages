import type { Metadata } from "next";
import "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Responsible AI · Home",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
