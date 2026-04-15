"use client";
import { useEffect, useState } from "react";

export default function AskGroq() {
  const [userQuery, setUserQuery] = useState("");
  const [documentation, setDocumentation] = useState("");
  const [availableDatasets, setAvailableDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  useEffect(() => {
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

    fetchDatasets();
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
    <form onSubmit={handleSubmit}>
      <label htmlFor="documentation">Select documentation: </label>
      <select value={documentation} onChange={(e) => setDocumentation(e.target.value)} className="" disabled={loading}>
        {availableDatasets.length === 0 ? (
          <option>No documentation available</option>
        ) : (
          availableDatasets.map((dataset) => (
            <option key={dataset.original} value={dataset.original}>
              {dataset.display}
            </option>
          ))
        )}
      </select>

      <label htmlFor="user-query">Ask a question:</label>
      <input
        type="text"
        value={userQuery}
        onChange={(e) => setUserQuery(e.target.value)}
        placeholder="What is Next.js?"
        className=""
        disabled={loading}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Thinking..." : "Ask Groq"}
      </button>

      {progress && <div className="whitespace-pre-wrap">{progress}</div>}
    </form>
  );
}
