const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const fs = require('fs');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('AccessAI Backend is running!');
});

// Naya scan route
app.post('/scan', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  console.log('Scanning:', url);

  try {
    // Step 1: Invisible browser kholo
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Step 2: Target website load karo
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Step 3: axe-core ka code us page mein inject karo
    const axeSource = fs.readFileSync(
      require.resolve('axe-core/axe.min.js'),
      'utf8'
    );
    await page.evaluate(axeSource);

    // Step 4: axe scan chalao us page ke andar
    const results = await page.evaluate(() => {
      return new Promise((resolve) => {
        axe.run(document, {}, (err, results) => {
          resolve(results);
        });
      });
    });

    // Step 5: Browser band karo (memory bachane ke liye)
    await browser.close();

    // Step 6: Result frontend ko bhejo
    res.json({ violations: results.violations });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ error: 'Failed to scan website' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});