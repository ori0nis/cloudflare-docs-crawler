"use client";
import { useState } from "react";

export default function IngestForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  const handleConsume = async (jobId) => {
    let finished = false;

    while (!finished) {
      setProgress("Cloudflare work in progress... checking status, please bear with this humble and free API...");

      const res = await fetch(`api/crawl/${jobId}/results`);
      const data = await res.json();

      if (data.status === "completed") {
        setProgress("Data received! Saving in database...");
        finished(true);
      } else if (data.status === "running") {
        await new Promise((resolve) => setTimeout(resolve, 4000));
      } else {
        setProgress(`Error: ${data.error || "Crawl failed"}`);
        finished = true;
      }
    }

    setLoading(false);
  };

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
        setProgress("This documentation has already been processed");
        setLoading(false);
        return;
      }

      if (result.status === 200 && result.data) {
        handleConsume(result.data);
      } else {
        alert(result.message || "Couldn't process your crawl queue");
        setLoading(false);
      }
    } catch (error) {
      console.error(error?.message || "There was an error processing the crawl queue");
    } finally {
      setLoading(false);
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
