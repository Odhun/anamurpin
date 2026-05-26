function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

// Normalized (Turkish special chars already converted to ASCII)
const BLACKLIST: string[] = [
  // ── Türkçe küfür / hakaret ──────────────────────────────────────────────
  'amk', 'amina', 'amcik', 'amini', 'aminakoyayim', 'aminakoyim',
  'orospu', 'oruspu', 'orospucocugu', 'orospunun',
  'sik', 'sikerim', 'sikiyor', 'sikis', 'siktir', 'siktirgit',
  'sike', 'sikisin', 'sikeyim', 'sikim',
  'yarrak', 'yarak', 'yarragi',
  'pic', 'piclik', 'picler',
  'ibne', 'ibnelik', 'ibneler',
  'bok', 'boktan',
  'serefsiz', 'serefsize', 'serefsize',
  'kaltak', 'fahise', 'surtuk', 'pezevenk', 'gavat', 'kevas',
  'gerzek', 'gerizekal', 'gerizekalili',
  'kahpe', 'kahpeler',
  'alcak', 'haysiyetsiz',
  'orospu cocugu', 'it herif',

  // ── İngilizce küfür / hakaret ────────────────────────────────────────────
  'fuck', 'fucker', 'fuckers', 'fucking', 'fucked', 'fucks', 'fuckyou',
  'motherfucker', 'motherfuckers', 'mofo',
  'shit', 'shitty', 'bullshit',
  'cunt', 'cunts',
  'bitch', 'bitches',
  'nigger', 'niggers', 'nigga', 'niggas',
  'faggot', 'faggots', 'fags',
  'asshole', 'assholes', 'dickhead',
  'cocksucker', 'cock',
  'pussy',
  'whore', 'whores',
  'slut', 'sluts',
  'bastard', 'bastards',
  'wanker', 'wankers',
  'twat', 'twats',
  'retard', 'retards', 'retarded',
];

export function containsBlacklisted(text: string): boolean {
  const norm = normalize(text);
  const words = norm.split(/[^a-z0-9]+/).filter(Boolean);

  for (const term of BLACKLIST) {
    if (term.includes(' ')) {
      if (norm.includes(normalize(term))) return true;
    } else {
      if (words.includes(term)) return true;
    }
  }
  return false;
}

const LINK_RE = /https?:\/\//i;
const WWW_RE = /www\.[a-z0-9]/i;
// Matches "something.com" style — requires 2+ chars before dot + known TLD
const DOMAIN_RE =
  /\b[a-z0-9][a-z0-9-]{1,63}\.(com|net|org|tr|io|co|app|xyz|info|biz|tv|me|gov|edu|de|uk|fr|ru|social|online|store|shop|link|click|page|site|web)\b/i;

export function containsLink(text: string): boolean {
  return LINK_RE.test(text) || WWW_RE.test(text) || DOMAIN_RE.test(text);
}
