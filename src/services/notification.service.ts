import { execFile } from "node:child_process";
import { NIKKI_ICON } from "../utils/paths.js";

export function notify(title: string, message: string): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(
      "notify-send",
      [
        "--app-name=Note",
        `--icon=${NIKKI_ICON}`,
        "--urgency=normal",
        "--expire-time=10000",
        title,
        message,
      ],
      (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      },
    );
  });
}
