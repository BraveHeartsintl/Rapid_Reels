import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Suspense } from "react";
import { FirebaseProvider } from "@/components/FirebaseProvider";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    default: "Rapid Reels",
    template: "%s | Rapid Reels",
  },
  description:
    "Book verified event videographers and get social-ready reels fast.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <Suspense fallback={null}>
          <FirebaseProvider>{children}</FirebaseProvider>
        </Suspense>
      </body>
    </html>
  );
}
