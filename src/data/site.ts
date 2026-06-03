// Centrální obsah webu — texty vychází z PREZENTACE-BRIEF.md.
// Žádná reálná data hostů, žádné secrets. Ceník je placeholder.

export const nav = [
  { href: '#funkce', label: 'Funkce' },
  { href: '#jak-to-funguje', label: 'Jak to funguje' },
  { href: '#pro-koho', label: 'Pro koho' },
  { href: '#jazyky', label: 'Jazyky' },
  { href: '#cenik', label: 'Ceník' },
  { href: '#faq', label: 'FAQ' },
  { href: '#kontakt', label: 'Kontakt' },
];

export const features = [
  {
    icon: '🤖',
    title: 'AI asistent na kiosku',
    desc: 'Chat s rozumějícím asistentem a 3D avatarem ve 11 jazycích. Videohovor na recepci a zvonek pro přivolání personálu.',
  },
  {
    icon: '🛎️',
    title: 'Samoobslužný check-in',
    desc: 'Online z domova i na kiosku. Evidence všech ubytovaných osob a registračních údajů během chvíle.',
  },
  {
    icon: '📅',
    title: 'Kalendář obsazení + plán pokojů',
    desc: 'Přehledná obsazenost a plán pokojů (tape chart) s ochranou před přebookováním.',
  },
  {
    icon: '🔄',
    title: 'Napojení na Airbnb / Booking',
    desc: 'Export obsazenosti i import rezervací přes iCal s automatickou synchronizací kalendářů.',
  },
  {
    icon: '💰',
    title: 'Fakturace & pokladna',
    desc: 'Doklady, číselné řady, DPH, folio, zálohové i období faktury a QR platby — vše na jednom místě.',
  },
  {
    icon: '✉️',
    title: 'Vícejazyčné e-maily hostům',
    desc: 'Potvrzení, check-in, check-out i storno s brandingem vaší provozovny.',
  },
  {
    icon: '⭐',
    title: 'CRM + hodnocení (NPS)',
    desc: 'Profily hostů, preference, VIP a historie pobytů. Automatická žádost o hodnocení po odjezdu.',
  },
  {
    icon: '🧹',
    title: 'Dispečink úklidu a údržby',
    desc: 'Fronty úkolů a požadavky hostů přímo z portálu — nic nezapadne.',
  },
  {
    icon: '🧠',
    title: 'AI agenti',
    desc: 'Noční audit, ranní briefing, návrhy cen a kontroly z dat. Nevratné kroky jen navrhují ke schválení.',
  },
  {
    icon: '🏨',
    title: 'Multi-tenant',
    desc: 'Více provozoven, oddělená data a role (správce, manažer, úklid, údržba) v jedné instalaci.',
  },
  {
    icon: '👶',
    title: 'Chytrý pobytový poplatek',
    desc: 'Výpočet podle věku dětí a denních, týdenních i měsíčních sazeb.',
  },
  {
    icon: '🛡️',
    title: 'Evidence cizinců & GDPR',
    desc: 'UBYPORT export, evidenční kniha a řízená retence dat v souladu s GDPR.',
  },
];

export const steps = [
  {
    num: '01',
    title: 'Host dorazí nebo rezervuje',
    desc: 'Na kiosku nebo přes portál: vybere termín, vyplní údaje a udělá online check-in.',
  },
  {
    num: '02',
    title: 'AI a samoobsluha',
    desc: 'Asistent poradí ve 11 jazycích a v případě potřeby přivolá personál nebo spustí videohovor.',
  },
  {
    num: '03',
    title: 'Recepce a manažer spravuje',
    desc: 'Obsazení, platby, doklady, úklid i údržba — kompletní správa v jednom administračním rozhraní.',
  },
  {
    num: '04',
    title: 'Po odjezdu',
    desc: 'Host dostane e-mail s žádostí o hodnocení a data se uloží do CRM pro příští návštěvu.',
  },
];

export const segments = [
  {
    icon: '🏨',
    title: 'Hotely',
    desc: 'Odlehčete recepci, zrychlete check-in a mějte obsazenost i platby pod kontrolou.',
    points: ['Plán pokojů a folio', 'Online i kiosk check-in', 'Napojení na OTA'],
  },
  {
    icon: '🏡',
    title: 'Penziony',
    desc: 'Provoz bez nočního personálu díky samoobslužnému kiosku a AI asistentovi.',
    points: ['Self check-in 24/7', '3D avatar a videohovor', 'Vícejazyčná komunikace'],
  },
  {
    icon: '🏢',
    title: 'Ubytovny',
    desc: 'Dlouhodobé pobyty, firemní fakturace a bezchybná evidence cizinců.',
    points: ['Faktury za období', 'UBYPORT a evidence', 'Týdenní / měsíční sazby'],
  },
];

export const languages = [
  { flag: '🇨🇿', code: 'CS', name: 'Čeština' },
  { flag: '🇬🇧', code: 'EN', name: 'English' },
  { flag: '🇩🇪', code: 'DE', name: 'Deutsch' },
  { flag: '🇷🇺', code: 'RU', name: 'Русский' },
  { flag: '🇺🇦', code: 'UK', name: 'Українська' },
  { flag: '🇵🇱', code: 'PL', name: 'Polski' },
  { flag: '🇸🇰', code: 'SK', name: 'Slovenčina' },
  { flag: '🇮🇹', code: 'IT', name: 'Italiano' },
  { flag: '🇫🇷', code: 'FR', name: 'Français' },
  { flag: '🇪🇸', code: 'ES', name: 'Español' },
  { flag: '🇨🇳', code: 'ZH', name: '中文' },
];

export const integrations = [
  { name: 'Airbnb', desc: 'Import i export přes iCal' },
  { name: 'Booking.com', desc: 'Synchronizace obsazenosti (iCal)' },
  { name: 'E-mail (SMTP)', desc: 'Vícejazyčné e-maily hostům' },
  { name: 'WhatsApp', desc: 'Komunikace s hosty' },
];

export const faqs = [
  {
    q: 'Funguje recepce opravdu bez personálu?',
    a: 'Ano. Samoobslužný kiosek a online check-in zvládnou příjezd hosta i mimo provozní hodiny. Když je potřeba člověk, host zazvoní nebo spustí videohovor na recepci.',
  },
  {
    q: 'Kolik jazyků produkt podporuje?',
    a: 'Jedenáct: čeština, angličtina, němčina, ruština, ukrajinština, polština, slovenština, italština, francouzština, španělština a čínština — napříč kioskem, portálem hosta, e-maily i AI asistentem.',
  },
  {
    q: 'Lze napojit Airbnb a Booking.com?',
    a: 'Ano, přes iCal. ReceptionAI umí exportovat vaši obsazenost i importovat rezervace z OTA s automatickou synchronizací, což chrání před přebookováním.',
  },
  {
    q: 'Jak je to s evidencí cizinců a GDPR?',
    a: 'Systém umí UBYPORT export a vede evidenční knihu. Osobní data podléhají řízené retenci v souladu s GDPR.',
  },
  {
    q: 'Zvládne jeden systém více provozoven?',
    a: 'Ano, je multi-tenant. Jedna instalace obslouží více provozoven s oddělenými daty a vlastními rolemi (správce, manažer, úklid, údržba).',
  },
  {
    q: 'Rozhoduje AI samo o nevratných krocích?',
    a: 'Ne. AI agenti dělají audity, briefingy a návrhy (např. cen) z dat, ale nevratné kroky vždy jen navrhují ke schválení člověku.',
  },
];
