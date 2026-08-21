// Montant en toutes lettres pour les devis/factures imprimés ("Arrêté à la somme de : ...").
// Orthographe classique (pré-1990), celle des chèques/factures : quatre-vingts / quatre-vingt-un
// (le 's' saute dès qu'un nombre suit — y compris "mille", qui ne prend jamais 'un' ni 's' devant
// lui, contrairement à million/milliard qui sont des noms et prennent 'de' devant le nom compté
// quand ils terminent le nombre).

const UNITS_0_19 = [
  'zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
  'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf',
];

const TENS_WORDS: Record<number, string> = { 2: 'vingt', 3: 'trente', 4: 'quarante', 5: 'cinquante', 6: 'soixante' };

type Below100Opts = { noPluralIfWhole?: boolean };

function convertBelow100(n: number, opts: Below100Opts = {}): string {
  if (n < 20) return UNITS_0_19[n];

  if (n < 70) {
    const t = Math.floor(n / 10);
    const u = n % 10;
    if (u === 0) return TENS_WORDS[t];
    if (u === 1) return `${TENS_WORDS[t]} et un`;
    return `${TENS_WORDS[t]}-${UNITS_0_19[u]}`;
  }

  if (n < 80) {
    const rem = n - 60; // 10..19
    if (rem === 11) return 'soixante et onze';
    return `soixante-${UNITS_0_19[rem]}`;
  }

  // 80..99 : "quatre-vingt" ne prend jamais "et", même pour 81 ("quatre-vingt-un").
  if (n === 80) return opts.noPluralIfWhole ? 'quatre-vingt' : 'quatre-vingts';
  return `quatre-vingt-${UNITS_0_19[n - 80]}`;
}

function convertBelow1000(n: number, opts: Below100Opts = {}): string {
  if (n === 0) return '';

  const centaines = Math.floor(n / 100);
  const reste = n % 100;

  let out = '';
  if (centaines === 1) {
    out = 'cent';
  } else if (centaines > 1) {
    const pluralizeCent = reste === 0 && !opts.noPluralIfWhole;
    out = `${UNITS_0_19[centaines]} cent${pluralizeCent ? 's' : ''}`;
  }

  if (reste > 0) {
    const resteWords = convertBelow100(reste, opts);
    out = out ? `${out} ${resteWords}` : resteWords;
  }

  return out;
}

// Découpe en tranches de mille et compose le nombre entier. Retourne aussi si le nombre se
// termine "sec" sur million/milliard (auquel cas le nom compté qui suit prend "de" : "un million
// de dinars", jamais devant "mille" : "mille dinars", ni quand un reste suit : "deux millions cinq
// cent mille dinars").
function convertInteger(n: number): { words: string; needsDe: boolean } {
  if (n === 0) return { words: 'zéro', needsDe: false };

  let reste = n;
  const milliard = Math.floor(reste / 1_000_000_000);
  reste -= milliard * 1_000_000_000;
  const million = Math.floor(reste / 1_000_000);
  reste -= million * 1_000_000;
  const mille = Math.floor(reste / 1000);
  reste -= mille * 1000;

  const parts: string[] = [];
  if (milliard > 0) parts.push(milliard === 1 ? 'un milliard' : `${convertBelow1000(milliard)} milliards`);
  if (million > 0) parts.push(million === 1 ? 'un million' : `${convertBelow1000(million)} millions`);
  if (mille > 0) parts.push(mille === 1 ? 'mille' : `${convertBelow1000(mille, { noPluralIfWhole: true })} mille`);
  if (reste > 0) parts.push(convertBelow1000(reste));

  const needsDe = mille === 0 && reste === 0 && (million > 0 || milliard > 0);

  return { words: parts.join(' '), needsDe };
}

export function nombreEnLettres(montant: number | string): string {
  const value = typeof montant === 'string' ? Number(montant) : montant;
  if (!Number.isFinite(value)) return '';

  const negative = value < 0;
  const totalCentimes = Math.round(Math.abs(value) * 100);
  const entier = Math.floor(totalCentimes / 100);
  const centimesPart = totalCentimes % 100;

  const { words, needsDe } = convertInteger(entier);
  let out = `${words} ${needsDe ? 'de ' : ''}dinar${entier > 1 ? 's' : ''} algérien${entier > 1 ? 's' : ''}`;

  if (centimesPart > 0) {
    const { words: centimesWords } = convertInteger(centimesPart);
    out += ` et ${centimesWords} centime${centimesPart > 1 ? 's' : ''}`;
  }

  if (negative) out = `moins ${out}`;

  return out;
}
