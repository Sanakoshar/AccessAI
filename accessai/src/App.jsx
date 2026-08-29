import { useState } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [violations, setViolations] = useState([]);
  const [hasScanned, setHasScanned] = useState(false);

  async function handleScan() {
    if (!url) return;

    setIsScanning(true);
    setHasScanned(false);
    setViolations([]);

    try {
      const response = await fetch('https://accessai-backend-0u1j.onrender.com/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url }),
      });

      const data = await response.json();
      setViolations(data.violations);
    } catch (error) {
      console.error('Error scanning:', error);
      alert('Something went wrong. Check console for details.');
    } finally {
      setIsScanning(false);
      setHasScanned(true);
    }
  }

  return (
    <div className="app-container">
      {/* Hero Section */}
      <div className="hero">
        <span className="hero-badge">↻  Free & Instant WCAG Scanning</span>
        <h1 className="app-logo">AccessAI</h1>
        <p className="app-tagline">
          Scan any website in seconds and uncover accessibility issues 
          with clear, actionable fixes for every problem found...
        </p>

        <div className="search-card">
          <input
            type="text"
            className="url-input"
            placeholder="Enter website URL (e.g. https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
          />
          <button
            className="scan-button"
            onClick={handleScan}
            disabled={isScanning}
          >
            {isScanning ? 'Scanning...' : 'Scan Now'}
          </button>
        </div>
      </div>

      {/* Features Section - only show before scanning */}
      {!hasScanned && !isScanning && (
        <div className="features-section">
          <div className="feature-card">
            <div className="feature-icon">↻</div>
            <h3 className="feature-title">Instant Scanning</h3>
            <p className="feature-desc">
              Get accessibility results in seconds using industry-standard
              axe-core rules.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">☞</div>
            <h3 className="feature-title">Severity Insights</h3>
            <p className="feature-desc">
              Issues are ranked by severity so you know what to fix first.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✄</div>
            <h3 className="feature-title">Actionable Fixes</h3>
            <p className="feature-desc">
              Every issue links directly to a guide on how to resolve it.
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {isScanning && (
        <div className="loading-box">
          <div className="spinner"></div>
          <span>Scanning your website, please wait...</span>
        </div>
      )}

      {/* Empty State */}
      {!hasScanned && !isScanning && (
        <div className="empty-state">
          <div className="empty-state-icon">⛶ ⌕</div>
          <p>Enter a URL above to check its accessibility</p>
        </div>
      )}

      {/* Results */}
      {hasScanned && !isScanning && (
        <div className="results-section">
          <h2 className="results-heading">
            {violations.length === 0
              ? '✅ No accessibility issues found!'
              : `Found ${violations.length} issue${violations.length > 1 ? 's' : ''}`}
          </h2>

          {violations.map((violation) => (
            <div key={violation.id} className="violation-card">
              <div className="violation-header">
                <h3 className="violation-title">{violation.help}</h3>
                <span className="severity-badge">
                  {violation.impact || 'unknown'}
                </span>
              </div>

              <p className="violation-description">{violation.description}</p>

              <p className="violation-meta">
                Affected elements: <strong>{violation.nodes.length}</strong>
              </p>

              {/* ✅ Correct anchor tag */}
              <a
                href={violation.helpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="violation-link"
              >
                Learn how to fix this →
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer">
        Built by <a href="https://github.com/Sanakoshar" target="_blank" rel="noopener noreferrer">Sana Koshar</a> · Powered by React, Node.js & axe-core
      </footer>
    </div>
  );
}

export default App;
