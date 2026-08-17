import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const dataDir = path.join(os.homedir(), ".note");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

export const NIKKI_ICON = path.join(currentDir, "../assets/nikki-fox-mascot.png");

export const DB_PATH = path.join(dataDir, "notes.db");
