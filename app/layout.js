import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "Solo Raid Parses",
  description: "NIKKE solo raid team and unit usage",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
