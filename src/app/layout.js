import "./globals.css";
import {Roboto} from "next/font/google"

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata = {
  title: "Cloudflare Documentation Crawler",
  description: "Cloudflare documentation crawler + Supabase vector storage + Groq RAG",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={roboto.variable}>
      <body suppressHydrationWarning className="antialiased">{children}</body>
    </html>
  );
}
