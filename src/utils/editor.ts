import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export async function openEditor(initialContent = ""): Promise<string> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "note-"));

  const filePath = path.join(tempDir, "note.md");

  await fs.writeFile(filePath, initialContent, "utf8");

  const editor = process.env.EDITOR || "vi";

  const [command, ...args] = editor.split(" ");

  await new Promise<void>((resolve, reject) => {
    const child = spawn(command!, [...args, filePath], {
      stdio: "inherit",
    });

    child.on("error", reject);

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Editor exited with code ${code}`));
      }
    });
  });

  const content = await fs.readFile(filePath, "utf8");

  await fs.rm(tempDir, {
    recursive: true,
    force: true,
  });

  return content.trim();
}
