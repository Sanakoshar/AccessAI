import { useState } from "react";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [violations, setViolations] = useState([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [error, setError] = useState("");

  async function handleScan() {
    if (!url.trim()) {
      setError("Please enter a website URL.");
      return;
    }

    setIsScanning(true);
    setHasScanned(false);
    setViolations([]);
    setError("");

    try {
      const response = await fetch("http://localhost:3001/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      setViolations(
        Array.isArray(data.violations) ? data.violations : []
      );

      setHasScanned(true);
    } catch (error) {
      console.error("Error scanning:", error);
      setError(
        "Unable to scan the website. Make sure your backend is running on port 3001."
      );
      setHasScanned(false);
    } finally {
      setIsScanning(false);
    }
  }

  function getImpactColor(impact) {
    switch (impact) {
      case "critical":
        return "#dc2626";

      case "serious":
        return "#ea580c";

      case "moderate":
        return "#ca8a04";

      case "minor":
        return "#65a30d";

      default:
        return "#6b7280";
    }
  }

  return (
    <div className="app-container">

      {/* Header */}
      <div className="app-header">
        <h1 className="app-logo">AccessAI</h1>

        <p className="app-tagline">
          Web Accessibility Auditor — scan any website for WCAG issues
        </p>
      </div>

      {/* Search */}
      <div className="search-card">

        <input
          type="text"
          className="url-input"
          placeholder="Enter website URL (e.g. https://example.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleScan();
            }
          }}
        />

        <button
          className="scan-button"
          onClick={handleScan}
          disabled={isScanning}
        >
          {isScanning ? "Scanning..." : "Scan"}
        </button>

      </div>

      {/* Error */}
      {error && (
        <div className="error-box">
          ⚠️ {error}
        </div>
      )}

      {/* Loading */}
      {isScanning && (
        <div className="loading-box">
          <div className="spinner"></div>

          <span>
            Scanning your website, please wait...
          </span>
        </div>
      )}

      {/* Empty State */}
      {!hasScanned && !isScanning && !error && (
        <div className="empty-state">
          <div className="empty-state-icon">
            🔍
          </div>

          <p>
            Enter a URL above to check its accessibility
          </p>
        </div>
      )}

      {/* Results */}
      {hasScanned && !isScanning && (
        <div className="results-section">

          <h2 className="results-heading">
            {violations.length === 0
              ? "✅ No accessibility issues found!"
              : `Found ${violations.length} issue${
                  violations.length > 1 ? "s" : ""
                }`}
          </h2>

          {violations.map((violation, index) => (

            <div
              key={violation.id || index}
              className="violation-card"
              style={{
                borderLeftColor: getImpactColor(
                  violation.impact
                ),
              }}
            >

              {/* Violation Header */}
              <div className="violation-header">

                <h3 className="violation-title">
                  {violation.help || "Accessibility issue"}
                </h3>

                <span
                  className="severity-badge"
                  style={{
                    backgroundColor: getImpactColor(
                      violation.impact
                    ),
                  }}
                >
                  {violation.impact || "unknown"}
                </span>

              </div>

              {/* Description */}
              <p className="violation-description">
                {violation.description ||
                  "No description available."}
              </p>

              {/* Affected Elements */}
              <p className="violation-meta">
                Affected elements:{" "}
                <strong>
                  {Array.isArray(violation.nodes)
                    ? violation.nodes.length
                    : 0}
                </strong>
              </p>

              {/* Fix Link */}
              {violation.helpUrl && (
                <a
                  href={violation.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="violation-link"
                >
                  Learn how to fix this →
                </a>
              )}

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default App;