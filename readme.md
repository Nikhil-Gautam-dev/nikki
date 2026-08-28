# Nikki

**Nikki** is a terminal-first personal notes and reminder application.

The idea is simple:

> **Think it. Type it. Nikki remembers it.**

Nikki lets you quickly capture notes from the terminal, search and edit them, attach reminders, and receive desktop notifications automatically through a background daemon.

---

## Features

- ⚡ Instant note capture from the terminal
- 📝 Create, edit, and delete notes
- 🏷️ Optional note titles with full-text title search
- 🔎 Search notes by content or title
- 📖 View individual notes
- ⏰ Create reminders using natural language
- 🔔 Desktop notifications
- 🤖 Background reminder daemon
- 📅 Daily summary with `nikki today`
- 📆 Navigate any day — `nikki yesterday`, `nikki tomorrow`, `nikki date "last friday"`
- 🐧 Linux/systemd user-service integration
- 💾 Local SQLite database
- 📴 No server or internet connection required
- 🎨 Custom Nikki notification icon

---

# Tech Stack

| Technology     | Purpose                       |
| -------------- | ----------------------------- |
| Node.js        | Runtime                       |
| TypeScript     | Application language          |
| Commander.js   | CLI                           |
| SQLite         | Local database                |
| better-sqlite3 | SQLite driver                 |
| chrono-node    | Natural-language date parsing |
| Chalk          | Terminal output styling       |
| tsup           | Build/bundling                |
| systemd        | Background daemon             |
| notify-send    | Linux desktop notifications   |

---

# Requirements

Currently Nikki is designed primarily for Linux.

You need:

- Node.js 18+ (Node.js 22+ recommended)
- npm
- Linux desktop environment with notifications
- `notify-send`
- systemd with user services

Check Node:

```bash
node --version
```

Check npm:

```bash
npm --version
```

Check `notify-send`:

```bash
notify-send "Nikki" "Notification test"
```

If you see a desktop notification, your notification system is ready.

---

# Installation

## Quick Start (via npm)

Install globally using npm:

```bash
npm install -g nikki-cli
```

Once installed, run:

```bash
nikki --help
```

---

## From Source

### 1. Clone the project

```bash
git clone https://github.com/Nikhil-Gautam-dev/nikki.git
cd nikki
```

Or if you already have the project locally:

```bash
cd nikki
```

---

## 2. Install dependencies

```bash
npm install
```

The project uses:

```bash
npm install commander better-sqlite3 chalk chrono-node
```

Development dependencies:

```bash
npm install -D typescript tsup tsx @types/node @types/better-sqlite3
```

---

# Development

Run the CLI directly without building:

```bash
npm run dev
```

For example:

```bash
npm run dev -- "Hello from Nikki"
```

Run the daemon during development:

```bash
npm run dev:daemon
```

---

# Build

Build the application:

```bash
npm run build
```

This generates:

```text
dist/
├── cli.js
└── daemon.js
```

---

# Install Nikki globally

During development, use:

```bash
npm link
```

Now the `nikki` command should be available globally:

```bash
nikki --help
```

Check the installed command:

```bash
which nikki
```

---

# Basic Usage

## Create a note

The primary way to create a note is:

```bash
nikki "learn how systemd user services work"
```

Output:

```text
✓ Note created #1
```

You do **not** need to type:

```bash
nikki add "..."
```

The following is also supported:

```bash
nikki add "learn how systemd user services work"
```

The goal is to make note capture as frictionless as possible.

---

# Create a note with a reminder

You can create a note and reminder at the same time:

```bash
nikki "check VPS prices" --remind "tomorrow 10am"
```

Output:

```text
✓ Note created #2
✓ Reminder #1 created
  8/18/2026, 10:00:00 AM
```

Short form:

```bash
nikki "submit project report" -r "friday 5pm"
```

---

# Reminder Date Examples

Nikki uses natural-language date parsing.

Examples:

```bash
nikki "check VPS prices" --remind "tomorrow 10am"
```

```bash
nikki "call John" --remind "in 2 hours"
```

```bash
nikki "submit report" --remind "friday 5pm"
```

```bash
nikki "work on project" --remind "next monday 9am"
```

```bash
nikki "renew domain" --remind "September 1 at 10am"
```

```bash
nikki "check deployment" --remind "in 30 minutes"
```

---

# View Help for Reminders

```bash
nikki remind --help
```

The command displays examples such as:

```text
Examples:

  $ nikki remind 12 --at "tomorrow 10am"

  $ nikki remind 12 --at "in 2 hours"

  $ nikki remind 12 --at "in 30 minutes"

  $ nikki remind 12 --at "friday 5pm"

  $ nikki remind 12 --at "next monday 9am"

  $ nikki remind 12 --at "September 1 at 10am"
```

---

# List Notes

```bash
nikki list
```

Example:

```text
#4 Build terminal note taking app
#3 Learn about systemd user services
#2 Check VPS prices
#1 MongoDB WriteConflict research
```

By default, Nikki shows the latest 20 notes.

Specify a limit:

```bash
nikki list --limit 50
```

or:

```bash
nikki list -n 50
```

---

# Search Notes

Search for a word or phrase:

```bash
nikki search mongodb
```

Example:

```text
#14 MongoDB WriteConflict happens during concurrent transactions
#9 MongoDB transaction retry mechanism
#3 Learn about MongoDB snapshot isolation
```

Search is currently performed locally against the SQLite database.

---

# Show a Note

Every note has an ID.

For example:

```bash
nikki show 14
```

Output:

```text
# Note 14
──────────────────────────────────────────────────

MongoDB WriteConflict happens during concurrent
transactions.

Created: 8/17/2026, 10:32:14 AM
Updated: 8/17/2026, 10:32:14 AM
```

---

# Edit a Note

Nikki uses the editor specified by `$EDITOR`.

Set your editor:

```bash
export EDITOR=nvim
```

Then:

```bash
nikki edit 14
```

The note opens in Neovim.

For VS Code:

```bash
export EDITOR="code --wait"
```

Then:

```bash
nikki edit 14
```

You can permanently add the editor to your shell configuration.

For Zsh:

```bash
echo 'export EDITOR=nvim' >> ~/.zshrc
```

Then reload:

```bash
source ~/.zshrc
```

---

# Delete a Note

```bash
nikki delete 14
```

Nikki asks for confirmation:

```text
You are about to delete note #14:

MongoDB WriteConflict happens during concurrent transactions

Delete this note? [y/N]
```

Enter:

```text
y
```

to delete it.

Anything else cancels the operation.

---

# Reminders

## Create a reminder for an existing note

Suppose note `#14` already exists.

```bash
nikki remind 14 --at "tomorrow 10am"
```

A reminder is created for that note.

You can also use:

```bash
nikki remind 14 --at "in 2 hours"
```

---

## List reminders

```bash
nikki reminders
```

Example:

```text
Upcoming reminders
────────────────────────────────────────────────────────────

#4  8/18/2026, 10:00:00 AM
   Check VPS prices

#5  8/20/2026, 5:00:00 PM
   Submit project report
```

---

## Complete a reminder

Each reminder has an ID.

For example:

```bash
nikki complete-reminder 4
```

Output:

```text
✓ Reminder #4 completed.
```

---

# Daily Summary

Use:

```bash
nikki today
```

This shows the notes and reminders associated with today.

Example:

```text
Today · Monday, August 17, 2026
──────────────────────────────────────────────────

Notes · 3

10:12  #12 Learned about systemd user services
11:32  #13 Need to improve reminder notifications
14:05  #14 Idea: add Nikki mascot

Reminders · 2

✓ 10:00  Check VPS prices
  18:30  Work on CLI daemon

──────────────────────────────────────────────────
3 notes · 2 reminders
```

This is intended to become the main daily overview for Nikki.

---

# Note Titles

You can optionally attach a title to any note.

## Create a note with a title

```bash
nikki "Migrate Postgres to RDS" --title "DevOps"
# short form:
nikki "Migrate Postgres to RDS" -t "DevOps"
```

Output:

```text
✓ Note created #5
  Title: DevOps
```

## Set or update a title on an existing note

```bash
nikki title 14 "Q3 Planning"
```

Output:

```text
✓ Title set for note #14: "Q3 Planning"
```

## Clear a title

Omit the title argument to clear it:

```bash
nikki title 14
```

Output:

```text
✓ Title cleared for note #14.
```

## Searching by title

`nikki search` automatically searches both **content and titles**:

```bash
nikki search "Q3 Planning"
```

Example:

```text
#14 Q3 Planning — Meeting decisions for next quarter
#5  DevOps — Migrate Postgres to RDS
```

---

# Date Navigation

You can view notes and reminders for any day — not just today.

## Yesterday

```bash
nikki yesterday
```

## Tomorrow

```bash
nikki tomorrow
```

## Any date using natural language

```bash
nikki date "last friday"
nikki date "next monday"
nikki date "Aug 25"
nikki date "2 days ago"
nikki date "September 1"
```

Example output:

```text
last friday · Friday, August 22, 2026
──────────────────────────────────────────────────

Notes · 2
10:00  #9  DevOps — Migrate Postgres to RDS
15:30  #10 systemd socket activation notes

Reminders · 1
  17:00  Submit weekly report

──────────────────────────────────────────────────
2 notes · 1 reminder
```

---

# Reminder Daemon

The reminder daemon is responsible for checking SQLite for due reminders and sending desktop notifications.

The flow is:

```text
                    SQLite
                      │
                      ▼
               Nikki Daemon
                      │
                Every 30 sec
                      │
                      ▼
               Due reminder?
                  /       \
                No         Yes
                │           │
                │           ▼
                │      notify-send
                │           │
                │           ▼
                │     Desktop popup
                │
                └─────── repeat
```

---

# Test the Daemon Manually

Start the daemon:

```bash
npm run dev:daemon
```

or after building:

```bash
node dist/daemon.js
```

You should see:

```text
Note reminder daemon started.
Checking every 30 seconds...
```

Create a test note:

```bash
nikki "Test daemon notification"
```

Then create a reminder:

```bash
nikki "Test daemon notification" --remind "in 1 minute"
```

Wait for the reminder.

You should receive a desktop notification.

---

# Install the Daemon as a systemd User Service

Nikki provides its own setup command.

You do **not** need to manually create a systemd service file.

Run:

```bash
nikki daemon install
```

Nikki will:

1. Locate the Node.js executable.
2. Locate the Nikki daemon.
3. Create the systemd user service.
4. Reload systemd.
5. Enable the service.
6. Start the daemon.

Expected output:

```text
Installing note daemon...
Reloading systemd...
Enabling daemon...
Starting daemon...

✓ Note daemon installed successfully.

Check status with:
  nikki daemon status
```

---

# Check Daemon Status

```bash
nikki daemon status
```

Or directly through systemd:

```bash
systemctl --user status note-daemon
```

You should see:

```text
Active: active (running)
```

---

# Start the Daemon

```bash
nikki daemon start
```

Equivalent systemd command:

```bash
systemctl --user start note-daemon
```

---

# Stop the Daemon

```bash
nikki daemon stop
```

Equivalent systemd command:

```bash
systemctl --user stop note-daemon
```

---

# Restart the Daemon

```bash
nikki daemon restart
```

Equivalent systemd command:

```bash
systemctl --user restart note-daemon
```

---

# View Daemon Logs

Follow logs in real time:

```bash
journalctl --user -u note-daemon -f
```

Example:

```text
Note reminder daemon started.
Checking every 30 seconds...
Found 1 due reminder(s)
Reminder #4 notified
```

You can also use:

```bash
nikki daemon logs
```

if the CLI logs command is enabled.

---

# Uninstall the Daemon

To remove the systemd user service:

```bash
nikki daemon uninstall
```

This stops and disables the service and removes its service file.

Your notes and SQLite database are **not deleted**.

---

# Notification Icon

Nikki can use a custom mascot image for notifications.

Example:

```bash
notify-send \
  --app-name="Nikki" \
  --icon="/absolute/path/to/nikki.png" \
  "Nikki" \
  "Don't forget to check the VPS prices."
```

The icon should be an image such as:

```text
assets/
└── nikki.png
```

Using an absolute path is recommended when testing notifications.

---

# Data Storage

Nikki stores its local application data under:

```text
~/.note/
```

The SQLite database is:

```text
~/.note/notes.db
```

The database contains:

```text
notes
reminders
```

No remote database is required.

No external server is required.

Your notes remain local to your machine.

---

# Development Structure

The project currently follows this structure:

```text
 nikki/
├── src/
│   ├── cli.ts
│   ├── daemon.ts
│   ├── db.ts
│   │
│   ├── services/
│   │   ├── daemon.service.ts
│   │   ├── note.service.ts
│   │   ├── notification.service.ts
│   │   └── reminder.service.ts
│   │
│   └── utils/
│       ├── date.ts
│       ├── editor.ts
│       ├── paths.ts
│       └── version-manager.ts
│
├── assets/
│   └── nikki-fox-mascot.png
│
├── dist/
│   ├── cli.js
│   └── daemon.js
│
├── package.json
├── package-lock.json
├── tsconfig.json
└── tsup.config.ts
```

---

# Build Configuration

Nikki uses `tsup` to bundle the CLI and daemon.

The build configuration contains two entry points:

```text
src/cli.ts
src/daemon.ts
```

which produce:

```text
dist/cli.js
dist/daemon.js
```

Build with:

```bash
npm run build
```

---

# Complete Command Reference

## Notes

```bash
nikki "note"
nikki add "note"
nikki add "note" --title "My Title"   # with optional title
nikki add "note" -t "My Title"         # short form

nikki title <id> "New Title"           # set/update title
nikki title <id>                       # clear title

nikki list
nikki list --limit 50

nikki search <query>                   # searches content AND titles

nikki show <id>

nikki edit <id>

nikki delete <id>
```

## Reminders

```bash
nikki "note" --remind "tomorrow 10am"

nikki "note" -r "in 2 hours"

nikki remind <note-id> --at "tomorrow 10am"

nikki reminders

nikki complete-reminder <reminder-id>
```

## Daily & Date Navigation

```bash
nikki today
nikki yesterday
nikki tomorrow
nikki date "last friday"
nikki date "next monday"
nikki date "Aug 25"
```

## Daemon

```bash
nikki daemon install
nikki daemon status
nikki daemon start
nikki daemon stop
nikki daemon restart
nikki daemon uninstall
```

---

# Complete Example Workflow

Here's a realistic workflow.

## 1. Capture an idea

```bash
nikki "I should build a terminal-first personal knowledge system"
```

---

## 2. Capture an idea with a reminder

```bash
nikki "Research terminal knowledge management systems" \
  --remind "tomorrow 10am"
```

---

## 3. Capture something you learned

```bash
nikki "systemd user services can run without root privileges"
```

---

## 4. Search your notes

```bash
nikki search systemd
```

---

## 5. Open a note

```bash
nikki show 3
```

---

## 6. Edit it

```bash
nikki edit 3
```

---

## 7. Add a reminder to an existing note

```bash
nikki remind 3 --at "friday 5pm"
```

---

## 8. Check today's activity

```bash
nikki today
```

---

## 9. Check upcoming reminders

```bash
nikki reminders
```

---

## 10. Let Nikki run in the background

```bash
nikki daemon install
```

From this point onward, the daemon runs automatically through systemd and checks for reminders in the background.

---

# Recommended Shell Workflow

The intended workflow is deliberately simple.

Instead of opening a notes application:

```text
Open application
    ↓
Find notebook
    ↓
Create note
    ↓
Write
    ↓
Close application
```

you simply type:

```bash
nikki "something I don't want to forget"
```

For a reminder:

```bash
nikki "do something later" --remind "tomorrow 10am"
```

For your daily overview:

```bash
nikki today
```

For searching your memory:

```bash
nikki search <query>
```

---

# Philosophy

Nikki is intentionally **not** trying to become another large productivity application.

The core principle is:

```text
Capture quickly.
Store locally.
Search easily.
Remind reliably.
Stay out of the way.
```

The terminal is the primary interface.

---

# Roadmap

Potential future features:

- [ ] Better full-text search
- [ ] Tags
- [ ] Note linking
- [ ] Daily/weekly summaries
- [x] `nikki yesterday`
- [x] `nikki tomorrow`
- [x] `nikki date <nlp>` — natural language date navigation
- [ ] Recurring reminders
- [ ] Snooze reminders
- [ ] Notification actions such as `Done` and `Snooze`
- [ ] Multiple notification mascot expressions
- [ ] Markdown note files
- [ ] Import/export
- [ ] Git-based synchronization
- [ ] Optional TUI
- [ ] Optional encrypted backup
- [ ] Cross-platform notification support
- [ ] Windows/macOS support

The goal is to add features without compromising the simple terminal-first workflow.

---

# License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```text
MIT License

Copyright (c) 2026 Nikhil Gautam
```
