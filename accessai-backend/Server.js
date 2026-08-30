const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AccessAI Backend is running!");
});

app.post("/scan", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required", violations: [] });
  }

  let browser;
  try {
    console.log("Starting scan for:", url);
    
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process", // Highly recommended for Render's limited RAM
        "--no-zygote",
      ],
    });

    const page = await browser.newPage();
    
    // Set a reasonable timeout
    await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });

    // Inject axe-core
    const axePath = require.resolve("axe-core/axe.min.js");
    const axeSource = fs.readFileSync(axePath, "utf8");
    await page.evaluate(axeSource);

    // Run accessibility tests
    const results = await page.evaluate(async () => {
      return await window.axe.run();
    });

    console.log(`Scan finished. Found ${results.violations.length} violations.`);
    res.json({ violations: results.violations });

  } catch (error) {
    console.error("Puppeteer Error:", error.message);
    res.status(500).json({ 
      error: "Failed to scan website. Make sure the URL is correct and public.", 
      violations: [] 
    });
  } finally {
    if (browser) {
      await browser.close();
      console.log("Browser closed.");
    }
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});