const assert = require('node:assert/strict');
const { beautify } = require('./app.js');

assert.equal(beautify('One sentence.   Two sentences! Three sentences? Four sentences.', { length: 2 }), 'One sentence. Two sentences!\n\nThree sentences? Four sentences.');
assert.equal(beautify('  Hello   there.\nThis   is a note.  ', { mode: 'cleanup' }), 'Hello there. This is a note.');
assert.equal(beautify("It's   a draft. Let's   tidy it. This works.", { length: 2 }), "It's a draft. Let's tidy it.\n\nThis works.");
assert.equal(beautify('First paragraph.\n\n\nSecond paragraph.'), 'First paragraph.\n\nSecond paragraph.');
assert.equal(beautify('Dr. Smith is here. Welcome back. More text.', { length: 2 }), 'Dr. Smith is here. Welcome back.\n\nMore text.');
const fenced = '```js\nconst value = "a   b";\n\n\n  return value;\n```';
assert.equal(beautify(fenced), fenced);
const structured = '{\n  "message": "a   b",\n  "large": 99999999999999999999\n}';
assert.equal(beautify(structured), structured);
assert.equal(beautify('- item one\n- item two\n    indented code'), '- item one\n- item two\n    indented code');
assert.equal(beautify(''), '');
assert.equal(beautify(' \n\t '), '');
const examples = [fenced, structured, 'café 你好 🌿\r\n\r\nMore text. Next thought!', 'Email: hi@example.com. Total: $1,234.56. ID: 000123.', 'First line\nsecond line\n\nThird line.', '### Header\n> A quote\n1. Task one\n2. Task two'];
for (const original of examples) {
  for (const mode of ['cleanup', 'paragraphs']) {
    const output = beautify(original, { mode, length: 2 });
    assert.equal(output.replace(/\s/g, ''), original.replace(/\s/g, ''));
    assert.equal(beautify(output, { mode, length: 2 }), output);
  }
}
console.log('All formatting, preservation, and repeat-formatting checks passed.');
