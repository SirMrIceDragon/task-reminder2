import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ServiceWorkerRegister } from "@/components/SwRegister";
import { LoadingScreen } from "@/components/LoadingScreen";

const vazirmatn = localFont({
  src: [
    {
      path: "../../public/fonts/Vazirmatn-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Vazirmatn-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Vazirmatn-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Vazirmatn-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "یادآور تسک‌ها | Task Reminder",
  description: "اپلیکیشن مدیریت تسک‌ها با نوتیفیکیشن قابل شخصی‌سازی - تقویم جلالی، صداهای مختلف، تکرار روزانه، تایمر و پومودورو",
  manifest: "/manifest.json",
  applicationName: "یادآور تسک‌ها",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "یادآور",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/icons/icon-192.png"],
    other: [
      {
        rel: "mask-icon",
        url: "/icons/icon-512-maskable.png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${vazirmatn.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <LoadingScreen />
          {children}
          <Toaster />
          <SonnerToaster position="top-center" dir="rtl" />
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
