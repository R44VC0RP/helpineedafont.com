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
      <head>
        <script defer src="https://analytics.raavai.com/script.js" data-website-id="7acbcbcc-e84c-4995-8585-3e3d81937603"></script>
      </head>
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
