import type { Metadata } from "next";
import "./globals.css";
import localFont from 'next/font/local'
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { SessionProvider } from "next-auth/react";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/assets/favicon.ico" type="image/x-icon" />
      </head>
      <body className={`${phantomSans.className} antialiased min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900`}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* Header (logo, theme toggle, etc.) - shown on all pages */}
            <Header />

            {/* Main Content */}
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>

            {/* Decorative Background Elements */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
            </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
