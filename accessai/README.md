
# AccessAI — Web Accessibility Auditor

A full-stack web application that scans any webpage for WCAG (Web Content Accessibility Guidelines) violations and provides actionable, code-level fix suggestions — making accessibility testing more accessible to individual developers and small teams.

## Problem Statement

Most websites fail basic WCAG compliance, and accessibility testing tools are often complex or expensive. AccessAI bridges this gap by providing a simple, visual tool that anyone can use to audit their website for accessibility issues.

## Features

- Scan any live website by entering its URL
- Detects real WCAG violations using axe-core
- Displays issues with severity levels (Critical, Serious, Moderate, Minor)
- Shows affected element counts for each violation
- Provides direct links to detailed fix guidance for every issue

## Tech Stack

**Frontend:**

- React.js
- axe-core (client-side accessibility checks)

**Backend:**

- Node.js
- Express.js
- Puppeteer (headless browser automation)
- axe-core (server-side page scanning)

## How It Works

1. User enters a website URL in the React frontend
2. The frontend sends the URL to the Express backend via a POST request
3. The backend launches a headless browser using Puppeteer and navigates to the target URL
4. axe-core is injected into the loaded page to run an accessibility scan
5. Scan results are sent back to the frontend and displayed as categorized violation cards

## Project Structure


AccessAI/
├── accessai/ # React frontend
└── accessai-backend/ # Node/Express backend with Puppeteer

## Setup Instructions

### Prerequisites

- Node.js installed on your system

### Installation

1. Clone the repository

git clone https://github.com/Sanakoshar/AccessAI.git

2. Install frontend dependencies

cd accessai
npm install

3. Install backend dependencies

   

cd ../accessai-backend
npm install

### Running the Project

You need to run both servers simultaneously in separate terminals.

**Terminal 1 — Start the backend:**

cd accessai-backend
node server.js

**Terminal 2 — Start the frontend:**

cd accessai
npm run dev

The app will be available at  http://localhost:5173/




## Future Improvements



- Deploy the application for public access
- Add scan history and comparison between scans
- AI-powered fix suggestions using an LLM
- PDF report export for scan results

## Author

**Sana Koshar**
Final-year B.Tech CSE student
