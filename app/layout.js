import "./globals.css";

export const metadata = {
  title: "Solo Raid Parses",
  description: "NIKKE solo raid team and unit usage",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
