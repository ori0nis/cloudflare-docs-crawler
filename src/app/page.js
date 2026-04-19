import AskGroq from "@/components/AskGroq";
import IngestForm from "@/components/IngestForm";

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen items-center justify-center p-6 gap-16 max-w-3xl mx-auto selection:bg-blue-500/30">
      <header className="flex flex-col items-center text-center space-y-4">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-none">
          <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Crawl</span>
          <span className="bg-linear-to-tr from-orange-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
            dflare
          </span>
          <span className="text-white">.AI</span>
        </h1>
        <div className="h-1 w-12 bg-orange-500 rounded-full" />
        <p className="text-slate-500 text-xs font-medium tracking-[0.15em] sm:tracking-[0.3em] uppercase">Advanced Vector Ingestion & RAG</p>
      </header>

      <div className="w-full grid grid-cols-1 gap-12">
        <section className="space-y-6">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Step 01. Ingest Knowledge</h2>
          <IngestForm />
        </section>

        <div className="h-px w-full bg-linear-to-r from-transparent via-slate-800 to-transparent" />

        <section className="space-y-6">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
            Step 02. Ask Groq
          </h2>
          <AskGroq />
        </section>
      </div>
    </main>
  );
}
