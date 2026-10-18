---
name: summarize-feynman
description: Summarize using the Feynman Technique — explain complex concepts as if teaching a 12-year-old. Use when user wants a simple, jargon-free explanation of a complex topic, concept, or theory.
---

# Feynman Technique

Based on Richard Feynman's learning method: if you can't explain it simply, you don't understand it.

## Steps

1. **Read** the source material thoroughly
2. **Identify** the core concept(s) — what is this really about?
3. **Explain** it in plain language, as if teaching a 12-year-old
4. **Detect** where jargon, complexity, or hand-waving remains
5. **Simplify** those parts further or go back to source to fill gaps
6. **Document** gaps found — they indicate areas for deeper study

## Output Format

```markdown
---
created: YYYY-MM-DD
updated: YYYY-MM-DD
method: feynman
source: [title or URL]
tags: [relevant tags]
---

# [Concept Name]

## What is it?
[Simple explanation. No jargon. A 12-year-old should understand this.]

## How does it work?
[Step-by-step in plain language. Use analogies if helpful.]

## Why does it matter?
[Real-world relevance, why should anyone care]

## Example
[Concrete example that illustrates the concept]

## Gaps Found
[What was hard to simplify — these are areas for deeper study]
```

## Rules

- NO jargon without immediate explanation
- Use analogies from everyday life
- If a section needs 3+ sentences of setup to explain, it's too complex — simplify
- Every technical term must have a plain-language equivalent in parentheses
- "Gaps Found" is mandatory — this is where the real learning happens

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
- Technical terms keep original English when standard
