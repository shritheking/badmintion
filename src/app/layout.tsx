import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Badminton Tournament | Compete. Play. Conquer.",
  description: "Register for the biggest upcoming badminton tournament. Compete in singles and doubles categories, win exciting prizes.",
  openGraph: {
    title: "Badminton Tournament | Compete. Play. Conquer.",
    description: "Register for the biggest upcoming badminton tournament. Compete in singles and doubles categories, win exciting prizes.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={cn(inter.className, "antialiased min-h-screen flex flex-col")}>
        {children}
      </body>
    </html>
  );
}
