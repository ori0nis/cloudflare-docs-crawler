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

      setProgress("Cloudflare work in progress... checking status, please bear with this humble and free API...");

      const res = await fetch(`api/crawl/${jobId}/results`);
      const data = await res.json();

      if (data.status === "completed") {
        if (isMounted.current) setProgress("Data received and saved!");
        finished = true;
      } else if (data.status === "running") {
        await new Promise((resolve) => setTimeout(resolve, 4000));
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
    <div>
      <form onSubmit={handleSubmit} className="">
        <label htmlFor="url">Paste a documentation URL to crawl: </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://docs.example.com"
          className=""
          disabled={loading}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Processing" : "Start crawl"}
        </button>
      </form>

      {progress && <p>{progress}</p>}
    </div>
  );
}
