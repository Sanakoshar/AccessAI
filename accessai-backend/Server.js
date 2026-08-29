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

  console.log("Scanning:", url);
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-zygote",
      ],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    const axeSource = fs.readFileSync(
      require.resolve("axe-core/axe.min.js"),
      "utf8"
    );
    await page.evaluate(axeSource);

    const results = await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        axe.run(document, {}, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
    });

    console.log("Scan completed. Violations:", results.violations.length);
    return res.json({ violations: results.violations || [] });
  } catch (error) {
    console.error("Scan error:", error);
    return res.status(500).json({ error: error.message || "Failed to scan website", violations: [] });
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Browser close error:", closeError);
      }
    }
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});