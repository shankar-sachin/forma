/* Formatting is deliberately whitespace-only; never rewrite the user's content. */
(function () {
  'use strict';

  const significant = text => text.replace(/\s/g, '');
  const isProtectedLine = line => /^(?:\s*(?:[-*+]\s|\d+[.)]\s|#{1,6}\s|>\s|\|)|\t| {4})/.test(line);

  function sentences(text) {
    // Break only at a plausible sentence ending. Abbreviations remain intact.
    const pieces = [];
    const endings = /[.!?]+["'”’)]*\s+(?=[A-Z“"'‘])/g;
    let start = 0;
    for (const match of text.matchAll(endings)) {
      const preceding = text.slice(start, match.index + 1);
      if (/(?:\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|vs|etc)|\b[A-Z])\.$/.test(preceding)) continue;
      const end = match.index + match[0].trimEnd().length;
      pieces.push(text.slice(start, end));
      start = match.index + match[0].length;
    }
    pieces.push(text.slice(start));
    return pieces.filter(Boolean);
  }

  function beautify(original, { mode = 'paragraphs', length = 3 } = {}) {
    const size = Math.max(1, Math.min(10, Number(length) || 3));
    const lines = original.replace(/\r\n?/g, '\n').split('\n');
    const result = [];
    let prose = [], fence = null;
    const flush = () => {
      if (!prose.length) return;
      const text = prose.join(' ').replace(/\s+/g, ' ').trim();
      if (mode === 'cleanup') result.push(text);
      else {
        const parts = sentences(text);
        const paragraphs = [];
        for (let i = 0; i < parts.length; i += size) paragraphs.push(parts.slice(i, i + size).join(' '));
        result.push(paragraphs.join('\n\n'));
      }
      prose = [];
    };
    for (const line of lines) {
      const marker = line.match(/^\s*(`{3,}|~{3,})/);
      if (fence) {
        result.push(line);
        if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && /^\s*(?:`+|~+)\s*$/.test(line)) fence = null;
      } else if (marker) {
        flush(); fence = marker[1]; result.push(line);
      } else if (!line.trim()) {
        flush();
        if (result.length && result[result.length - 1] !== '') result.push('');
      } else if (isProtectedLine(line) || /[\[\]{}]/.test(line) || /["`]/.test(line)) {
        // Preserve quoted content and structured lines, including indentation.
        flush(); result.push(line);
      } else {
        prose.push(line);
      }
    }
    flush();
    const formatted = result.join('\n').replace(/^\n+|\n+$/g, '');
    // Fail safely if a future change ever alters a non-whitespace character.
    return significant(original) === significant(formatted) ? formatted : original;
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { beautify, sentences };
  if (typeof document === 'undefined') return;

  const $ = id => document.getElementById(id);
  const input = $('input'), output = $('output');
  let mode = 'paragraphs', toastTimer;
  const wordCount = text => (text.match(/\S+/g) || []).length;
  const countLabel = text => `${wordCount(text).toLocaleString()} words · ${text.length.toLocaleString()} characters`;
  function update() {
    const formatted = beautify(input.value, { mode, length: $('length').value });
    const hasText = Boolean(input.value.trim());
    output.value = formatted;
    output.hidden = !hasText;
    $('empty').hidden = hasText;
    $('input-count').textContent = countLabel(input.value);
    $('output-count').textContent = hasText ? countLabel(formatted) : 'Ready when you are';
    $('verified').hidden = !hasText;
    $('copy').disabled = $('download').disabled = !hasText;
    $('clear').disabled = !input.value;
  }
  function toast(message) {
    clearTimeout(toastTimer);
    $('toast').textContent = message;
    $('toast').classList.add('visible');
    toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 2600);
  }
  input.addEventListener('input', update);
  $('length').addEventListener('change', update);
  document.querySelectorAll('.mode').forEach(button => button.addEventListener('click', () => {
    mode = button.dataset.mode;
    document.querySelectorAll('.mode').forEach(tab => {
      tab.classList.toggle('active', tab === button);
      tab.setAttribute('aria-pressed', String(tab === button));
    });
    $('length').disabled = mode === 'cleanup';
    update();
  }));
  $('sample').addEventListener('click', () => {
    input.value = 'A good idea needs room to breathe.    Sometimes we write everything in one long rush. The words are there, but the space between them gets lost.    A little structure makes a big difference. It gives each thought a place to land. And it makes the next step easier to see.\n\nThe details still matter.    Keep the names, numbers, and meaning exactly as they are. Let the formatting do the quiet work.\n\n- Review the draft\n- Share it with the team\n- Make something great';
    update();
  });
  $('clear').addEventListener('click', () => { input.value = ''; update(); input.focus(); });
  $('copy').addEventListener('click', async () => {
    let clipboardTimeout;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await Promise.race([
        navigator.clipboard.writeText(output.value),
        new Promise((_, reject) => { clipboardTimeout = setTimeout(() => reject(new Error('Clipboard timed out')), 1500); })
      ]);
      toast('Formatted text copied');
    } catch {
      output.focus(); output.select();
      try {
        if (!document.execCommand('copy')) throw new Error('Copy unavailable');
        toast('Formatted text copied');
      } catch { toast('Text selected. Press Ctrl+C or ⌘C to copy.'); }
    } finally { clearTimeout(clipboardTimeout); }
  });
  $('download').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([output.value], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'formatted-text.txt';
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Formatted text downloaded');
  });
  update();
})();
