import PDFDocument from "pdfkit";
import { createWriteStream } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { platformOverviewContent as c } from "../src/content/platformOverview.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, "../public/ContractIQ-Platform-Overview.pdf");

const doc = new PDFDocument({ margin: 50, size: "A4" });
const stream = createWriteStream(outputPath);
doc.pipe(stream);

const green = "#006A4D";
const dark = "#1a1a1a";
const muted = "#555555";

function heading(text: string, size = 22) {
  doc.moveDown(0.8).fillColor(green).fontSize(size).font("Helvetica-Bold").text(text);
  doc.moveDown(0.3);
}

function subheading(text: string) {
  doc.fillColor(dark).fontSize(14).font("Helvetica-Bold").text(text);
  doc.moveDown(0.2);
}

function body(text: string) {
  doc.fillColor(muted).fontSize(11).font("Helvetica").text(text, { lineGap: 4 });
  doc.moveDown(0.4);
}

function bulletList(items: string[]) {
  items.forEach((item) => {
    doc.fillColor(muted).fontSize(11).font("Helvetica").text(`•  ${item}`, { indent: 10, lineGap: 3 });
  });
  doc.moveDown(0.4);
}

function ensureSpace(minHeight = 120) {
  if (doc.y > doc.page.height - minHeight) {
    doc.addPage();
  }
}

// Cover
doc.fillColor(green).fontSize(32).font("Helvetica-Bold").text(c.title, { align: "center" });
doc.moveDown(0.5);
doc.fillColor(dark).fontSize(16).font("Helvetica").text(c.subtitle, { align: "center" });
doc.moveDown(0.3);
doc.fillColor(green).fontSize(14).font("Helvetica-Oblique").text(c.tagline, { align: "center" });
doc.moveDown(2);
doc.fillColor(muted).fontSize(10).font("Helvetica").text(
  "Platform overview — pre-sign-in tabs content",
  { align: "center" }
);

doc.addPage();

// Overview
heading("1. Overview");
body(c.overview.summary);
subheading("Key capabilities");
bulletList(c.overview.highlights);

ensureSpace();
heading("2. The Problem");
subheading(c.problem.title);
body(c.problem.description);
subheading("Challenges");
bulletList(c.problem.challenges);
subheading("Business outcomes at risk");
bulletList(c.problem.outcomes);

doc.addPage();

// Solution
heading("3. The Solution");
subheading(c.solution.title);
body(c.solution.description);
subheading("What ContractIQ does");
bulletList(c.solution.capabilities);
subheading("User journey");
c.solution.userJourney.forEach((step, i) => {
  doc.fillColor(muted).fontSize(11).font("Helvetica").text(`${i + 1}. ${step}`, { lineGap: 3 });
});
doc.moveDown(0.6);

ensureSpace();
heading("4. AI Agents");
body(c.agents.description);
c.agents.items.forEach((agent) => {
  ensureSpace(80);
  subheading(agent.name);
  doc.fillColor(muted).fontSize(10).font("Helvetica-Bold").text("Checks:");
  bulletList(agent.checks);
  doc.fillColor(muted).fontSize(10).font("Helvetica-Bold").text("Output:");
  body(agent.output);
});

doc.addPage();

// Why It Matters
heading("5. Why It Matters to Customers");
subheading(c.whyItMatters.title);
body(c.whyItMatters.description);
c.whyItMatters.customerBenefits.forEach((b) => {
  ensureSpace(70);
  subheading(b.title);
  body(b.detail);
});

doc.addPage();

// Impact
heading("6. Business Impact");
subheading(c.impact.title);
c.impact.metrics.forEach((m) => {
  doc.fillColor(green).fontSize(18).font("Helvetica-Bold").text(m.value, { continued: true });
  doc.fillColor(muted).fontSize(11).font("Helvetica").text(`  —  ${m.label}`);
});
doc.moveDown(0.8);
subheading(c.impact.comparison.before.label);
body(`${c.impact.comparison.before.time}: ${c.impact.comparison.before.detail}`);
subheading(c.impact.comparison.after.label);
body(`${c.impact.comparison.after.time}: ${c.impact.comparison.after.detail}`);

doc.moveDown(1);
heading("7. Vision");
subheading(c.vision.title);
body(c.vision.description);

doc.moveDown(2);
doc.fillColor(muted).fontSize(9).font("Helvetica").text(
  `${c.title} · ${c.tagline} · contractiq.ai`,
  { align: "center" }
);

doc.end();

stream.on("finish", () => {
  console.log(`PDF created: ${outputPath}`);
});

stream.on("error", (err) => {
  console.error("PDF generation failed:", err);
  process.exit(1);
});
