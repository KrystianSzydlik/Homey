import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "../styles/globals.scss";
import { ToastProvider } from "@/components/ToastContainer";
import SkipLink from "@/components/shared/SkipLink";

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HOMEY",
  description: "Minimalist app for couples",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={dmSans.variable}>
      <head>
        <meta name="theme-color" content="#080e1e" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>
        <SkipLink />
        <ToastProvider>
          <div id="main-content">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
