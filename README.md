# Forma

A responsive, browser-only text beautifier made with HTML, CSS, and JavaScript.

Open `index.html` in a browser. No installation or build step is needed.

- Live formatting with short, balanced, or long paragraphs
- Spacing-only mode
- Copy text and download a UTF-8 `.txt` file
- Preserves words, numbers, punctuation, existing paragraph boundaries, lists, indented code, fenced code blocks, and lines containing quoted or structured data
- Processes text locally; no backend or account

Paragraph grouping uses sentence punctuation and uppercase sentence starts. It is a conservative heuristic, not a grammar or semantic editor. It never adds punctuation. For arbitrary code or whitespace-sensitive data, retain the original file; use fenced code blocks to preserve its formatting.

Run verification with `node test.js`.
# beautifier
