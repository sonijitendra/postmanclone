import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import QueryProvider from "../components/shared/QueryProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Postman Clone - Production API Client",
  description: "A production-grade, lightning-fast developer API client, mirroring the exact look and feel of Postman. Built with Next.js and FastAPI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      data-theme="dark"
    >
      <body className="h-full overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
