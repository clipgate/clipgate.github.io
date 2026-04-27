---
title: "macOS Clipboard History — What Gets Logged, What Leaks, and How to Audit It"
description: "How the macOS pasteboard, Universal Clipboard, and popular clipboard managers actually store your copies — what's logged, what leaks, and a five-step audit."
tags: macos, security, privacy, productivity
canonical_url: https://clipgate.github.io/blog/macos-clipboard-history-what-leaks/
cover_image: https://clipgate.github.io/assets/social-card.png
published: false
category: Secrets
category_class: secrets
icon: "🔐"
seo_title: "macOS Clipboard History: What Gets Logged, What Leaks, and How to Audit It"
seo_description: "A 2026 audit of how the macOS pasteboard, Universal Clipboard, and popular clipboard managers actually store your copies — what's logged, what leaks, and a five-step check to find traces of your last password."
hashnode_slug: macos-clipboard-history-what-leaks
enable_toc: true
---

A look at how the macOS pasteboard, Universal Clipboard, and popular third-party clipboard managers actually store your copies in 2026 — what is logged, what crosses the network, and a five-step check to find traces of your last password.

> **The short version:** the pasteboard is global, Universal Clipboard is permissive, most managers store plaintext on disk, and you can audit all of it in twenty minutes with commands already on your Mac.

## What the macOS pasteboard actually is

The "clipboard" on a Mac is an instance of `NSPasteboard`. The general one — `NSPasteboard.general` — backs Cmd-C, Cmd-V, the Edit menu, and every drag-and-drop. It is not an app feature; it is an OS feature exposed to every running process.

What lives on it is more than text. A single copy can carry several representations at once: a UTF-8 plain string under `public.utf8-plain-text`, a styled `public.rtf` blob, a `public.html` rendering, file URLs (`public.file-url`), and image data for screenshots. The receiver picks whichever flavor it prefers. That is why pasting from Safari into Mail keeps formatting and pasting into Terminal strips it.

Everything is keyed by what Apple calls a *change count*. Every new copy increments the integer. Apps poll that counter to decide whether to read again. There is no permission gate, no broker, no audit log. If your app is running, it sees the change count, and if it asks for the data, it gets it.

> **Mental model:** the macOS pasteboard is a single, mutable, shared dictionary keyed by content type. Every app on your machine has read access — most without you ever granting it.

By default, macOS keeps exactly one item there. Copy something new and the previous value is overwritten. There is no built-in scrollback. That sounds reassuring, but it is only the surface. Every clipboard manager you install extends that single slot into a persistent on-disk history, and Universal Clipboard syncs the live slot to every Apple device on your account.

## Universal Clipboard: the cross-device leak path

Universal Clipboard lets you copy on your Mac and paste into Notes on your iPhone a second later. It rides on Continuity and Handoff. The transport is encrypted: a Bluetooth Low Energy advertisement announces something is on offer, and the payload moves over peer-to-peer Wi-Fi.

The encryption solves a narrow problem — it protects bytes from anyone sniffing the air between your laptop and phone. It does not protect you from anything happening on either end. The trust model assumes every device signed in to your Apple ID is trusted equally. The clipboard is offered, in cleartext, to every device on that account that is awake and in range.

The cases that bite people most often:

- **Family Apple ID.** Households that share an Apple ID for App Store purchases unintentionally share a clipboard. Copy a 2FA recovery code on the work Mac, and the family iPad sees it.
- **Old devices on shelves.** An iPad in a drawer that still wakes for notifications can briefly receive Universal Clipboard payloads.
- **Loaner Macs.** If you signed in to your Apple ID on a borrowed device, your clipboard reached that machine for as long as Continuity was active.
- **Shared screens.** AirPlay and CarPlay receivers do not pull pasteboard contents, but other Apple devices on the same ID still do.

Receiving storage is short-lived — held only until the next copy replaces it. But a few seconds is long enough to be read by a polling app, snapshotted by automation, or referenced from a notification preview. Treat Universal Clipboard the way you would treat an unencrypted Slack DM to yourself: convenient, plausible, not where you put a credential.

## Apps that read your clipboard without asking

In 2020, iOS 14 added a banner reading "TikTok pasted from Notes," "LinkedIn pasted from Safari." Suddenly visible, the practice of polling the clipboard turned out to be widespread — including among apps with no reason to. The backlash forced many apps to scale it back.

macOS has no equivalent banner. No toast when an app reads `NSPasteboard.general`, no consent prompt, no Settings entry listing apps that have read it. Any running Cocoa app that calls `string(forType: .string)` gets the contents. If it uses a timer — a common "smart paste" pattern — it sees every copy you make.

The categories worth knowing:

- **Browser extensions.** The page-level Clipboard API is permissioned, but extensions are different. Approve "read and change all your data on websites" and the extension can read the clipboard the moment a page is focused. Coupon helpers, AI assistants, password autofillers, and translation tools all use this.
- **Polling utilities.** Quick-launch tools, screenshot annotators, color pickers, and link unfurlers poll the pasteboard a few times a second. Benign intent; the practical effect is a quiet keylogger for clipboard contents.
- **Third-party menu bar apps.** Anything with a status item is a long-running process. If even one polls the pasteboard, your clipboard activity is visible to it.
- **Remote desktop and screen-share helpers.** Software that syncs your clipboard to a remote VM or screen-share session is, by definition, exfiltrating it. The risk is forgetting the sync is on after the session ends.

None of this requires malware. Every app above does what its developers intended, on a platform that does not require them to declare it. The only way to know which apps read your pasteboard is to read privacy policies, watch Activity Monitor, or assume the worst.

## How third-party clipboard managers store history

Install a clipboard manager — anything that turns the single-slot pasteboard into a scrollable list — and every copy from the last day, week, or month is now persisted to disk. Where, in what format, and with what protection depends on which manager you chose. The survey below is a starting point for your own audit, not a security review.

| Manager | Where it stores history | What to watch out for |
|---|---|---|
| **[Maccy](https://maccy.app/)** | Local Core Data store under `~/Library/Application Support/Maccy/`, SQLite-backed. Plain text by default. | Open source. Filters can suppress sensitive items, but the database is not encrypted at rest — a stolen disk image is a clipboard dump. |
| **[Paste](https://pasteapp.io/)** | Local store with iCloud sync via CloudKit. History propagates to every device on the same iCloud account. | Sync convenience is the privacy trade. Restoring a device from iCloud restores history. iCloud compromise = scrollback compromise. |
| **[Alfred](https://www.alfredapp.com/) clipboard** | Local property list and SQLite under Alfred's preferences directory. Retention configurable, 24h to 3 months. | Powerpack feature; off by default. Honors a per-app ignore list and supports password-manager-style auto-clear — unusually thoughtful for the category. |
| **[Raycast](https://www.raycast.com/) clipboard** | Local SQLite database. Recent versions added shape-based filters that try to keep secrets out of history. | Secret filtering is heuristic. Anything it misses lands in the same database. Raycast Pro adds optional cloud sync. |
| **CopyClip and similar lightweights** | Small local property list of recent items, capped at a few dozen entries. | Smaller surface, but no encryption and no secret-aware filtering. Plain text by design. |

The honest takeaway: most popular managers are good citizens. The risk is not malice; it is the cumulative effect of running a polling reader for years and leaving the log on disk. A clipboard manager is an excellent productivity tool and an excellent dossier of everything you have copied since you installed it. Both are true at once.

## Auditing what's leaked: a 5-step check

Block out twenty minutes on a quiet Sunday. The five steps below cost nothing to run and tell you more about your clipboard hygiene than any blog post can. Treat anything that surprises you as a finding worth following up on.

### 1. Inventory your clipboard storage

Start with a single find under your home Library to list anything that looks like clipboard data.

```bash
find ~/Library/Application\ Support \
  -iname "*clip*" -o -iname "*paste*" 2>/dev/null
```

Expect a handful of directories: any clipboard manager you installed, plus a few benign hits. The point is to see the full set in one place, not just the one you remember.

### 2. Peek inside any SQLite databases you found

Most of those directories contain a `.sqlite` file. Open it read-only and dump the recent rows. Read-only matters: do not alter the database while the manager has it open.

```bash
sqlite3 -readonly \
  ~/Library/Application\ Support/Maccy/Maccy.sqlite \
  ".tables" ".schema HistoryItem" \
  "SELECT firstCopiedAt, lastCopiedAt, content FROM HistoryItem \
   ORDER BY lastCopiedAt DESC LIMIT 20;"
```

Adjust paths and table names per manager. Confirm with your own eyes what shape storage takes and how far back it goes. If you see a token or password in the output, treat it as leaked — for disk-level threat models, it has.

### 3. Check what is talking to the pasteboard right now

Activity Monitor's CPU tab plus the system `pboard` process gives a rough sense of who is reading. Sort by name and look for the `pboard` daemon and any process whose CPU spikes after every copy.

```bash
ps aux | grep -i pboard
log show --last 5m --predicate \
  'subsystem == "com.apple.pasteboard"' --info
```

The unified log will not show contents, but it will show which apps interacted with the pasteboard recently. Anything you do not recognize is worth investigating.

### 4. Audit your iCloud and Universal Clipboard surface

Open System Settings, click your name, and review which devices are listed under your Apple ID. Each one is a potential receiver of Universal Clipboard payloads. Sign out of any device you no longer use. Under General → AirDrop & Handoff, the "Allow Handoff between this Mac and your iCloud devices" toggle controls Universal Clipboard.

```bash
defaults read com.apple.coreservices.useractivityd \
  ActivityAdvertisingAllowed
defaults read MobileMeAccounts
```

Those reads are illustrative — they show your machine's state without changing anything. Recent macOS versions also expose pasteboard transparency under Settings → Privacy & Security. Look at every entry there.

### 5. Review which apps have privileged input access

Many clipboard tools and hotkey managers ask for Accessibility or Input Monitoring permissions. Those are far broader than the clipboard, so the list is a good proxy for "apps with deep observational access to my Mac." Settings → Privacy & Security → Accessibility, then the same for Input Monitoring and Screen Recording. Revoke anything you cannot account for, then restart and confirm nothing breaks.

> **If the audit turns up nothing alarming**, you have a baseline and a procedure to repeat next quarter. If it turns up something — an old 90-day database, a stale Apple ID device, a forgotten extension polling every page — you have learned something the OS was never going to volunteer.

## The local-only fix

The audit is necessary because almost every clipboard manager optimizes for convenience first, privacy second. That suits most users. But if you ran the audit, you probably want a different default. The shape of the tool is consistent across every serious threat model.

- **No cloud sync, or sync default-off.** The simplest privacy story is the one where data never leaves your machine. Sync should be opt-in.
- **Encrypted storage at rest.** A plaintext SQLite history is a single backup away from being a credential dump. Encryption at rest turns that into a normal disk-encryption story.
- **Secret-aware classification with a memory-only TTL.** The manager must know the difference between "the path I just yanked" and "an API token." Secret-shaped values should stay out of persistent history.
- **Transparent storage path.** You should be able to say in one sentence where the manager keeps your history. If the answer requires source code or a privacy policy, the trust model is wrong.
- **Configurable retention.** "Keep everything forever" is the wrong default. Caps in items or days should round-trip to the database.
- **No telemetry, no account, no analytics.** If the manager cannot run fully offline, it is not local-only.

The principles matter more than any specific binary. Whatever you land on, run the audit again next month. The point is the habit.

## Frequently asked questions

### Does macOS keep a clipboard history by default?

Out of the box, macOS only retains the most recent item on `NSPasteboard.general`. There is no built-in scrollable history. But every running app can read that current value silently, and any installed clipboard manager almost certainly maintains its own on-disk history that survives restarts.

### Can other apps read my clipboard on macOS without asking?

Yes. Unlike iOS, macOS does not prompt or notify. Any active app calling `NSPasteboard.general` can read the current contents, and many do so on a polling timer. Browser extensions get the same access through the JavaScript clipboard API once granted.

### Is Universal Clipboard secure?

The transport is encrypted, but the model assumes every device on your Apple ID is trusted. A clipboard you copy on your Mac is immediately readable on any iPhone, iPad, or other Mac signed in to that Apple ID. Share the Apple ID, share the clipboard.

### Where do clipboard managers like Maccy or Paste store my history?

Most local managers keep an SQLite or property list database under `~/Library/Application Support`, typically as plain text. Paste pushes history to iCloud via CloudKit — restoring the device restores the history.

### I think I already pasted something I shouldn't have. What now?

Audit afterwards is useful, but the urgent task is rotation. The companion piece [I accidentally pasted a password or API key](https://clipgate.github.io/blog/accidentally-pasted-password-or-api-key/) is the step-by-step recovery playbook for that exact moment.

---

If you'd rather use a clipboard manager built on these principles, ClipGate is open source and local-only by default. Install with: `curl -fsSL https://clipgate.github.io/install.sh | sh`

*Canonical source: [clipgate.github.io/blog/macos-clipboard-history-what-leaks](https://clipgate.github.io/blog/macos-clipboard-history-what-leaks/).*
