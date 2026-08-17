import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

const packageJsonPath = path.resolve(currentDir, "../package.json");

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

export const getCurrentVersion = () => {
  return packageJson.version;
};
