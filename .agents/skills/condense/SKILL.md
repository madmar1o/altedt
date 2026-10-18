---
name: summarize-condense
description: Produce a comprehensive multi-method summary combining all summarization techniques into one document. Use when user wants the deepest possible digest of important content — books, papers, or complex topics.
---

# Condense (All Methods)

The full pipeline. Combines all 7 methods into one comprehensive digest. For content you need to truly master.

## Pipeline

Run methods in this order. Each builds on the previous.

### Phase 1: Structure (Adler + SQ3R)
1. **Adler Inspectional** — classify, identify thesis, outline structure
2. **SQ3R Survey** — skim headings, intro, conclusion
3. **SQ3R Questions** — turn headings into questions

### Phase 2: Capture (Cornell)
4. **Cornell Notes** — two-column capture of key ideas

### Phase 3: Understand (Feynman + Concept Map)
5. **Feynman** — explain core concepts in plain language
6. **Concept Map** — visualize relationships between ideas

### Phase 4: Retain (Retrieval + Spaced)
7. **Retrieval Practice** — free recall, identify gaps
8. **Spaced Repetition** — generate flashcard set from key facts

## Output Format

```markdown
---
created: YYYY-MM-DD
updated: YYYY-MM-DD
method: condense
source: [title or URL]
tags: [relevant tags]
---

# [Title] — Full Digest

---

## 1. Inspectional Overview (Adler)
[Classification, thesis in one paragraph, structure outline]

---

## 2. Questions (SQ3R)
[Turned headings into questions]

---

## 3. Cornell Notes
| Preguntas | Notas |
|-----------|-------|
| ... | ... |

**Resumen:** [3-5 sentences]

---

## 4. Feynman Explanation
[Core concepts explained simply, with gaps found]

---

## 5. Concept Map
[Text-based map of key concepts and relationships]

---

## 6. Retrieval Practice
**What I remember:** [from memory]
**What I missed:** [gaps]
**Retention score:** [X%]

---

## 7. Spaced Repetition Cards
### Box 1 (Daily)
- Q: ... A: ...
### Box 2 (Every 2-3 days)
- Q: ... A: ...
### Box 3 (Weekly)
- Q: ... A: ...

---

## 8. Critical Assessment
[Agreements, disagreements, what's missing, connections to other works]

---

## 9. Review Schedule
| Date | Method | Focus |
|------|--------|-------|
| Tomorrow | Retrieval | All Box 1 cards |
| Day 3 | Cornell | Re-read notes, cover questions |
| Day 7 | Feynman | Re-explain from memory |
| Day 14 | Concept Map | Rebuild map from scratch |
| Day 30 | Spaced | Review Box 1-3 cards |
```

## Time Estimate

- Phase 1: ~5 min (automated)
- Phase 2: ~5 min (automated)
- Phase 3: ~5 min (automated)
- Phase 4: ~3 min (automated)
- Total: ~18 min for a full digest

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
- Technical terms in English when standard
- Each section can have its own language rules
