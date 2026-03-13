import { Mulish } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

import { QueryProvider } from "@/components/providers/query";
import { Toaster } from "@/components/ui/sonner";

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HT Recruitment",
  description:
    "HT Recruitment is a platform that helps the HT People & Process find the best candidates for their jobs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${mulish.variable} antialiased`}>
        <QueryProvider>
          {children}
          <Toaster position="top-right" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
