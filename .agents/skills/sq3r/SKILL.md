---
name: summarize-sq3r
description: Summarize using the SQ3R method (Survey, Question, Read, Recite, Review). Use when summarizing books, textbook chapters, or long-form articles where structure matters.
---

# SQ3R Method

From Francis P. Robinson's *Effective Study* (1941). Active reading through 5 structured steps.

## Steps

### 1. Survey (S)
- Skim: table of contents, headings, intro, conclusion, first sentences of sections
- Time: 3-5 minutes
- Goal: build a mental map of the structure
- Output: outline of main sections and thesis

### 2. Question (Q)
- Turn each heading/subheading into a question
- Add 2-3 general questions:
  - What is this about?
  - What problem does it solve?
  - How does this help me?
- Output: list of questions to answer while reading

### 3. Read (R)
- Read actively, seeking answers to the questions
- Mark key passages, arguments, evidence
- Do NOT passively highlight — engage with the content
- Output: key points per question

### 4. Recite (R)
- Close the source. From memory, recite the answers
- Write in own words — no copying
- This is the retrieval practice step (Karpicke, 2012)
- Output: recall notes from memory

### 5. Review (R)
- Compare recitation with source
- Identify what was recalled correctly vs. missed
- Create final synthesis
- Output: final summary + review schedule

## Output Format

```markdown
---
created: YYYY-MM-DD
updated: YYYY-MM-DD
method: sq3r
source: [title or URL]
tags: [relevant tags]
---

# [Title] — SQ3R Summary

## Survey
[Structure overview: what type of content, main thesis, key sections]

## Questions
1. Q: [from heading] → A: [answer]
2. Q: [from heading] → A: [answer]
3. Q: [general] → A: [answer]

## Recitation (from memory)
[What I remembered without looking]

## Review
[What I missed + final synthesis]

## Next Steps
[What to revisit, related topics to explore]
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
- Questions in Spanish, technical terms in English when standard
