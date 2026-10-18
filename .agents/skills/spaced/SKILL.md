---
name: summarize-spaced
description: Summarize by generating a Leitner-system flashcard set for spaced repetition. Use when the goal is long-term memorization of facts, definitions, vocabulary, or procedures.
---

# Spaced Repetition (Leitner System)

Based on Ebbinghaus's forgetting curve (1885) and the Leitner system (1973). New/difficult items are reviewed frequently; old/easy items are reviewed less.

## The Forgetting Curve

Without review, we forget ~50% within 1 hour, ~70% within 24 hours, and ~90% within a week. Spaced repetition interrupts this curve by reviewing at increasing intervals.

## Steps

1. **Extract** key facts, definitions, and concepts from source
2. **Convert** each into a Q&A flashcard
3. **Classify** by difficulty:
   - **Hard**: New or complex — Box 1 (daily review)
   - **Medium**: Somewhat known — Box 2 (every 2-3 days)
   - **Easy**: Well known — Box 3 (weekly)
   - **Mastered**: Automatic — Box 4 (monthly)
4. **Schedule** reviews using the Leitner progression

## Leitner Rules

- Answer correctly → card moves to next box (less frequent review)
- Answer incorrectly → card returns to Box 1 (daily review)
- Always review Box 1 daily
- Review higher boxes at their scheduled interval

## Output Format

```markdown
---
created: YYYY-MM-DD
updated: YYYY-MM-DD
method: spaced
source: [title or URL]
tags: [relevant tags]
---

# [Title] — Spaced Repetition Cards

## 📦 Box 1 — Review Daily (New & Hard)
1. **Q**: ... **A**: ...
2. **Q**: ... **A**: ...
3. **Q**: ... **A**: ...

## 📦 Box 2 — Review Every 2-3 Days
1. **Q**: ... **A**: ...
2. **Q**: ... **A**: ...

## 📦 Box 3 — Review Weekly
1. **Q**: ... **A**: ...

## 📦 Box 4 — Review Monthly (Mastered)
1. **Q**: ... **A**: ...

## Stats
- Total cards: [N]
- Hard (Box 1): [N]
- Medium (Box 2): [N]
- Easy (Box 3): [N]
- Mastered (Box 4): [N]

## How to Use
1. Review Box 1 every day
2. Review Box 2 every 2-3 days
3. Review Box 3 once a week
4. Review Box 4 once a month
5. Correct → promote to next box
6. Incorrect → demote to Box 1
```

## Card Writing Tips

- One concept per card (don't overload)
- Questions should be clear and specific
- Answers should be concise (1-2 sentences max)
- Include examples when helpful
- Use "Why?" cards, not just "What?" cards

## Source Processing

Extract text from the source before applying the method:

1. **PDF with selectable text**: `pdftotext <file.pdf> -`
2. **Scanned PDF** (no text): `ocrmypdf <file.pdf> /tmp/output.pdf --deskew && pdftotext /tmp/output.pdf -`
3. **Large PDF** (>200 pages): extract in chunks with `pdftotext -f N -l M <file.pdf> -`
4. **URL**: fetch and extract readable content (HTML to markdown)
5. **YouTube/Video**: fetch transcript or use video-frames skill
6. **Text/Markdown**: read directly

Always extract to plain text first. If extraction fails, inform the user and ask for an alternative format.

## Language

- Questions in Spanish
- Technical terms in English when standard
- Answers concise
