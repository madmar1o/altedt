---
name: smart-summarize
description: Choose the best summarization method based on content type and automatically produce a high-quality summary. Use when user asks to summarize without specifying a method.
---

# Smart Summarize (Auto)

Automatically selects the best summarization method based on content.

## Method Selection

| Content Type | Method | Why |
|-------------|--------|-----|
| Complex concept / theory | **feynman** | Forces simplification |
| Book / textbook | **adler** | Multi-level analysis |
| Article / blog post | **sq3r** | Structure-aware reading |
| Lecture / video / meeting | **cornell** | Two-column note-taking |
| Facts / definitions / vocabulary | **spaced** | Long-term retention |
| Academic paper | **retrieval** | Active recall strengthens memory |
| Multiple related concepts | **concept-map** | Reveals relationships |
| Full synthesis needed | **condense** | All methods combined |

## Workflow

1. Identify content type and user goal
2. Select method from table above
3. Announce: "Usando método **[X]** porque [reason]"
4. Apply the selected method
5. Deliver summary with YAML frontmatter

## Frontmatter

```yaml
---
created: YYYY-MM-DD
updated: YYYY-MM-DD
method: [selected method]
source: [title or URL]
tags: [relevant tags]
---
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
- Technical terms keep original English when standard
- Clear, direct, no filler
