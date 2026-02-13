import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aurevia Career Coach - AI-Powered Career Development",
  description:
    "Your AI-powered career development companion. Get personalized guidance, resume optimization, and interview preparation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <html lang="en" suppressHydrationWarning>
    <body className={inter.className} suppressHydrationWarning>
      {children}
    </body>
  </html>
);
}
