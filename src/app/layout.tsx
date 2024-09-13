import type { Metadata } from "next";

import "./globals.css";



export const metadata: Metadata = {
  title: "help i need a font dot com",
  description: "helpineedafont.com helps you find the perfect font for your project with a tinder based selection interface.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Nanum Gothic"></link>
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
