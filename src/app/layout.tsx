import type { Metadata } from "next";
import "../styles/globals.scss";
import { ToastProvider } from "@/components/ToastContainer";

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
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
