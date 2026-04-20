"use client";
import { useEffect, useRef, useState } from "react";

export default function IngestForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Consume jobId and ingest into supabase
  const handleConsume = async (jobId) => {
    let finished = false;

    while (!finished) {
      if (!isMounted.current) break;

      setProgress("Checking Cloudflare status, please bear with this humble and free API...");

      const res = await fetch(`api/crawl/${jobId}/results`);
      const data = await res.json();

      if (data.status === "completed") {
        if (isMounted.current) setProgress("Data received and saved!");
        finished = true;
      } else if (data.status === "running") {
        await new Promise((resolve) => setTimeout(resolve, 4000));
        console.log("Polling result: ", data.status);
      } else {
        if (isMounted.current) setProgress(`Error: ${data.error || "Error processing the crawl"}`);
        finished = true;
      }
    }

    if (isMounted.current) setLoading(false);
  };

  // Receive user URL and launch consumption pipeline
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProgress("Starting crawl job...");

    try {
      const response = await fetch("api/crawl", {
        method: "POST",
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (result.alreadyExists) {
        setProgress("This documentation has already been processed. Send your question to Groq!");
        setLoading(false);
        return;
      }

      if (response.ok && result.data) {
        handleConsume(result.data);
      } else {
        setProgress(`Error: ${result.message || "Failed to start"}`);
        setLoading(false);
      }
    } catch (error) {
      console.error(error?.message || "There was an error processing the crawl queue");
      setProgress("Fatal error processing the crawl");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full group">
      <div className="flex flex-col gap-2">
        <label htmlFor="url" className="text-[10px] font-bold text-slate-500 uppercase ml-1">
          Paste a Documentation URL:
        </label>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://docs.example.com"
            className="flex-1 bg-slate-900/40 border border-slate-800 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 outline-none transition-all p-4 rounded-2xl text-slate-200 placeholder:text-slate-700"
            disabled={loading}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer bg-white text-black hover:bg-slate-200 font-bold py-4 px-8 rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-white/5"
          >
            {loading ? "Crawling..." : "Send"}
          </button>
        </div>
      </div>
      {progress && (
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/30 rounded-xl border border-slate-800/50">
          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
          <p className="text-sm text-slate-400 font-medium">{progress}</p>
        </div>
      )}
    </form>
  );
}
