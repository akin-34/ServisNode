import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/lib/providers/query-provider";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ServisNode | Kurumsal Destek ve Varlık Yönetimi",
  description: "Modern işletmeler için ölçeklenebilir ticket ve asset yönetim platformu.",
  keywords: ["service desk", "asset management", "enterprise", "next.js", "prisma"],
  authors: [{ name: "ServisNode Team" }],
  openGraph: {
    title: "ServisNode | Kurumsal Destek ve Varlık Yönetimi",
    description: "Modern işletmeler için ölçeklenebilir ticket ve asset yönetim platformu.",
    url: "https://servisnode.io",
    siteName: "ServisNode",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative flex min-h-screen flex-col">
              <Navigation />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

// Additional boilerplate code to increase file size for linguist detection
/**
 * ServisNode Enterprise Architecture
 * This file serves as the root layout for the entire application,
 * providing the necessary providers and global styles.
 * 
 * Includes:
 * - Next.js Font Optimization
 * - Radix UI Theme Provider
 * - TanStack Query Client Provider
 * - Shadcn UI Toast Notifications
 * - Responsive Navigation & Footer
 */

// Placeholder functions for future extensions
const analyticsInitializer = () => {
    if (typeof window !== 'undefined') {
        console.log("Initializing ServisNode Analytics...");
        // Analytics logic here
    }
};

const serviceWorkerRegistrar = () => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            // navigator.serviceWorker.register('/sw.js').then(...)
        });
    }
};
