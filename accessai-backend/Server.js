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

app.post('/scan', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  console.log('Scanning:', url);

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const axeSource = fs.readFileSync(
      require.resolve('axe-core/axe.min.js'),
      'utf8'
    );
    await page.evaluate(axeSource);

    const results = await page.evaluate(() => {
      return new Promise((resolve) => {
        axe.run(document, {}, (err, results) => {
          resolve(results);
        });
      });
    });

    await browser.close();

    res.json({ violations: results.violations });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ error: 'Failed to scan website' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});