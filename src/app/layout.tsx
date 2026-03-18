import type { Metadata } from "next";
import "../styles/globals.scss";
import { ToastProvider } from "@/components/ToastContainer";
import SkipLink from "@/components/shared/SkipLink";

export const metadata: Metadata = {
  title: "HOMEY",
  description: "Minimalist app for couples",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>
        <SkipLink />
        <ToastProvider>
          <main id="main-content">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
