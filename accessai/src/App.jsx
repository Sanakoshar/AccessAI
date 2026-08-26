import { useState } from 'react';
//import axe from 'axe-core';

function App() {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [violations, setViolations] = useState([]);
  const [hasScanned, setHasScanned] = useState(false);
   
  async function handleScan() {
  console.log('Scanning URL:', url);

  setIsScanning(true);
  setHasScanned(false);
  setViolations([]);

  try {
    const response = await fetch('http://localhost:3001/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: url }),
    });

    const data = await response.json();

    console.log('Violations found:', data.violations);
    setViolations(data.violations);
  } catch (error) {
    console.error('Error scanning:', error);
    alert('Something went wrong. Check console for details.');
  } finally {
    setIsScanning(false);
    setHasScanned(true);
  }
}
  
  function getImpactColor(impact) {
    switch (impact) {
      case 'critical':
        return '#dc2626';

      case 'serious':
        return '#ea580c';

      case 'moderate':
        return '#ca8a04';

      case 'minor':
        return '#65a30d';

      default:
        return '#6b7280';
    }
  }

  return (
    <div
      style={{
        maxWidth: '700px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'sans-serif',
      }}
    >
      <h1>AccessAI</h1>

      <p>Web Accessibility Auditor</p>

      <input
        type="text"
        placeholder="Enter website URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{
          padding: '8px',
          width: '300px',
          marginRight: '10px',
        }}
      />

      <button
        onClick={handleScan}
        style={{
          padding: '8px 16px',
          cursor: 'pointer',
        }}
      >
        Scan
      </button>

      {/* Scanning message */}
      {isScanning && (
        <p>Scanning your website... please wait</p>
      )}

      {/* Results Section */}
      {hasScanned && !isScanning && (
        <div style={{ marginTop: '30px' }}>
          <h2>
            {violations.length === 0
              ? '✅ No accessibility issues found!'
              : `Found ${violations.length} issue${
                  violations.length > 1 ? 's' : ''
                }`}
          </h2>

          {violations.map((violation) => (
            <div
              key={violation.id}
              style={{
                border: '1px solid #e5e7eb',
                borderLeft: `5px solid ${getImpactColor(
                  violation.impact
                )}`,
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '15px',
                backgroundColor: '#f9fafb',
              }}
            >
              {/* Heading + Severity */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <h3 style={{ margin: 0 }}>
                  {violation.help}
                </h3>

                <span
                  style={{
                    backgroundColor: getImpactColor(
                      violation.impact
                    ),
                    color: 'white',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                  }}
                >
                  {violation.impact || 'unknown'}
                </span>
              </div>

              {/* Description */}
              <p
                style={{
                  color: '#374151',
                  marginTop: '8px',
                }}
              >
                {violation.description}
              </p>

              {/* Affected elements */}
              <p
                style={{
                  fontSize: '14px',
                  color: '#6b7280',
                }}
              >
                Affected elements:{' '}
                <strong>{violation.nodes.length}</strong>
              </p>

              {/* Learn More Link */}
              <a
                href={violation.helpUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '14px',
                }}
              >
                Learn how to fix this →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;