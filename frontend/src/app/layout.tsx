import type { Metadata } from "next";
import "./globals.css";
import localFont from 'next/font/local'
import { Plane } from "lucide-react";
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Jet Fund",
  description: "Jet Fund - Earn flight stipends for travelling to hackathons by making projects",
};

const phantomSans = localFont({
  src: './fonts/Regular.woff2',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/favicon.ico" type="image/x-icon" />
      </head>
      <body
          className={`${phantomSans.className} antialiased`}
        >
          <div className="flex items-center pt-8 px-6">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Plane size={32} className="mr-3" />
              <h1 className="text-2xl font-bold m-0">Jet Fund</h1>
            </Link>
          </div>
          {children}
      </body>
    </html>
  );
}
