/**
 * Static logo URL map for top VCT partner & major challenger orgs.
 * All logos served from owcdn.net (VLR's CDN — same origin as the API img field).
 * Used as fallback when the API doesn't return a logo for a match.
 *
 * To add a new team: find the CDN URL from vlr.gg team page → right-click logo → copy image address.
 */
export const TEAM_LOGOS: Record<string, string> = {
  // ── VCT Americas / NA ─────────────────────────────────────────────────────
  Sentinels: "https://owcdn.net/img/6229a64f47b11.png",
  "Cloud9": "https://owcdn.net/img/5f5bd7e9e12a8.png",
  "100 Thieves": "https://owcdn.net/img/5f5bb9a46f3d9.png",
  "NRG": "https://owcdn.net/img/637d8c65f1fe7.png",
  "LOUD": "https://owcdn.net/img/6229a87e43069.png",
  "FURIA": "https://owcdn.net/img/6229a5c2dde3b.png",
  "Leviatán": "https://owcdn.net/img/6229a7f3c7e49.png",
  "KRÜ Esports": "https://owcdn.net/img/6229a8c6c1a79.png",
  "Evil Geniuses": "https://owcdn.net/img/5fc4d5a96e72c.png",
  "2GAME Esports": "https://owcdn.net/img/64ab19e0b5cfd.png",
  "MIBR": "https://owcdn.net/img/634e74d3a91e8.png",
  "ENVY": "https://owcdn.net/img/63e44d87e4b82.png",
  "Ghost Gaming": "https://owcdn.net/img/5f5bd86cef949.png",
  "OpTic Gaming": "https://owcdn.net/img/5f5bd8d668b91.png",
  "TSM": "https://owcdn.net/img/5f5bd9b5d1f4f.png",

  // ── VCT EMEA ─────────────────────────────────────────────────────────────
  Fnatic: "https://owcdn.net/img/5f5bd8ef0d1d1.png",
  "Team Vitality": "https://owcdn.net/img/5f5bd8a7d0e6d.png",
  "Team Heretics": "https://owcdn.net/img/6229a5a1b57c9.png",
  "BBL Esports": "https://owcdn.net/img/60bb5c9c62f10.png",
  "Karmine Corp": "https://owcdn.net/img/62699aad0c76a.png",
  "Natus Vincere": "https://owcdn.net/img/5f5bd7c84e4d3.png",
  "FUT Esports": "https://owcdn.net/img/620773e55b7d8.png",
  "NAVI": "https://owcdn.net/img/5f5bd7c84e4d3.png",
  "Gentle Mates": "https://owcdn.net/img/63a9f5b24c2c5.png",
  "Giants Gaming": "https://owcdn.net/img/5f5bd86acfc59.png",
  "Apeks": "https://owcdn.net/img/628be5e0c2fe9.png",
  "M8": "https://owcdn.net/img/651e8e12c4e27.png",
  "G2 Esports": "https://owcdn.net/img/5f5bd866b5e97.png",
  "Astralis": "https://owcdn.net/img/5f5bd7d74e37a.png",
  "Alliance": "https://owcdn.net/img/5f5bd7a84fc95.png",
  "BIG": "https://owcdn.net/img/5f5bd7d4c24f5.png",
  "Liquid": "https://owcdn.net/img/5f5bd8bb697b5.png",
  "Team Liquid": "https://owcdn.net/img/5f5bd8bb697b5.png",
  "TENSTAR": "https://owcdn.net/img/6317d7e3c2abb.png",

  // ── VCT Pacific ───────────────────────────────────────────────────────────
  "Paper Rex": "https://owcdn.net/img/6229a59e57dc5.png",
  "DetonatioN FocusMe": "https://owcdn.net/img/60372e69a78a3.png",
  "DFM": "https://owcdn.net/img/60372e69a78a3.png",
  "Team Secret": "https://owcdn.net/img/5f5bd9a97dd60.png",
  "Talon Esports": "https://owcdn.net/img/61bd12a0b68b4.png",
  "ZETA DIVISION": "https://owcdn.net/img/61b36bb19d6c4.png",
  "Gen.G": "https://owcdn.net/img/5f5bd88c9ac69.png",
  "T1": "https://owcdn.net/img/5f5bd997beb23.png",
  "Rex Regum Qeon": "https://owcdn.net/img/60985e4c5d30a.png",
  "Global Esports": "https://owcdn.net/img/60bff7a4c66f8.png",
  "Bleed Esports": "https://owcdn.net/img/6229a54cda299.png",
  "Kiwoom DRX": "https://owcdn.net/img/64e9f74d6f2f1.png",
  "DRX": "https://owcdn.net/img/64e9f74d6f2f1.png",
  "XERXIA Esports": "https://owcdn.net/img/6229a5ce94c09.png",
  "Boom Esports": "https://owcdn.net/img/60d8b42469e5e.png",
  "Fancy United": "https://owcdn.net/img/637a1dae14f1b.png",

  // ── VCT China ─────────────────────────────────────────────────────────────
  "EDward Gaming": "https://owcdn.net/img/5f5bd8279c74c.png",
  "EDG": "https://owcdn.net/img/5f5bd8279c74c.png",
  "Bilibili Gaming": "https://owcdn.net/img/63c24e2ef45a0.png",
  "BLG": "https://owcdn.net/img/63c24e2ef45a0.png",
  "Team SMG": "https://owcdn.net/img/64ab2a49b8e5d.png",
  "Nova Esports": "https://owcdn.net/img/64ad2ebc51c7a.png",
  "Trace Esports": "https://owcdn.net/img/6486f8d59ee65.png",
  "JDG Esports": "https://owcdn.net/img/5f5bd8b5b1a5a.png",
  "Dragon Ranger Gaming": "https://owcdn.net/img/64ab22f3f41dc.png",
  "FunPlus Phoenix": "https://owcdn.net/img/60a30f5d8dc46.png",
  "FPX": "https://owcdn.net/img/60a30f5d8dc46.png",
  "TYLOO": "https://owcdn.net/img/5f5bd9c0f39e3.png",
  "ThunderTalk Gaming": "https://owcdn.net/img/64ab2e6d5a8f1.png",
  "All Gamers": "https://owcdn.net/img/64ad1c2d9e4b3.png",

  // ── Notable Challengers / Other ──────────────────────────────────────────
  "Team Falcon": "https://owcdn.net/img/6229a6291fab8.png",
  "XSET": "https://owcdn.net/img/6229a86e9b5f9.png",
  "Version1": "https://owcdn.net/img/6229a84b4adc9.png",
  "V1": "https://owcdn.net/img/6229a84b4adc9.png",
  "Oxygen Esports": "https://owcdn.net/img/6229a7e82f959.png",
  "eUnited": "https://owcdn.net/img/5f5bd8536f2e5.png",
  "FaZe Clan": "https://owcdn.net/img/5f5bd85c2be48.png",
  "FaZe": "https://owcdn.net/img/5f5bd85c2be48.png",
  "Nerd Street": "https://owcdn.net/img/6229a8a69b819.png",
  "Disguised": "https://owcdn.net/img/645f2aaeb19e1.png",
  "DSG": "https://owcdn.net/img/645f2aaeb19e1.png",
};
