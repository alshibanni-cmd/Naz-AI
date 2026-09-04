// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { SettingsProvider } from '@/context/SettingsContext';

export const metadata: Metadata = {
  title: "Naz AI",
  description: "شريكك الذكي للعمل",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}