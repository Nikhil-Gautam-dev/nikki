import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SERVICE_NAME = "note-daemon";
const SERVICE_FILE = `${SERVICE_NAME}.service`;

const SYSTEMD_USER_DIR = path.join(os.homedir(), ".config", "systemd", "user");

const SERVICE_PATH = path.join(SYSTEMD_USER_DIR, SERVICE_FILE);

function runSystemctl(args: string[]): void {
  execFileSync("systemctl", ["--user", ...args], {
    stdio: "inherit",
  });
}

function getNodePath(): string {
  return process.execPath;
}

function getDaemonPath(): string {
  const cliPath = fileURLToPath(import.meta.url);

  return path.join(path.dirname(cliPath), "daemon.js");
}
function createServiceFile(): void {
  const nodePath = getNodePath();
  const daemonPath = getDaemonPath();

  fs.mkdirSync(SYSTEMD_USER_DIR, {
    recursive: true,
  });

  const service = `[Unit]
Description=Note Reminder Daemon
After=graphical-session.target

[Service]
Type=simple

ExecStart=${nodePath} ${daemonPath}

Restart=on-failure
RestartSec=5

Environment=NODE_ENV=production

[Install]
WantedBy=default.target
`;

  fs.writeFileSync(SERVICE_PATH, service, "utf8");
}

export function installDaemon(): void {
  console.log("Installing note daemon...");

  createServiceFile();

  console.log("Reloading systemd...");

  runSystemctl(["daemon-reload"]);

  console.log("Enabling daemon...");

  runSystemctl(["enable", SERVICE_NAME]);

  console.log("Starting daemon...");

  runSystemctl(["start", SERVICE_NAME]);

  console.log();
  console.log("✓ Note daemon installed successfully.");

  console.log();
  console.log("Check status with:");

  console.log("  note daemon status");
}

export function uninstallDaemon(): void {
  console.log("Stopping note daemon...");

  try {
    runSystemctl(["disable", "--now", SERVICE_NAME]);
  } catch {
    // Service may not be running.
  }

  if (fs.existsSync(SERVICE_PATH)) {
    fs.rmSync(SERVICE_PATH);
  }

  runSystemctl(["daemon-reload"]);

  console.log("✓ Note daemon uninstalled.");
}

export function daemonStatus(): void {
  try {
    runSystemctl(["status", SERVICE_NAME, "--no-pager"]);
  } catch {
    // systemctl returns non-zero when service
    // isn't running.
  }
}

export function restartDaemon(): void {
  runSystemctl(["restart", SERVICE_NAME]);

  console.log("✓ Note daemon restarted.");
}

export function stopDaemon(): void {
  runSystemctl(["stop", SERVICE_NAME]);

  console.log("✓ Note daemon stopped.");
}

export function startDaemon(): void {
  runSystemctl(["start", SERVICE_NAME]);

  console.log("✓ Note daemon started.");
}
