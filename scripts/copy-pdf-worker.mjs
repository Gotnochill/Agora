import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs");
const destination = join(root, "public", "pdf.worker.min.mjs");

if (!existsSync(source)) {
  console.warn("PDF.js worker was not found; skipping local asset copy.");
  process.exit(0);
}

mkdirSync(dirname(destination), { recursive: true });
copyFileSync(source, destination);
console.info("Copied PDF.js worker to public/pdf.worker.min.mjs.");
