import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { TripProvider } from "@/lib/trip-context";
import { LanguageProvider } from "@/lib/language-context";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PackTogether",
  description: "Manage group packing for events or travel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <LanguageProvider>
            <TripProvider>
              {children}
              <Toaster position="top-center" />
            </TripProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
