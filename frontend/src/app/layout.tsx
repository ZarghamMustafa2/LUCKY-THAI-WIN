import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thai Number Game - Next Gen",
  description: "Cyberpunk Thai Number Betting Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col relative overflow-hidden">
        {/* Main Content */}
        <main className="flex-grow flex flex-col w-full h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
