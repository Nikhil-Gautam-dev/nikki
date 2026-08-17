import { Command } from "commander";
import chalk from "chalk";

import {
  createNote,
  deleteNote,
  getNoteById,
  getNotes,
  getTodayNotes,
  searchNotes,
  updateNote,
} from "./services/note.service.js";
import { openEditor } from "./utils/editor.js";
import { parseDate } from "chrono-node";
import {
  createReminder,
  getUpcomingReminders,
  completeReminder,
  getTodayReminders,
} from "./services/reminder.service.js";
import {
  daemonStatus,
  installDaemon,
  restartDaemon,
  startDaemon,
  stopDaemon,
  uninstallDaemon,
} from "./services/daemon.service.js";
import { getCurrentVersion } from "./utils/version-manager.js";

const commands = new Set([
  "add",
  "list",
  "search",
  "show",
  "edit",
  "delete",
  "remind",
  "reminders",
  "complete-reminder",
  "today",
  "daemon",
  "help",
  "--help",
  "-h",
  "--version",
  "-V",
]);

const firstArgument = process.argv[2];

if (
  firstArgument &&
  !commands.has(firstArgument) &&
  !firstArgument.startsWith("-")
) {
  process.argv.splice(2, 0, "add");
}

const program = new Command();

program
  .name("nikki")
  .description("A terminal-first personal notes and reminder app")
  .version(getCurrentVersion());

program
  .command("add")
  .argument("<content>", "Note content")
  .option("-r, --remind <time>", "Set a reminder for this note")
  .description("Create a note")
  .addHelpText(
    "after",
    `

Examples:

  $ nikki "learn systemd"

  $ nikki "check VPS prices" --remind "tomorrow 10am"

  $ nikki "submit report" -r "friday 5pm"

  $ nikki "call John" --remind "in 2 hours"

  $ nikki "backup laptop" -r "sunday 9pm"
`,
  )
  .action(async (content: string, options) => {
    try {
      const note = createNote(content);

      console.log(chalk.green(`✓ Note created #${note.id}`));

      if (options.remind) {
        const remindAt = parseDate(options.remind)!;

        const reminder = createReminder(note.id, remindAt);

        console.log(chalk.green(`✓ Reminder #${reminder.id} created`));

        console.log(chalk.gray(`  ${remindAt.toLocaleString()}`));
      }
    } catch (error) {
      console.error(
        chalk.red(
          error instanceof Error ? error.message : "Failed to create note.",
        ),
      );

      process.exitCode = 1;
    }
  });

program
  .command("list")
  .description("List recent notes")
  .action(() => {
    const notes = getNotes();

    for (const note of notes) {
      console.log(chalk.gray(`#${note.id}`), note.content);
    }
  });

program
  .command("search")
  .argument("<query>")
  .description("Search notes")
  .action((query: string) => {
    const notes = searchNotes(query);

    if (notes.length === 0) {
      console.log("No notes found.");
      return;
    }

    for (const note of notes) {
      console.log(chalk.gray(`#${note.id}`), note.content);
    }
  });

program
  .command("show")
  .argument("<id>")
  .description("Show a note")
  .action((id: string) => {
    const note = getNoteById(Number(id));

    if (!note) {
      console.error(chalk.red(`Note #${id} not found.`));
      process.exitCode = 1;
      return;
    }

    console.log();
    console.log(chalk.bold(`# ${note.id}`));
    console.log("─".repeat(40));
    console.log();
    console.log(note.content);
    console.log();
    console.log(
      chalk.gray(`Created: ${new Date(note.created_at).toLocaleString()}`),
    );
  });

program
  .command("edit")
  .argument("<id>")
  .description("Edit a note")
  .action(async (idString: string) => {
    const id = Number(idString);

    const note = getNoteById(id);

    if (!note) {
      console.error(chalk.red(`Note #${id} not found.`));

      process.exitCode = 1;
      return;
    }

    try {
      const content = await openEditor(note.content);

      if (!content) {
        console.log(chalk.yellow("Note is empty. Nothing changed."));

        return;
      }

      updateNote(id, content);

      console.log(chalk.green(`✓ Note #${id} updated.`));
    } catch (error) {
      console.error(
        chalk.red(
          error instanceof Error ? error.message : "Failed to edit note.",
        ),
      );

      process.exitCode = 1;
    }
  });

program
  .command("delete")
  .argument("<id>")
  .description("Delete a note")
  .action((idString: string) => {
    const id = Number(idString);

    const note = getNoteById(id);

    if (!note) {
      console.error(chalk.red(`Note #${id} not found.`));

      process.exitCode = 1;
      return;
    }

    console.log();
    console.log(chalk.yellow(`You are about to delete note #${id}:`));

    console.log(chalk.gray(note.content));

    console.log();

    process.stdout.write("Delete this note? [y/N] ");

    process.stdin.setEncoding("utf8");

    process.stdin.once("data", (input: string) => {
      const answer = input.trim().toLowerCase();

      if (answer !== "y" && answer !== "yes") {
        console.log(chalk.gray("Cancelled."));

        process.exit(0);
      }

      const deleted = deleteNote(id);

      if (deleted) {
        console.log(chalk.green(`✓ Note #${id} deleted.`));
      }
      process.exit(0);
    });
  });

program
  .command("remind")
  .argument("<noteId>")
  .requiredOption("--at <time>", 'Reminder time, e.g. "tomorrow 10am"')
  .description("Create a reminder for a note")
  .addHelpText(
    "after",
    `
    
Examples:

  $ note remind 12 --at "tomorrow 10am"

  $ note remind 12 --at "in 2 hours"

  $ note remind 12 --at "in 30 minutes"

  $ note remind 12 --at "friday 5pm"

  $ note remind 12 --at "next monday 9am"

  $ note remind 12 --at "September 1 at 10am"

The time is interpreted using natural language.

Useful commands:

  $ note reminders
  $ note today
  $ note complete-reminder 3
`,
  )
  .action((noteIdString: string, options) => {
    const noteId = Number(noteIdString);

    const note = getNoteById(noteId);

    if (!note) {
      console.error(chalk.red(`Note #${noteId} not found.`));

      process.exitCode = 1;
      return;
    }

    try {
      const remindAt = parseDate(options.at);

      const reminder = createReminder(noteId, remindAt!);

      console.log(chalk.green(`✓ Reminder #${reminder.id} created.`));

      console.log(chalk.gray(`  ${remindAt!.toLocaleString()}`));
    } catch (error) {
      console.error(
        chalk.red(
          error instanceof Error ? error.message : "Failed to create reminder.",
        ),
      );

      process.exitCode = 1;
    }
  });

program
  .command("reminders")
  .description("List upcoming reminders")
  .action(() => {
    const reminders = getUpcomingReminders();

    if (reminders.length === 0) {
      console.log(chalk.gray("No pending reminders."));

      return;
    }

    console.log();
    console.log(chalk.bold("Upcoming reminders"));

    console.log(chalk.gray("─".repeat(60)));

    for (const reminder of reminders) {
      console.log(
        chalk.yellow(`#${reminder.id}`),
        new Date(reminder.remind_at).toLocaleString(),
      );

      console.log(`   ${reminder.content}`);

      console.log();
    }
  });

program
  .command("complete-reminder")
  .argument("<id>")
  .description("Complete a reminder")
  .action((idString: string) => {
    const id = Number(idString);

    const completed = completeReminder(id);

    if (!completed) {
      console.error(
        chalk.red(`Reminder #${id} not found or already completed.`),
      );

      process.exitCode = 1;
      return;
    }

    console.log(chalk.green(`✓ Reminder #${id} completed.`));
  });

program
  .command("today")
  .description("Show today's notes and reminders")
  .action(() => {
    const notes = getTodayNotes();
    const reminders = getTodayReminders();

    const now = new Date();

    console.log();

    console.log(
      chalk.bold(
        `Today · ${now.toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}`,
      ),
    );

    console.log(chalk.gray("─".repeat(50)));

    console.log();

    /*
     * NOTES
     */

    console.log(chalk.bold(`Notes · ${notes.length}`));

    console.log();

    if (notes.length === 0) {
      console.log(chalk.gray("No notes today."));
    } else {
      for (const note of notes) {
        const time = new Date(note.created_at).toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        });

        console.log(chalk.gray(`${time}  #${note.id}`), note.content);
      }
    }

    console.log();

    /*
     * REMINDERS
     */

    console.log(chalk.bold(`Reminders · ${reminders.length}`));

    console.log();

    if (reminders.length === 0) {
      console.log(chalk.gray("No reminders today."));
    } else {
      for (const reminder of reminders) {
        const time = new Date(reminder.remind_at).toLocaleTimeString(
          undefined,
          {
            hour: "2-digit",
            minute: "2-digit",
          },
        );

        const status =
          reminder.status === "completed"
            ? chalk.green("✓")
            : new Date(reminder.remind_at) < now
              ? chalk.yellow("!")
              : " ";

        console.log(`${status} ${time}`, reminder.content);
      }
    }

    console.log();

    console.log(chalk.gray("─".repeat(50)));

    console.log(
      chalk.gray(`${notes.length} notes · ${reminders.length} reminders`),
    );

    console.log();
  });

const daemonCommand = program
  .command("daemon")
  .description("Manage the reminder daemon");

daemonCommand
  .command("install")
  .description("Install and start the systemd user service")
  .action(() => {
    try {
      installDaemon();
    } catch (error) {
      console.error(
        chalk.red(
          error instanceof Error ? error.message : "Failed to install daemon.",
        ),
      );

      process.exitCode = 1;
    }
  });

daemonCommand
  .command("uninstall")
  .description("Remove the systemd user service")
  .action(() => {
    try {
      uninstallDaemon();
    } catch (error) {
      console.error(
        chalk.red(
          error instanceof Error
            ? error.message
            : "Failed to uninstall daemon.",
        ),
      );

      process.exitCode = 1;
    }
  });

daemonCommand
  .command("status")
  .description("Show daemon status")
  .action(() => {
    daemonStatus();
  });

daemonCommand
  .command("start")
  .description("Start the daemon")
  .action(() => {
    startDaemon();
  });

daemonCommand
  .command("stop")
  .description("Stop the daemon")
  .action(() => {
    stopDaemon();
  });

daemonCommand
  .command("restart")
  .description("Restart the daemon")
  .action(() => {
    restartDaemon();
  });

program.parse();
