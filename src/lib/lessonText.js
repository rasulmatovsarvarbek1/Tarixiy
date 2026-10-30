export function normalizeLessonText(content) {
  let source = '';
  if (Array.isArray(content)) {
    source = content.map(String).join('\n\n');
  } else if (typeof content === 'string') {
    source = content.replace(/\r\n?/g, '\n');
    if (source.trimStart().startsWith('[')) {
      try {
        const parsed = JSON.parse(source);
        if (Array.isArray(parsed)) source = parsed.map(String).join('\n\n');
      } catch { /* oddiy matn */ }
    }
  } else if (content && typeof content === 'object') {
    if (Array.isArray(content.paragraphs)) {
      source = content.paragraphs.map(String).join('\n\n');
    } else if (typeof content.text === 'string') {
      source = content.text;
    }
  }

  source = source.replace(/\r\n?/g, '\n');
  const paragraphs = [];
  const addText = (text) => {
    text.split(/\n[ \t]*\n+/).forEach((part) => {
      const paragraph = part.replace(/\s+/g, ' ').trim();
      if (paragraph) paragraphs.push(paragraph);
    });
  };
  const markerPattern = /\[\s*rasm\s*(\d+)\s*\]/gi;
  let cursor = 0;
  let match;
  while ((match = markerPattern.exec(source)) !== null) {
    addText(source.slice(cursor, match.index));
    paragraphs.push(`[rasm${Number(match[1])}]`);
    cursor = match.index + match[0].length;
  }
  addText(source.slice(cursor));
  return paragraphs.join('\n\n');
}
