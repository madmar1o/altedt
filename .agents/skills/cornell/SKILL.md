---
name: summarize-cornell
description: Summarize using Cornell Notes method — structured two-column notes with keyword/questions and summary. Use when summarizing lectures, videos, meetings, or any content where you need organized notes.
---

# Cornell Notes Method

Developed by Walter Pauk at Cornell University. Divides notes into three zones for maximum retention.

## Layout

```
┌─────────────────────────┬───────────────────────────┐
│  Keywords / Questions   │  Notes                    │
│  (write AFTER reading)  │  (capture DURING reading) │
│                         │                           │
│                         │                           │
│                         │                           │
│                         │                           │
│                         │                           │
│                         │                           │
│                         │                           │
├─────────────────────────┴───────────────────────────┤
│  Summary (write LAST, in own words, max 5 sentences) │
└─────────────────────────────────────────────────────┘
```

## Steps

1. **Notes column** (right): Capture main ideas, examples, data, quotes DURING reading
   - Don't over-organize — just capture
   - Use abbreviations, bullet points
   - One idea per line

2. **Keywords/Questions column** (left): Create AFTER reading
   - Transform each note into a question or keyword
   - This is the retrieval step — forces active processing
   - Use: "¿Qué es X?", "¿Por qué X?", "X vs Y"

3. **Summary** (bottom): Write LAST
   - 3-5 sentences in own words
   - No looking at notes
   - The essence of the entire content

## Output Format

```markdown
---
created: YYYY-MM-DD
updated: YYYY-MM-DD
method: cornell
source: [title or URL]
tags: [relevant tags]
---

# [Title] — Cornell Notes

| Preguntas / Keywords | Notas |
|---------------------|-------|
| ¿Qué es X? | X es... |
| ¿Por qué Y? | Porque... |
| X vs Y | Diferencia clave:... |

### Resumen
[3-5 sentences in own words]
```

## Study Tip

Cover the Notes column with your hand. Read only the Questions column and try to answer from memory. This is retrieval practice (Karpicke, 2012) and is more effective than re-reading.

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
- Questions in Spanish
