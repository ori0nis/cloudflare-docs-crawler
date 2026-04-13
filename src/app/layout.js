export const metadata = {
  title: "Cloudflare Documentation Crawler",
  description: "Cloudflare documentation crawler + Supabase vector storage + Groq RAG",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
