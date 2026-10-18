---
name: summarize-retrieval
description: Summarize using Retrieval Practice — read once, then recall from memory. Based on Karpicke's research showing retrieval outperforms re-reading and concept mapping. Use when the goal is long-term retention of facts, concepts, or procedures.
---

# Retrieval Practice

Based on Karpicke & Blunt (2011) — retrieval practice produces more learning than re-reading or concept mapping.

## Core Principle

> The act of retrieving information from memory STRENGTHENS the memory trace. Re-reading creates an illusion of knowledge; retrieving reveals what you actually know.

## Steps

1. **Read once** — read the source material straight through, no notes
2. **Close the source** — put it away completely
3. **Free recall** — write everything you remember, in any order
4. **Compare** — open source, compare recall with original
5. **Identify gaps** — mark what you got right vs. wrong
6. **Repeat** — focus study on gaps, then recall again

## Key Research Findings

- Retrieval beats re-reading for long-term retention (Roediger & Karpicke, 2006)
- Retrieval beats concept mapping (Karpicke & Blunt, 2011)
- Closed-book retrieval > open-book retrieval
- Feedback after retrieval is critical (prevents encoding errors)
- "Desirable difficulty" — harder retrieval = stronger memory

## Output Format

```markdown
---
created: YYYY-MM-DD
updated: YYYY-MM-DD
method: retrieval
source: [title or URL]
tags: [relevant tags]
---

# [Title] — Retrieval Practice

## What I Remember (from memory, no source)
[Free recall — everything you can remember]

## What I Missed
[X] [Concept from source not recalled]
[X] [Detail from source not recalled]

## Key Facts (flashcard-style Q&A)
1. Q: ... A: ...
2. Q: ... A: ...
3. Q: ... A: ...

## Retention Score
[Approximate % of key ideas recalled correctly]

## Review Schedule
- Day 1: Tomorrow
- Day 2: 3 days
- Day 3: 1 week
- Day 4: 2 weeks
```

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

- Spanish by default
- Q&A pairs can be in English if the source is technical
