import AskGroq from "@/components/AskGroq";
import IngestForm from "@/components/IngestForm";

export default function HomePage() {
  return (
    <main>
      <h1>Documentation Crawler</h1>

      <section>
        <h2>Crawl a documentation page</h2>
        <IngestForm />
      </section>

      <section>
        <h2>Ask Groq</h2>
        <AskGroq />
      </section>
    </main>
  );
}
