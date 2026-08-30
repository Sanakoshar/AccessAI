const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Health Check Route
app.get("/", (req, res) => {
  res.send("AccessAI Backend is running perfectly!");
});

// Scan Route
app.post("/scan", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required", violations: [] });
  }

  console.log("Processing scan request for:", url);
  let browser;

  try {
    // Puppeteer launch with memory optimizations for Render
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-zygote",
        "--single-process", // Vital for Render's limited RAM
      ],
    });

    const page = await browser.newPage();

    // 1. Page load hone ka wait karein (60s timeout)
    // networkidle2 ensures most scripts/styles are loaded
   await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
await new Promise(resolve => setTimeout(resolve, 2000));
    // 2. Axe-core ko direct path se inject karein
    const axePath = require.resolve("axe-core/axe.min.js");
    await page.addScriptTag({ path: axePath });

    // 3. Accessibility scan run karein
    const results = await page.evaluate(async () => {
      // Ensure axe is defined
      if (!window.axe) {
        throw new Error("Axe-core failed to load on the target page.");
      }
      // Run the scan
      return await window.axe.run();
    });

    console.log(`Scan finished for ${url}. Found ${results.violations.length} issues.`);

    // 4. Result bhejein
    return res.json({ 
      violations: results.violations || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("SCAN ERROR:", error.message);
    return res.status(500).json({ 
      error: "Scanning failed: " + error.message, 
      violations: [] 
    });
  } finally {
    // Sabse zaruri: Browser ko hamesha band karein taaki RAM khali ho jaye
    if (browser) {
      try {
        await browser.close();
        console.log("Browser closed successfully.");
      } catch (err) {
        console.error("Error closing browser:", err);
      }
    }
  }
});

// Server Start
app.listen(PORT, "0.0.0.0", () => {
  console.log(`AccessAI Server is live on port ${PORT}`);
});