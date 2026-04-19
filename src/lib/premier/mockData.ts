// TODO(backend): replace mockData with real Premier API once data ingestion is wired

export type PremierRegion = "NA" | "EU" | "APAC" | "LATAM" | "BR" | "KR";
export type PremierDivision =
  | "Open"
  | "Intermediate"
  | "Advanced"
  | "Elite"
  | "Contender"
  | "Invite";

export interface PremierTeam {
  id: string;
  name: string;
  tag: string;
  logo?: string;
  region: PremierRegion;
  subregion: string; // "US West", "Northern Europe", etc.
  division: PremierDivision;
  divisionPlace: number; // 1–16 within their division
  divisionScore: number; // the Premier ranking score
  record: { w: number; l: number };
  roster: Array<{ name: string; tag: string; role: "captain" | "member" }>;
  lastMatch?: { opponent: string; result: "W" | "L"; score: string; date: string };
  upcomingMatch?: { opponent: string; date: string; time: string };
}

export interface PremierRegionGroup {
  region: PremierRegion;
  label: string;
  subregions: Array<{ id: string; label: string; teamCount: number }>;
}

// ─── Teams ───────────────────────────────────────────────────────────────────

export const PREMIER_TEAMS: PremierTeam[] = [
  // ── NA / US West ──────────────────────────────────────────────────────────
  {
    id: "midnight-protocol",
    name: "Midnight Protocol",
    tag: "MDNT",
    region: "NA",
    subregion: "US West",
    division: "Invite",
    divisionPlace: 1,
    divisionScore: 2400,
    record: { w: 12, l: 2 },
    roster: [
      { name: "Cipher", tag: "0x1", role: "captain" },
      { name: "Flicker", tag: "NA1", role: "member" },
      { name: "Sceptre", tag: "W3ST", role: "member" },
      { name: "Axiom", tag: "AX1", role: "member" },
      { name: "Netcode", tag: "NC99", role: "member" },
    ],
    lastMatch: { opponent: "Nova Vector", result: "W", score: "13-9", date: "2 days ago" },
    upcomingMatch: { opponent: "Pacific Rift", date: "Apr 20", time: "7:00 PM PT" },
  },
  {
    id: "nova-vector",
    name: "Nova Vector",
    tag: "NOVA",
    region: "NA",
    subregion: "US West",
    division: "Contender",
    divisionPlace: 2,
    divisionScore: 2150,
    record: { w: 10, l: 4 },
    roster: [
      { name: "Prism", tag: "PRZ", role: "captain" },
      { name: "Voltage", tag: "V0LT", role: "member" },
      { name: "Reflex", tag: "RFX", role: "member" },
      { name: "Static", tag: "ST4", role: "member" },
      { name: "Quasar", tag: "QSR", role: "member" },
    ],
    lastMatch: { opponent: "Midnight Protocol", result: "L", score: "9-13", date: "2 days ago" },
    upcomingMatch: { opponent: "Iron Sentinel", date: "Apr 21", time: "6:00 PM PT" },
  },
  {
    id: "pacific-rift",
    name: "Pacific Rift",
    tag: "PRFT",
    region: "NA",
    subregion: "US West",
    division: "Elite",
    divisionPlace: 4,
    divisionScore: 1780,
    record: { w: 7, l: 7 },
    roster: [
      { name: "Korvus", tag: "KRV", role: "captain" },
      { name: "Wren", tag: "WRN", role: "member" },
      { name: "Halcyon", tag: "HLC", role: "member" },
      { name: "Nimbus", tag: "NMB", role: "member" },
      { name: "Sequoia", tag: "SQA", role: "member" },
    ],
    lastMatch: { opponent: "Nova Vector", result: "L", score: "8-13", date: "4 days ago" },
    upcomingMatch: { opponent: "Midnight Protocol", date: "Apr 20", time: "7:00 PM PT" },
  },
  // ── NA / US East ──────────────────────────────────────────────────────────
  {
    id: "radiant-wolves",
    name: "Radiant Wolves",
    tag: "RWLV",
    region: "NA",
    subregion: "US East",
    division: "Invite",
    divisionPlace: 1,
    divisionScore: 2380,
    record: { w: 11, l: 3 },
    roster: [
      { name: "Fenrir", tag: "FNR", role: "captain" },
      { name: "Vex", tag: "VXE", role: "member" },
      { name: "Crest", tag: "CRST", role: "member" },
      { name: "Dusk", tag: "DSK", role: "member" },
      { name: "Lumen", tag: "LMN", role: "member" },
    ],
    lastMatch: { opponent: "Iron Sentinel", result: "W", score: "13-7", date: "3 days ago" },
    upcomingMatch: { opponent: "Eclipse Rising", date: "Apr 22", time: "8:00 PM ET" },
  },
  {
    id: "iron-sentinel",
    name: "Iron Sentinel",
    tag: "IRON",
    region: "NA",
    subregion: "US East",
    division: "Advanced",
    divisionPlace: 3,
    divisionScore: 1640,
    record: { w: 6, l: 8 },
    roster: [
      { name: "Bastion", tag: "BST", role: "captain" },
      { name: "Rampart", tag: "RMP", role: "member" },
      { name: "Aegis", tag: "AGS", role: "member" },
      { name: "Bulwark", tag: "BLWK", role: "member" },
      { name: "Parapet", tag: "PRP", role: "member" },
    ],
    lastMatch: { opponent: "Radiant Wolves", result: "L", score: "7-13", date: "3 days ago" },
  },
  {
    id: "eclipse-rising",
    name: "Eclipse Rising",
    tag: "ECLP",
    region: "NA",
    subregion: "US East",
    division: "Open",
    divisionPlace: 6,
    divisionScore: 980,
    record: { w: 4, l: 10 },
    roster: [
      { name: "Aura", tag: "AUR", role: "captain" },
      { name: "Penumbra", tag: "PNB", role: "member" },
      { name: "Solstice", tag: "SLS", role: "member" },
      { name: "Corona", tag: "CRN", role: "member" },
      { name: "Zenith", tag: "ZNT", role: "member" },
    ],
    lastMatch: { opponent: "Iron Sentinel", result: "W", score: "13-11", date: "5 days ago" },
    upcomingMatch: { opponent: "Radiant Wolves", date: "Apr 22", time: "8:00 PM ET" },
  },
  // ── EU / Northern Europe ──────────────────────────────────────────────────
  {
    id: "aegon-rising",
    name: "Aegon Rising",
    tag: "AEGN",
    region: "EU",
    subregion: "Northern Europe",
    division: "Invite",
    divisionPlace: 1,
    divisionScore: 2500,
    record: { w: 13, l: 1 },
    roster: [
      { name: "Søren", tag: "SRN", role: "captain" },
      { name: "Frost", tag: "FRST", role: "member" },
      { name: "Veil", tag: "VEL", role: "member" },
      { name: "Pyre", tag: "PYR", role: "member" },
      { name: "Glyph", tag: "GLY", role: "member" },
    ],
    lastMatch: { opponent: "Storm Protocol", result: "W", score: "13-5", date: "1 day ago" },
    upcomingMatch: { opponent: "Void Circuit", date: "Apr 21", time: "8:00 PM CET" },
  },
  // ── EU / DACH ─────────────────────────────────────────────────────────────
  {
    id: "storm-protocol",
    name: "Storm Protocol",
    tag: "STRM",
    region: "EU",
    subregion: "DACH",
    division: "Contender",
    divisionPlace: 2,
    divisionScore: 2200,
    record: { w: 10, l: 4 },
    roster: [
      { name: "Blitz", tag: "BLTZ", role: "captain" },
      { name: "Krämer", tag: "KRM", role: "member" },
      { name: "Donner", tag: "DNR", role: "member" },
      { name: "Sturm", tag: "STR", role: "member" },
      { name: "Volt", tag: "VLT", role: "member" },
    ],
    lastMatch: { opponent: "Aegon Rising", result: "L", score: "5-13", date: "1 day ago" },
    upcomingMatch: { opponent: "Infernal Pact", date: "Apr 21", time: "7:00 PM CET" },
  },
  // ── EU / Eastern Europe ───────────────────────────────────────────────────
  {
    id: "infernal-pact",
    name: "Infernal Pact",
    tag: "INFR",
    region: "EU",
    subregion: "Eastern Europe",
    division: "Elite",
    divisionPlace: 2,
    divisionScore: 1950,
    record: { w: 9, l: 5 },
    roster: [
      { name: "Blaze", tag: "BLZ", role: "captain" },
      { name: "Koval", tag: "KVL", role: "member" },
      { name: "Renko", tag: "RNK", role: "member" },
      { name: "Orlov", tag: "ORL", role: "member" },
      { name: "Vesper", tag: "VSP", role: "member" },
    ],
    lastMatch: { opponent: "Echo Chamber", result: "W", score: "13-10", date: "2 days ago" },
    upcomingMatch: { opponent: "Storm Protocol", date: "Apr 21", time: "8:00 PM EET" },
  },
  // ── EU / France ───────────────────────────────────────────────────────────
  {
    id: "midnight-watch",
    name: "Midnight Watch",
    tag: "MDWT",
    region: "EU",
    subregion: "France",
    division: "Contender",
    divisionPlace: 3,
    divisionScore: 2050,
    record: { w: 9, l: 5 },
    roster: [
      { name: "Renard", tag: "RNR", role: "captain" },
      { name: "Lumière", tag: "LMR", role: "member" },
      { name: "Acier", tag: "ACR", role: "member" },
      { name: "Torche", tag: "TRC", role: "member" },
      { name: "Ombrage", tag: "OMB", role: "member" },
    ],
    lastMatch: { opponent: "Azure Collective", result: "W", score: "13-9", date: "2 days ago" },
    upcomingMatch: { opponent: "Aegon Rising", date: "Apr 23", time: "6:00 PM CET" },
  },
  // ── EU / IBIT ─────────────────────────────────────────────────────────────
  {
    id: "azure-collective",
    name: "Azure Collective",
    tag: "AZUR",
    region: "EU",
    subregion: "IBIT",
    division: "Intermediate",
    divisionPlace: 1,
    divisionScore: 1350,
    record: { w: 6, l: 8 },
    roster: [
      { name: "Ciano", tag: "CNA", role: "captain" },
      { name: "Ferro", tag: "FRR", role: "member" },
      { name: "Azzurri", tag: "AZZ", role: "member" },
      { name: "Vento", tag: "VNT", role: "member" },
      { name: "Serra", tag: "SRR", role: "member" },
    ],
    lastMatch: { opponent: "Midnight Watch", result: "L", score: "9-13", date: "2 days ago" },
    upcomingMatch: { opponent: "Storm Protocol", date: "Apr 22", time: "5:00 PM CET" },
  },
  // ── EU / Turkiye ──────────────────────────────────────────────────────────
  {
    id: "echo-chamber",
    name: "Echo Chamber",
    tag: "ECHO",
    region: "EU",
    subregion: "Turkiye",
    division: "Advanced",
    divisionPlace: 1,
    divisionScore: 1700,
    record: { w: 8, l: 6 },
    roster: [
      { name: "Akin", tag: "AKN", role: "captain" },
      { name: "Yilmaz", tag: "YLZ", role: "member" },
      { name: "Demir", tag: "DMR", role: "member" },
      { name: "Kaya", tag: "KYA", role: "member" },
      { name: "Sezer", tag: "SZR", role: "member" },
    ],
    lastMatch: { opponent: "Infernal Pact", result: "L", score: "10-13", date: "2 days ago" },
    upcomingMatch: { opponent: "Azure Collective", date: "Apr 20", time: "9:00 PM TRT" },
  },
  // ── APAC / Japan ──────────────────────────────────────────────────────────
  {
    id: "phantom-grid",
    name: "Phantom Grid",
    tag: "PHGD",
    region: "APAC",
    subregion: "Japan",
    division: "Invite",
    divisionPlace: 1,
    divisionScore: 2450,
    record: { w: 12, l: 2 },
    roster: [
      { name: "Takeshi", tag: "TKS", role: "captain" },
      { name: "Haruki", tag: "HRK", role: "member" },
      { name: "Ryuu", tag: "RYU", role: "member" },
      { name: "Kenshin", tag: "KNS", role: "member" },
      { name: "Shiro", tag: "SHR", role: "member" },
    ],
    lastMatch: { opponent: "Neon Serpents", result: "W", score: "13-8", date: "1 day ago" },
    upcomingMatch: { opponent: "Solar Fracture", date: "Apr 21", time: "8:00 PM JST" },
  },
  // ── APAC / Asia ───────────────────────────────────────────────────────────
  {
    id: "neon-serpents",
    name: "Neon Serpents",
    tag: "NSER",
    region: "APAC",
    subregion: "Asia",
    division: "Contender",
    divisionPlace: 1,
    divisionScore: 2100,
    record: { w: 10, l: 4 },
    roster: [
      { name: "Cobra", tag: "CBR", role: "captain" },
      { name: "Fang", tag: "FNG", role: "member" },
      { name: "Venom", tag: "VNM", role: "member" },
      { name: "Coil", tag: "COL", role: "member" },
      { name: "Mamba", tag: "MMB", role: "member" },
    ],
    lastMatch: { opponent: "Phantom Grid", result: "L", score: "8-13", date: "1 day ago" },
    upcomingMatch: { opponent: "Monsoon Protocol", date: "Apr 22", time: "7:00 PM SGT" },
  },
  // ── APAC / Oceania ────────────────────────────────────────────────────────
  {
    id: "solar-fracture",
    name: "Solar Fracture",
    tag: "SOLR",
    region: "APAC",
    subregion: "Oceania",
    division: "Elite",
    divisionPlace: 1,
    divisionScore: 1850,
    record: { w: 9, l: 5 },
    roster: [
      { name: "Reef", tag: "RFF", role: "captain" },
      { name: "Sandbar", tag: "SND", role: "member" },
      { name: "Coral", tag: "CRL", role: "member" },
      { name: "Current", tag: "CRR", role: "member" },
      { name: "Tide", tag: "TDE", role: "member" },
    ],
    lastMatch: { opponent: "Neon Serpents", result: "W", score: "13-11", date: "2 days ago" },
    upcomingMatch: { opponent: "Phantom Grid", date: "Apr 21", time: "6:00 PM AEST" },
  },
  // ── APAC / South Asia ─────────────────────────────────────────────────────
  {
    id: "monsoon-protocol",
    name: "Monsoon Protocol",
    tag: "MNSN",
    region: "APAC",
    subregion: "South Asia",
    division: "Intermediate",
    divisionPlace: 1,
    divisionScore: 1200,
    record: { w: 5, l: 9 },
    roster: [
      { name: "Rohan", tag: "RHN", role: "captain" },
      { name: "Arjun", tag: "ARJ", role: "member" },
      { name: "Vikram", tag: "VKR", role: "member" },
      { name: "Sanjay", tag: "SNJ", role: "member" },
      { name: "Dev", tag: "DVS", role: "member" },
    ],
    lastMatch: { opponent: "Solar Fracture", result: "L", score: "7-13", date: "2 days ago" },
    upcomingMatch: { opponent: "Neon Serpents", date: "Apr 22", time: "7:00 PM IST" },
  },
  // ── KR ────────────────────────────────────────────────────────────────────
  {
    id: "scarlet-code",
    name: "Scarlet Code",
    tag: "SCRL",
    region: "KR",
    subregion: "Korea",
    division: "Invite",
    divisionPlace: 1,
    divisionScore: 2600,
    record: { w: 14, l: 0 },
    roster: [
      { name: "Hanjin", tag: "HJN", role: "captain" },
      { name: "Seongmin", tag: "SMN", role: "member" },
      { name: "Junhyuk", tag: "JHK", role: "member" },
      { name: "Daesung", tag: "DSG", role: "member" },
      { name: "Kyunghoon", tag: "KHN", role: "member" },
    ],
    lastMatch: { opponent: "Ghost Protocol KR", result: "W", score: "13-4", date: "1 day ago" },
    upcomingMatch: { opponent: "Iron Curtain KR", date: "Apr 21", time: "6:00 PM KST" },
  },
  {
    id: "ghost-protocol-kr",
    name: "Ghost Protocol KR",
    tag: "GHKR",
    region: "KR",
    subregion: "Korea",
    division: "Contender",
    divisionPlace: 2,
    divisionScore: 2250,
    record: { w: 11, l: 3 },
    roster: [
      { name: "Wonjae", tag: "WJE", role: "captain" },
      { name: "Hyungseok", tag: "HSK", role: "member" },
      { name: "Minjoon", tag: "MJN", role: "member" },
      { name: "Taehwan", tag: "THN", role: "member" },
      { name: "Yujin", tag: "YJN", role: "member" },
    ],
    lastMatch: { opponent: "Scarlet Code", result: "L", score: "4-13", date: "1 day ago" },
    upcomingMatch: { opponent: "Iron Curtain KR", date: "Apr 22", time: "5:00 PM KST" },
  },
  {
    id: "iron-curtain-kr",
    name: "Iron Curtain KR",
    tag: "ICKR",
    region: "KR",
    subregion: "Korea",
    division: "Elite",
    divisionPlace: 3,
    divisionScore: 1950,
    record: { w: 8, l: 6 },
    roster: [
      { name: "Cheolsu", tag: "CHS", role: "captain" },
      { name: "Bongwoo", tag: "BGW", role: "member" },
      { name: "Sangmin", tag: "SGM", role: "member" },
      { name: "Hyunjin", tag: "HJJ", role: "member" },
      { name: "Sebin", tag: "SBN", role: "member" },
    ],
    lastMatch: { opponent: "Ghost Protocol KR", result: "W", score: "13-10", date: "2 days ago" },
    upcomingMatch: { opponent: "Scarlet Code", date: "Apr 21", time: "6:00 PM KST" },
  },
  // ── LATAM ─────────────────────────────────────────────────────────────────
  {
    id: "relampago",
    name: "Relámpago",
    tag: "RLMP",
    region: "LATAM",
    subregion: "LATAM North",
    division: "Invite",
    divisionPlace: 1,
    divisionScore: 2300,
    record: { w: 11, l: 3 },
    roster: [
      { name: "Rodrigo", tag: "RDG", role: "captain" },
      { name: "Gael", tag: "GAL", role: "member" },
      { name: "Andrés", tag: "AND", role: "member" },
      { name: "Tomás", tag: "TMS", role: "member" },
      { name: "Emilio", tag: "EML", role: "member" },
    ],
    lastMatch: { opponent: "Nocturna LATAM", result: "W", score: "13-7", date: "1 day ago" },
    upcomingMatch: { opponent: "Fuego Colectivo", date: "Apr 21", time: "9:00 PM COT" },
  },
  {
    id: "nocturna-latam",
    name: "Nocturna LATAM",
    tag: "NOCT",
    region: "LATAM",
    subregion: "LATAM North",
    division: "Contender",
    divisionPlace: 2,
    divisionScore: 2000,
    record: { w: 9, l: 5 },
    roster: [
      { name: "Diego", tag: "DGO", role: "captain" },
      { name: "Rafael", tag: "RFL", role: "member" },
      { name: "Sebastián", tag: "SBT", role: "member" },
      { name: "Cristian", tag: "CRS", role: "member" },
      { name: "José", tag: "JSE", role: "member" },
    ],
    lastMatch: { opponent: "Relámpago", result: "L", score: "7-13", date: "1 day ago" },
    upcomingMatch: { opponent: "Fuego Colectivo", date: "Apr 22", time: "8:00 PM COT" },
  },
  {
    id: "fuego-colectivo",
    name: "Fuego Colectivo",
    tag: "FGCL",
    region: "LATAM",
    subregion: "LATAM South",
    division: "Elite",
    divisionPlace: 2,
    divisionScore: 1850,
    record: { w: 8, l: 6 },
    roster: [
      { name: "Matías", tag: "MTS", role: "captain" },
      { name: "Lucas", tag: "LCS", role: "member" },
      { name: "Esteban", tag: "EST", role: "member" },
      { name: "Fabricio", tag: "FBR", role: "member" },
      { name: "Ignacio", tag: "IGN", role: "member" },
    ],
    lastMatch: { opponent: "Nocturna LATAM", result: "W", score: "13-9", date: "2 days ago" },
    upcomingMatch: { opponent: "Relámpago", date: "Apr 21", time: "9:00 PM ART" },
  },
  // ── BR ────────────────────────────────────────────────────────────────────
  {
    id: "chamas-da-noite",
    name: "Chamas da Noite",
    tag: "CHMS",
    region: "BR",
    subregion: "Brazil",
    division: "Invite",
    divisionPlace: 1,
    divisionScore: 2350,
    record: { w: 12, l: 2 },
    roster: [
      { name: "Vitor", tag: "VTR", role: "captain" },
      { name: "Leonardo", tag: "LEO", role: "member" },
      { name: "Pedro", tag: "PDR", role: "member" },
      { name: "Felipe", tag: "FLP", role: "member" },
      { name: "Gustavo", tag: "GTV", role: "member" },
    ],
    lastMatch: { opponent: "Vector Vermelho", result: "W", score: "13-6", date: "1 day ago" },
    upcomingMatch: { opponent: "Choque Tático", date: "Apr 20", time: "8:00 PM BRT" },
  },
  {
    id: "vector-vermelho",
    name: "Vector Vermelho",
    tag: "VCVR",
    region: "BR",
    subregion: "Brazil",
    division: "Contender",
    divisionPlace: 2,
    divisionScore: 2100,
    record: { w: 10, l: 4 },
    roster: [
      { name: "Bruno", tag: "BRN", role: "captain" },
      { name: "Caio", tag: "CAO", role: "member" },
      { name: "Renato", tag: "RNT", role: "member" },
      { name: "Tiago", tag: "TGO", role: "member" },
      { name: "Igor", tag: "IGR", role: "member" },
    ],
    lastMatch: { opponent: "Chamas da Noite", result: "L", score: "6-13", date: "1 day ago" },
    upcomingMatch: { opponent: "Choque Tático", date: "Apr 21", time: "7:00 PM BRT" },
  },
  {
    id: "choque-tatico",
    name: "Choque Tático",
    tag: "CHQT",
    region: "BR",
    subregion: "Brazil",
    division: "Advanced",
    divisionPlace: 3,
    divisionScore: 1680,
    record: { w: 7, l: 7 },
    roster: [
      { name: "André", tag: "AND", role: "captain" },
      { name: "Matheus", tag: "MTH", role: "member" },
      { name: "Rodrigo", tag: "RDG", role: "member" },
      { name: "Júnior", tag: "JNR", role: "member" },
      { name: "Alessandro", tag: "ALS", role: "member" },
    ],
    lastMatch: { opponent: "Vector Vermelho", result: "W", score: "13-8", date: "2 days ago" },
    upcomingMatch: { opponent: "Chamas da Noite", date: "Apr 20", time: "8:00 PM BRT" },
  },
];

// ─── Region structure ─────────────────────────────────────────────────────────

export const PREMIER_REGIONS: PremierRegionGroup[] = [
  {
    region: "NA",
    label: "North America",
    subregions: [
      { id: "us-west", label: "US West", teamCount: 3 },
      { id: "us-east", label: "US East", teamCount: 3 },
    ],
  },
  {
    region: "EU",
    label: "Europe",
    subregions: [
      { id: "northern-europe", label: "Northern Europe", teamCount: 1 },
      { id: "eastern-europe", label: "Eastern Europe", teamCount: 1 },
      { id: "dach", label: "DACH", teamCount: 1 },
      { id: "ibit", label: "IBIT", teamCount: 1 },
      { id: "france", label: "France", teamCount: 1 },
      { id: "middle-east", label: "Middle East", teamCount: 0 },
      { id: "turkiye", label: "Turkiye", teamCount: 1 },
    ],
  },
  {
    region: "APAC",
    label: "Asia Pacific",
    subregions: [
      { id: "asia", label: "Asia", teamCount: 1 },
      { id: "japan", label: "Japan", teamCount: 1 },
      { id: "oceania", label: "Oceania", teamCount: 1 },
      { id: "south-asia", label: "South Asia", teamCount: 1 },
    ],
  },
  {
    region: "KR",
    label: "Korea",
    subregions: [{ id: "korea", label: "Korea", teamCount: 3 }],
  },
  {
    region: "LATAM",
    label: "Latin America",
    subregions: [
      { id: "latam-north", label: "LATAM North", teamCount: 2 },
      { id: "latam-south", label: "LATAM South", teamCount: 1 },
    ],
  },
  {
    region: "BR",
    label: "Brazil",
    subregions: [{ id: "brazil", label: "Brazil", teamCount: 3 }],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getTeamsByRegion(region: PremierRegion): PremierTeam[] {
  return PREMIER_TEAMS.filter((t) => t.region === region);
}

export function getTeamById(id: string): PremierTeam | null {
  return PREMIER_TEAMS.find((t) => t.id === id) ?? null;
}

export function searchTeams(query: string): PremierTeam[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return PREMIER_TEAMS.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.tag.toLowerCase().includes(q) ||
      t.roster.some((r) => r.name.toLowerCase().includes(q))
  );
}
