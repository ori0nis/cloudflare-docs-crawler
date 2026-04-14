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

      if (data.datasets) {
        setAvailableDatasets(data.datasets);

        if (data.datasets.length > 0) setDocumentation(data.datasets[0].url_base);
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

      const result = await response.json();

      if (result.status === 400) {
        setProgress("Groq couldn't answer your question: ", result.message);
        setLoading(false);
        return;
      }

      if (result.data && result.status === 200) {
        setProgress(result.data);
        setLoading(false);
      }
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
            <option key={dataset.url_base} value={dataset.url_base}>
              {dataset.url_base}
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

      {progress && <p>{progress}</p>}
    </form>
  );
}
