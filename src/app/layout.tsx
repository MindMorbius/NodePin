import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "NodePin | 订阅聚合",
  description: "订阅上传、聚合、分发站",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <Navbar />
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
