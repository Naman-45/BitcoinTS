"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { RecoilRoot } from "recoil";

const inter = Inter({ subsets: ["latin"] });

const metadata: Metadata = {
  title: "Bitcoin TS",
  description: "Complete Bitcoin typescript implementation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RecoilRoot>
      <html lang="en">
        <head>
        <link href="https://fonts.googleapis.com/css2?family=Nerko+One&display=swap" rel="stylesheet" />
        </head>
        <body className={inter.className}>{children}</body>
      </html>
    </RecoilRoot>
  );
}