import {
  getDueReminders,
  markReminderNotified,
} from "./services/reminder.service.js";

import { notify } from "./services/notification.service.js";

const CHECK_INTERVAL = 30_000;

let isChecking = false;
let isShuttingDown = false;

async function checkReminders(): Promise<void> {
  if (isChecking || isShuttingDown) {
    return;
  }

  isChecking = true;

  try {
    const reminders = getDueReminders();

    if (reminders.length === 0) {
      return;
    }

    console.log(
      `[${new Date().toLocaleString()}] ` +
        `Found ${reminders.length} due reminder(s)`,
    );

    for (const reminder of reminders) {
      try {
        await notify("🔔 Reminder", reminder.content);

        markReminderNotified(reminder.id);

        console.log(
          `[${new Date().toLocaleString()}] ` +
            `Reminder #${reminder.id} notified`,
        );
      } catch (error) {
        console.error(
          `[${new Date().toLocaleString()}] ` +
            `Failed to notify reminder #${reminder.id}`,
          error,
        );
      }
    }
  } catch (error) {
    console.error(
      `[${new Date().toLocaleString()}] ` + "Failed to check reminders:",
      error,
    );
  } finally {
    isChecking = false;
  }
}

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(`\nReceived ${signal}. Shutting down...`);

  // Allow an active check to finish.
  while (isChecking) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log("Daemon stopped.");

  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

console.log("Note reminder daemon started.");

console.log(`Checking every ${CHECK_INTERVAL / 1000} seconds...`);

await checkReminders();

const interval = setInterval(() => {
  void checkReminders();
}, CHECK_INTERVAL);

process.on("SIGTERM", () => {
  clearInterval(interval);
});

process.on("SIGINT", () => {
  clearInterval(interval);
});
