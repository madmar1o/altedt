---
name: feynman-summary
description: End-of-session catch-up explainer that summarizes the current chat using the Feynman technique — layered from a beginner-friendly TL;DR down to technical details and a "where we left off" handoff. Use when the user explicitly asks to catch up, recap, or be debriefed on the session, including /feynman-summary, "feynman summary", "feynman it", "catch me up", "what did we do", "summarize this session", "summarize the chat", "explain what we did", or "debrief". Do not run for casual mid-session questions like "what did you just change?" — only when the user clearly wants a session-wide summary. Always print to chat; never write files.
---

# Feynman Summary

Read the entire conversation and explain it back to the user using the Feynman technique: start with a beginner-friendly analogy, work up through plain-English outcomes, then technical details, and end with a concrete handoff. This is a catch-up tool — the reader is the user's future self walking back to their desk on Monday morning, not a stranger.

**Core Directive:** Synthesize, don't transcribe. Produce a layered summary that the user can stop reading at the depth they need. The most valuable section for catch-up is "Where we left off" — make it concrete.

## Security & Privacy Guardrails
- **CRITICAL:** Do not echo secrets, API keys, tokens, passwords, or personal data even if they appeared in the conversation. Replace with `<redacted>`.
- Redact path segments that contain sensitive identifiers (user IDs, customer names) when summarizing.
- Do not include the contents of `.env`, credentials files, or anything that looked like a secret in tool output.

## Context Window Limitation
- **Check context:** If the start of the conversation has fallen out of your context window, explicitly say so before the summary: *"Note: I can only see the recent part of our conversation, so earlier work may be missing from this summary."*

## The Feynman Technique (applied here)

Richard Feynman's technique is: explain a concept as if teaching a beginner → notice where you stumble or hand-wave → that's a gap in your understanding → refine with simpler language and analogies. Applied to a coding session, the "beginner" is the user's future self with no recall of the last few hours. If your TL;DR can't be understood by someone who didn't watch the session happen, it's not done yet.

## Output Format

Print to chat using this exact template. Omit any section that genuinely has nothing in it — never invent filler to fill a section.

```markdown
## TL;DR (like I'm 5)
<1–3 sentences using a real analogy — Lego, restaurant, recipe, plumbing, etc. The analogy must map cleanly to what actually happened. If a forced analogy would mislead, drop it and use one plain sentence instead.>

## What we did
- <plain-English bullet, no jargon, focused on the outcome the user cares about>
- <one bullet per meaningful change or finding, grouped by intent not by tool call>

## Technical details
- <files touched, functions changed, commands run, errors hit — jargon allowed>
- <reference files as `path/to/file.ts:42` so the user can jump there>

## Where we left off
- **State:** <what's done, what's tested, what's committed vs uncommitted>
- **Next:** <the immediate next step — be specific enough to act on without re-reading the chat>
- **Open questions / risks:** <anything unresolved, flaky, or worth a second look — omit this line if none>
```

## Quality Bar & Anti-Patterns

Only produce a summary that would actually help the user catch up. Skip the rest.

**Do NOT:**
- Restate the user's messages verbatim — synthesize what they were trying to do.
- List every tool call individually. Group by intent: write "explored the auth module" not "ran 7 greps and read 4 files".
- Add praise or filler ("Great session!", "We made amazing progress!"). Stay neutral and useful.
- Force an analogy that doesn't fit. A bad analogy is worse than no analogy.
- Skip "Where we left off" unless the session reached a genuinely clean stopping point (e.g. shipped a PR with nothing pending).
- Write to disk, create a file, or ask "want me to save this?" — chat-only is the design.

**Good examples per section:**
- **TL;DR:** *"Think of our login as a bouncer checking IDs. Today we caught them letting people in with expired IDs, and taught them to check the date too."*
- **What we did:** *"Fixed the bug where expired sessions were still being accepted by the API."*
- **Technical:** *"Added a `iat` claim check in `AuthService.validate()` (`src/auth/service.ts:88`). Migration `0042_session_expiry.sql` adds an index on `sessions.expires_at`."*
- **Where we left off → Next:** *"Run the integration suite locally — it wasn't run after the migration change."*

## Process

### Step 1: Scan
Read the full visible conversation from the first message to the most recent. Note the intent arc — what was the user trying to accomplish, and did it change mid-session?

### Step 2: Identify changes
Pull out: files edited, commands run, decisions made, dead ends hit, questions still open. Group related work; ignore noise (cd commands, `ls` calls, retries).

### Step 3: Draft in reverse order
Write **Where we left off** first (it's the most important and most concrete), then **Technical details**, then **What we did**, then the **TL;DR** last. Analogies are easier to write once you know what you're summarizing.

### Step 4: Self-check (the Feynman gap-finding step)
Re-read your TL;DR. Ask: *"Would someone with no context understand what we built and why it mattered?"* If you used jargon, hand-waved, or had to look something up — rewrite that part more simply. That's the whole technique.

### Step 5: Print
Output to chat. Don't write to disk. Don't offer to save. Don't ask follow-up questions — the summary is the deliverable.
