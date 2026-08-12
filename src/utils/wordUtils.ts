// Utility function for dynamic missing letter word generation in Arabic

export function createDisplayWord(fullWord: string, missingLetter: string): string {
  if (!fullWord || !missingLetter) return fullWord || '';

  // Clean or normalize the letter for matching
  let letterToMatch = missingLetter.replace(/ـ/g, '').trim();
  if (letterToMatch === 'هـ') letterToMatch = 'ه';

  // Handle alef variants (أ, إ, آ, ا)
  const isAlef = ['أ', 'إ', 'آ', 'ا'].includes(letterToMatch);

  // Build regex for character + optional attached Arabic diacritics (\u064B-\u0652)
  const charRegexPart = isAlef ? '[أإآا]' : letterToMatch;
  const regex = new RegExp(`${charRegexPart}[\u064B-\u0652]*`, 'g');

  let replaced = false;
  const result = fullWord.replace(regex, (match) => {
    if (!replaced) {
      replaced = true;
      return ' _ ';
    }
    return match;
  });

  // If match wasn't found (e.g. letter not directly in fullWord string due to spelling variant), fallback replacement
  if (!replaced) {
    const chars = fullWord.split('');
    if (chars.length > 2) {
      const mid = Math.floor(chars.length / 2);
      chars[mid] = ' _ ';
      return chars.join('');
    }
  }

  // Clean up multiple spaces
  return result.replace(/\s+/g, ' ').trim();
}
