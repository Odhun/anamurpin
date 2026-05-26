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

const BLACKLIST_RAW: string[] = [
  // ── am* varyantları ───────────────────────────────────────────────────────
  'amcığını', 'amcığınızı', 'amg', 'amk', 'amk çocuğu', 'amk.',
  'amkafa', 'amlarnzn', 'amlı', 'amm', 'ammak', 'ammına', 'ammna',
  'amn', 'amna', 'amnda', 'amndaki', 'amngtn', 'amnn',
  'amsiz', 'amsz', 'amsız', 'amteri', 'amugaa', 'amuna', 'amuğa',
  'amına', 'amına g', 'amına k', 'amına koy', 'amına koyarım',
  'amına koyayım', 'amına koyim', 'amına koyyim', 'amına s',
  'amına sikem', 'amına sokam', 'amınadürzü', 'amınako',
  'amınakoyim', 'amınoğlu', 'amını', 'amını s', 'amısına', 'amısını',
  'amına', 'amına koyarım', 'amına koyayım',
  'aminakoyarim', 'aminakoyayim', 'aminakoyim', 'amina',
  'amın', 'amın feryadı', 'amın oglu', 'amın oğlu',
  'amıg', 'amık', 'amiyum', 'amq', 'amona',

  // ── anan* / ana hakaret varyantları ──────────────────────────────────────
  'anani', 'anani sikerim', 'anani sikeyim', 'ananin',
  'ananisikerim', 'ananisikeyim', 'ananı sikerim', 'ananı sikeyim',
  'ananın', 'ananın am', 'ananın amı', 'ananın dölü', 'ananınki',
  'ananısikerim', 'ananısikeyim', 'ananızı', 'ananızın',
  'ananızın am', 'anasının am', 'anasını', 'anasının', 'anasını avradını',
  'anası orospu', 'anneni', 'annenin', 'annesiz',
  'babanı', 'babanın', 'babası pezevenk',
  'bacını', 'bacına', 'bacın', 'bacının',

  // ── sik* varyantları ─────────────────────────────────────────────────────
  'sik', 'sik kırığı', 'sikdi', 'sikdiğim', 'sike', 'sikecem',
  'sikem', 'siken', 'sikenin', 'siker', 'sikerim', 'sikerler',
  'sikersin', 'sikert', 'sikertir', 'sikertirler', 'sikertmek',
  'sikesen', 'sikesicenin', 'sikey', 'sikeydim', 'sikeyim', 'sikeym',
  'siki', 'sikicem', 'sikici', 'sikien', 'sikienler',
  'sikiiim', 'sikiiimmm', 'sikiim', 'sikiir', 'sikiirken',
  'sikik', 'sikil', 'sikildiini', 'sikilesice', 'sikilmi',
  'sikilmie', 'sikilmis', 'sikilmiş', 'sikilsin', 'sikim',
  'sikimde', 'sikimden', 'sikime', 'sikimi', 'sikimiin', 'sikimin',
  'sikimle', 'sikimsonik', 'sikimtrak', 'sikin', 'sikinde',
  'sikinden', 'sikine', 'sikini', 'sikip', 'sikis', 'sikisek',
  'sikisen', 'sikish', 'sikismis', 'sikitiin', 'sikiyim', 'sikiym',
  'sikiyorum', 'sikiş', 'sikişen', 'sikişken', 'sikişme', 'sikişmek',
  'sikkim', 'sikko', 'sikleri', 'sikleriii', 'sikli', 'sikm',
  'sikmek', 'sikmem', 'sikmeyi', 'sikmiler', 'sikmisligim',
  'siksem', 'sikseydin', 'sikseyidin', 'siksin', 'siksinbaya',
  'siksinler', 'siksiz', 'siksok', 'siksz', 'sikt', 'sikti',
  'siktigimin', 'siktigiminin', 'siktii', 'siktiim', 'siktiimin',
  'siktiiminin', 'siktiler', 'siktim', 'siktimin', 'siktiminin',
  'siktin', 'siktir', 'siktir et', 'siktir git', 'siktir lan',
  'siktir ol git', 'siktirgit', 'siktirir', 'siktiririm',
  'siktiriyor', 'siktirolgit', 'siktirsin', 'siktiğim',
  'siktiğimin', 'siktiğiminin', 'siktr', 'siqem',
  's.ikerim', 's.iktm', 's.ktir', 's.tir',
  's1kerim', 's1kerm', 's1krm',
  'skcem', 'skecem', 'skem', 'sker', 'skerim', 'skerm', 'skeyim',
  'skiim', 'skik', 'skim', 'skime', 'skiym', 'skm', 'skmek',
  'skrm', 'sksin', 'sksn', 'sksz', 'sktiimin', 'sktim', 'sktir',
  'sktirsin', 'sktr', 'sktroradan', 'sktrr', 'sktrsn', 'skyim',
  'sıkerım', 'sıkm', 'sıktır', 'sıecem', 'dkerim',

  // ── yarak/yarrak varyantları ──────────────────────────────────────────────
  'yarak', 'yaraksız', 'yaraktr', 'yaram', 'yaraminbasi', 'yaramn',
  'yararmorospunun', 'yark', 'yarra', 'yarraaaa', 'yarraak',
  'yarraam', 'yarraamı', 'yarragi', 'yarragimi', 'yarragina',
  'yarragindan', 'yarragm', 'yarraimin', 'yarrak', 'yarram',
  'yarramin', 'yarraminbaşı', 'yarramn', 'yarramın', 'yarran',
  'yarrana', 'yarrağ', 'yarrağım', 'yarrağımı', 'yarrk', 'yarro',
  'yarrrak', 'yaaraaa', 'yaraaam', 'yrak', 'yrk', 'yrrak',
  'dalyarak', 'dalyarrak', 'daltassak',

  // ── göt varyantları ───────────────────────────────────────────────────────
  'göt', 'göt deliği', 'göt herif', 'göt oğlanı', 'göt veren',
  'göt verir', 'göte', 'götelek', 'götlalesi', 'götlek', 'götoğlanı',
  'götoş', 'götsün', 'götsünüz', 'götten', 'götveren', 'götvern',
  'götü', 'götün', 'götüne', 'götüne koyim', 'götünekoyim', 'götünü',
  'götünüze', 'götüyle',
  'got', 'gotelek', 'gotlalesi', 'gotlu', 'gotten', 'gotundeki',
  'gotunden', 'gotune', 'gotunu', 'gotuze', 'gotveren',
  'g*t', 'g*tü', 'g*tün', 'g*tüne', 'g.t',
  'gtn', 'gtnde', 'gtnden', 'gtne', 'gtten', 'gtveren', 'gtelek',
  'koduumun', 'kodumunun', 'kodumun', 'koduğmun', 'koduğmunun',
  'godumun', 'godoş', 'gotveren',
  'goyiim', 'goyum', 'goyuyim', 'goyyim',
  'giberim', 'giberler', 'gibis', 'gibiş', 'gibmek', 'gibtiler',

  // ── orospu varyantları ────────────────────────────────────────────────────
  'orospu', 'orospu cocugu', 'orospu çoc', 'orospu çocukları',
  'orospu çocuğu', 'orospu çocuğudur', 'orospucocugu', 'orospudur',
  'orospular', 'orospunun', 'orospunun evladı', 'orospuydu',
  'orospuyuz', 'orospuçocuğu', 'orostoban', 'orostopol',
  'orrospu', 'oruspu', 'oruspu çocuğu', 'oruspuçocuğu',
  'orosp', 'orosbococugu', 'orosbucocuu',

  // ── ibne varyantları ──────────────────────────────────────────────────────
  'ibne', 'ibina', 'ibine', 'ibinenin', 'ibnedir', 'ibneler',
  'ibneleri', 'ibnelik', 'ibneliği', 'ibnelri', 'ibneni', 'ibnenin',
  'ibnerator', 'ibnesi', 'ipne', 'ipneler', 'ıbnelık',

  // ── bok varyantları ───────────────────────────────────────────────────────
  'bok', 'boka', 'bokbok', 'bokhu', 'bokkkumu', 'boklar', 'boktan',
  'boku', 'bokubokuna', 'bokum', 'bokça', 'bombok', 'b.k',
  'sıçarım', 'sıçmak', 'sıçtığım', 'si.çmak', 'sicmak', 'sicti',
  'ossurduum', 'ossurmak', 'ossuruk', 'osur', 'osuram', 'osurduu',
  'osuruk', 'osururum', 'ağzına sıçayım', 'bacağına sıçayım',

  // ── kahpe / kaltak / fahişe grubu ─────────────────────────────────────────
  'kahpe', 'kahpenin', 'kahpenin feryadı', 'kahpeler', 'kahpece',
  'kaltak', 'fahise', 'fahişe', 'surtuk', 'sürtük', 'kevase',
  'kevaşe', 'kevvase', 'karhane', 'kerhane', 'kerhanelerde',

  // ── pezevenk / gavat grubu ────────────────────────────────────────────────
  'pezevek', 'pezeven', 'pezeveng', 'pezevengi', 'pezevengin evladı',
  'pezevenk', 'pezevenkler', 'pezo', 'gavad', 'gavat', 'kavat',
  'kavat', 'kavatn',

  // ── piç varyantları ───────────────────────────────────────────────────────
  'pic', 'pici', 'picler', 'piç', 'piç kurusu', 'piçi',
  'piçin oğlu', 'piçinin', 'piçler', 'piçsin', 'piçsiniz',

  // ── şerefsiz varyantları ──────────────────────────────────────────────────
  'serefsiz', 'serefsz', 'serefszler', 'şerefsiz', 'şerefsizler',
  'şerefsizlerin', 'şerefsizlik', 'haysiyetsiz', 'cibiliyetsiz',
  'cibilliyetini', 'cibilliyetsiz',

  // ── gerzek / gerizekalı grubu ─────────────────────────────────────────────
  'gerzek', 'gerizekal', 'gerizekalı', 'gerizekalıdır', 'gerizekali',
  'gerızekalı', 'geri zekalı', 'gerizekalılık',

  // ── domalmak / cinsel eylem varyantları ───────────────────────────────────
  'domal', 'domalan', 'domaldı', 'domaldın', 'domalmak', 'domalmış',
  'domalsın', 'domalt', 'domaltarak', 'domaltip', 'domaltmak',
  'domaltıp', 'domaltır', 'domaltırım', 'domalık', 'domalıyor',
  'sikişelim', 'seviş', 'sevişelim', 'sevişmek',
  'otusbir', 'otuzbir', 'sakso', 'saksofon', 'saxo', 'ensest',
  'pompalama', 'pompalamak', 'tokmaklama', 'tokmaklamak',
  'yogurtlayam', 'yoğurtlayam', 'laciye boyadım',
  'sekis', 'seks', 'sex', 'sexs', 'porno', 'porn', 'erotik',
  'bızır', 'çük', 'dildo',

  // ── küfür kısaltmaları / harf kombinasyonları ─────────────────────────────
  'aq', 'aq.', 'o.ç', 'o.ç.', 'o ç', 'o. çocuğu', 'oç', 'oç.',
  'oc', 'ocuu', 'ocuun', 'mk', 'mna', 'amk.', 'amq',
  'k.o.c', 'k.o.ç', 'l.an', 'p kk',

  // ── diğer Türkçe küfür / hakaret ─────────────────────────────────────────
  'ebleh', 'embesil', 'dangalak', 'dallama', 'veled', 'veled i zina',
  'veledizina', 'weled', 'weledizina', 'ecdadını', 'ecdadini',
  'sülaleni', 'sülalenizi', 'sulaleni', 'slaleni',
  'avradını', 'avrat', 'dönek', 'dürzü', 'moron',
  'gavurun dölü', 'dölü', 'sütü bozuk', 'kanı bozuk',
  'alcak', 'aşağılıksın', 'aşağılıksınız', 'aşağlık',
  'kafasiz', 'kafasız', 'mankafa', 'atkafası',
  'yalaka', 'yalama', 'yalarun', 'yalarım',
  'yavşak', 'yavşaktır', 'yavşamak', 'yavş', 'yavak', 'yavuşak',
  'kıro', 'hödük', 'hıyar', 'hıyarağası', 'hırsız',
  'sahtekar', 'dalaksız', 'dasak', 'dassagi', 'dassak', 'daşak',
  'daşşak', 'daşşaksız', 'taşak', 'taşşak', 'tasak', 'tassak',
  'puşt', 'puşttur', 'homo', 'liboş', 'lavuk',
  'ezik', 'beyinsiz', 'odun', 'okuz', 'zibidi',
  'atmık', 'attrrm', 'attırdığım', 'boner', 'sperm',
  'has siktir', 'hasiktir', 'hasiktr', 'hassikome', 'hassiktir',
  'hassittir', 'hastir', 'hsktr',
  'kafam girsin', 'giren çıkan',
  'itoğlu it', 'hayvan herif', 'köpeginin',
  'eben', 'ebeni', 'ebenin', 'ebeninki',
  'madafaka', 'goddamn',
  'kıç', 'kıçınız', 'kıçınıza',
  'malafat', 'moloz',

  // ── İngilizce küfür / hakaret ─────────────────────────────────────────────
  'fuck', 'fucker', 'fuckers', 'fucking', 'fucked', 'fucks', 'fuckyou',
  'motherfucker', 'motherfuckers', 'mofo',
  'shit', 'shitty', 'bullshit',
  'cunt', 'cunts',
  'bitch', 'bitches',
  'nigger', 'niggers', 'nigga', 'niggas',
  'faggot', 'faggots', 'fag',
  'asshole', 'assholes', 'dickhead',
  'cocksucker',
  'pussy',
  'whore', 'whores',
  'slut', 'sluts',
  'bastard', 'bastards',
  'wanker', 'wankers',
  'twat', 'twats',
  'retard', 'retards', 'retarded',
  'ass', 'idiot',
];

// Pre-normalize entire list once at module load
const BLACKLIST = BLACKLIST_RAW.map(normalize);

export function containsBlacklisted(text: string): boolean {
  const norm = normalize(text);
  const words = norm.split(/[^a-z0-9]+/).filter(Boolean);

  for (const term of BLACKLIST) {
    if (term.includes(' ')) {
      if (norm.includes(term)) return true;
    } else {
      if (words.includes(term)) return true;
    }
  }
  return false;
}

const LINK_RE = /https?:\/\//i;
const WWW_RE = /www\.[a-z0-9]/i;
const DOMAIN_RE =
  /\b[a-z0-9][a-z0-9-]{1,63}\.(com|net|org|tr|io|co|app|xyz|info|biz|tv|me|gov|edu|de|uk|fr|ru|social|online|store|shop|link|click|page|site|web)\b/i;

export function containsLink(text: string): boolean {
  return LINK_RE.test(text) || WWW_RE.test(text) || DOMAIN_RE.test(text);
}
