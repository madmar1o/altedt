---
name: summarize-concept-map
description: Summarize by creating a concept map — identify key concepts and their relationships in a structured visual format. Use when content involves multiple interconnected ideas, systems, or frameworks.
---

# Concept Map

Visualize relationships between ideas. Based on Novak's concept mapping theory — a powerful tool for understanding complex systems of knowledge.

## Steps

1. **Identify concepts** — extract 5-15 key concepts from the source
2. **Define each concept** — one clear sentence per concept
3. **Map relationships** — connect concepts with labeled links
   - Use verbs: "depends on", "includes", "produces", "contrasts with"
   - Direction matters: A → B is different from B → A
4. **Identify hierarchy** — which concepts are broader vs. more specific?
5. **Find cross-links** — connections between concepts in different branches
6. **Create the map** — structured text representation

## Link Types

| Link | Meaning |
|------|---------|
| A → B (includes) | A contains B |
| A → B (depends on) | A requires B |
| A → B (produces) | A generates B |
| A → B (contrasts with) | A is opposite to B |
| A → B (example of) | B is a specific case of A |
| A → B (leads to) | A causes B |
| A ↔ B (related to) | Bidirectional relationship |

## Output Format

```markdown
---
created: YYYY-MM-DD
updated: YYYY-MM-DD
method: concept-map
source: [title or URL]
tags: [relevant tags]
---

# [Title] — Concept Map

## Concepts
- **[Concept 1]**: [One-sentence definition]
- **[Concept 2]**: [One-sentence definition]
- ...

## Relationships
- [Concept 1] →(includes)→ [Concept 2]
- [Concept 1] →(depends on)→ [Concept 3]
- [Concept 2] ↔(contrasts with)→ [Concept 4]

## Map
```
                    [Broadest Concept]
                    /        |        \
            [Sub 1]    [Sub 2]    [Sub 3]
              |      /    \        |
          [Detail] [D1]  [D2]  [Detail]
                        |
                   [Cross-link to Sub 1]
```

## Insights
[What the map reveals about the subject — patterns, gaps, surprising connections]
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

- Concept names in original language
- Link labels in Spanish
- Definitions in Spanish
