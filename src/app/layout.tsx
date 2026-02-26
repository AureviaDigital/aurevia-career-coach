import type { Metadata } from "next";
import { Inter } from "next/font/google";
import PostHogInit from "@/components/PostHogInit";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aurevia Career Coach - AI Resume Optimization",
  description:
    "Tailor your resume to any job post in minutes. Paste your resume and the job description to get a cleaner, more relevant version instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <html lang="en" suppressHydrationWarning>
    <body className={inter.className} suppressHydrationWarning>
      <PostHogInit />
      {children}
    </body>
  </html>
);
}
