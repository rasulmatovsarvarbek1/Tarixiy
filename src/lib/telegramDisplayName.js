const invisibleCharacters = /[\p{Cc}\u00AD\u061C\u200B\u200E\u200F\u202A-\u202E\u2060-\u206F\uFEFF]|\u034F/gu;
const hasLetterOrNumber = /[\p{L}\p{N}]/u;
const combiningMark = /^\p{M}$/u;
const emojiModifier = /^[\u{1F3FB}-\u{1F3FF}]$/u;
const regionalIndicator = /^[\u{1F1E6}-\u{1F1FF}]$/u;

function splitGraphemes(value) {
  if (typeof Intl.Segmenter === 'function') {
    return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(value), ({ segment }) => segment);
  }

  return Array.from(value).reduce((segments, character) => {
    const previous = segments[segments.length - 1];
    const joinsPrevious = previous && (
      combiningMark.test(character)
      || emojiModifier.test(character)
      || character === '\u200D'
      || previous.endsWith('\u200D')
      || (regionalIndicator.test(character) && regionalIndicator.test(previous) && Array.from(previous).length === 1)
    );

    if (joinsPrevious) {
      segments[segments.length - 1] += character;
    } else {
      segments.push(character);
    }

    return segments;
  }, []);
}

function cleanName(value) {
  if (typeof value !== 'string') return null;

  const cleaned = value
    .replace(invisibleCharacters, '')
    .replace(/\s+/gu, ' ')
    .trim();
  const graphemes = splitGraphemes(cleaned);
  const name = graphemes.slice(0, 40).join('').trim();

  if (graphemes.length < 2 || !hasLetterOrNumber.test(name)) return null;
  return name;
}

export function getTelegramDisplayName(profile, user = null) {
  const metadata = user?.user_metadata || {};
  const firstName = metadata.first_name || metadata.telegram_first_name;
  const lastName = metadata.last_name || metadata.telegram_last_name;
  const candidates = [
    profile?.ism,
    metadata.full_name,
    metadata.name,
    [firstName, lastName].filter((part) => typeof part === 'string').join(' '),
    metadata.username,
  ];

  for (const candidate of candidates) {
    const name = cleanName(candidate);
    if (name) return name;
  }

  return "O'quvchi";
}
