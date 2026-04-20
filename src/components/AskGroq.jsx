"use client";
import { useEffect, useState } from "react";

export default function AskGroq() {
  const [userQuery, setUserQuery] = useState("");
  const [documentation, setDocumentation] = useState("");
  const [availableDatasets, setAvailableDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  // Fetch datasets to show as select options
  const fetchDatasets = async () => {
    const response = await fetch("api/datasets");
    const data = await response.json();

    if (data.datasets && data.datasets.length > 0) {
      const domains = [".com", ".io", ".dev", ".net", ".org"];

      const formattedDatasets = data.datasets.map((dataset) => {
        let cleanName = dataset.url_base;

        for (const domain of domains) {
          if (cleanName.includes(domain)) {
            cleanName = cleanName.replace(domain, "");
            break;
          }
        }

        return {
          original: dataset.url_base,
          display: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
        };
      });

      setAvailableDatasets(formattedDatasets);
      setDocumentation(formattedDatasets[0].original);
    }
  };

  useEffect(() => {
    fetchDatasets();
    const handleRefresh = () => fetchDatasets();
    window.addEventListener("ingestion-complete", handleRefresh);

    return () => window.removeEventListener("ingestion-complete", handleRefresh);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!documentation) {
      alert("Please select a documentation first");
    }

    setLoading(true);
    setProgress("");

    try {
      const response = await fetch("api/ask", {
        method: "POST",
        body: JSON.stringify({ userQuery, dataset: documentation }),
      });

      const contentType = response.headers.get("content-type");

      if (!response.ok || (contentType && contentType.includes("application/json"))) {
        const result = await response.json();
        setProgress(`Error: ${result.message} || "Something went wrong"`);
        setLoading(false);
        return;
      }

      // If there are no errors, begin stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        const chunkValue = decoder.decode(value);
        const lines = chunkValue.split("\n");

        for (const line of lines) {
          const cleanLine = line.replace(/^data: /, "").trim();

          if (!cleanLine || cleanLine === "[DONE]") continue;

          try {
            const parsed = JSON.parse(cleanLine);
            const content = parsed.choices[0].delta?.content;

            if (content) setProgress((prev) => prev + content);
          } catch (error) {
            // Incomplete JSON fragments get ignored
          }
        }
      }

      setLoading(false);
    } catch (error) {
      console.error(error?.message || "There was an error processing your Groq query");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2 col-span-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Context</label>
          <select
            value={documentation}
            onChange={(e) => setDocumentation(e.target.value)}
            className="appearance-none bg-slate-900/40 border border-slate-800 p-4 rounded-2xl text-slate-300 focus:border-blue-500/50 outline-none transition-all cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] 
             bg-size-[1.25rem_1.25rem] bg-position-[right_1rem_center] bg-no-repeat"
            disabled={loading}
          >
            {availableDatasets.map((d) => (
              <option key={d.original} value={d.original}>
                {d.display}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Your Question</label>
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Ask anything about the docs..."
            className="bg-slate-900/40 border border-slate-800 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all p-4 rounded-2xl text-slate-200"
            disabled={loading}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="cursor-pointer bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20"
      >
        {loading ? "Consulting Groq..." : "Execute RAG Query"}
      </button>

      {progress && (
        <div className="w-full p-6 rounded-3xl bg-slate-900/20 border border-slate-800/50 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-4">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Intelligence Output</span>
          </div>
          <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-300 antialiased italic">
            {progress}
          </div>
        </div>
      )}
    </form>
  );
}
