---
name: summarize-adler
description: Summarize using Mortimer Adler's four levels of reading from "How to Read a Book". Use when doing a deep, critical analysis of non-fiction books or long-form intellectual content.
---

# Adler's Four Levels of Reading

From Mortimer Adler's *How to Read a Book*. Progressive depth: entertain → inform → understand → master.

## The Four Levels

### Level 1: Elementary (Reading to Entertain)
- Basic literacy — can you follow the text?
- Skip this if the content is familiar

### Level 2: Inspectional (Reading to Inform)
- **Systematic skimming**: TOC, headings, intro, conclusion, index, inside cover
- **Superficial reading**: read through quickly, don't stop on difficult parts
- Goal: decide if deep reading is worth it
- Most pop-science books: this level gives you 90% of the value

### Level 3: Analytical (Reading to Understand)
The real work. Four rules:
1. **Classify** — What kind of content is this?
2. **State the thesis** — What is it about in ONE paragraph?
3. **Outline** — What are the major parts in order?
4. **Define the problem** — What question(s) does it try to answer?

Additional rules:
5. Identify key terms and how the author uses them
6. Identify key propositions (the author's main arguments)
7. Identify the author's arguments (reasoning + evidence)
8. Determine whether the author solved the problem

### Level 4: Syntopical (Reading to Master)
Read multiple works on the same subject:
1. Identify relevant passages across works
2. Translate terminology into your own language
3. Frame your own questions (not just the author's)
4. Define issues where authors disagree
5. Analyze the discussion

## Output Format

```markdown
---
created: YYYY-MM-DD
updated: YYYY-MM-DD
method: adler
source: [title or URL]
tags: [relevant tags]
---

# [Title] — Adler Analysis

## Inspectional Reading
- **Classification**: [What kind of content]
- **Thesis**: [One paragraph]
- **Structure**: [Outline of major parts]

## Analytical Reading
### Key Terms
- [Term]: [Author's definition]

### Key Arguments
1. [Argument]: [Evidence]
2. [Argument]: [Evidence]

### Problems Addressed
- Did the author solve them? [Yes/No/Partially]

## Critical Assessment
### What I agree with
[Points of agreement]

### What I disagree with
[Points of disagreement + reasoning]

### What's missing
[Gaps, unaddressed questions]

## Connections
[Related works, contradictions, extensions]
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
- Original titles and concepts in English with Spanish explanation
