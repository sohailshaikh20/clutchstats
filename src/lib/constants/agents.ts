// ─── Types ────────────────────────────────────────────────────────────────────

export interface AgentRoleData {
  name: string;
  description: string;
  /** lucide-react icon name */
  iconName: string;
  color: string;
  agents: string[];
}

// ─── Role Definitions ─────────────────────────────────────────────────────────

export const AGENT_ROLES: Record<string, AgentRoleData> = {
  duelist: {
    name: 'Duelist',
    description: 'Self-sufficient fraggers who create space and lead attacks.',
    iconName: 'Sword',
    color: '#FF4655',
    agents: ['Jett', 'Reyna', 'Phoenix', 'Neon', 'Yoru', 'Iso', 'Waylay'],
  },
  initiator: {
    name: 'Initiator',
    description: 'Challengers who help breach enemy territory with recon and stuns.',
    iconName: 'Zap',
    color: '#F5A623',
    agents: ['Sova', 'Breach', 'Skye', 'KAY/O', 'Fade', 'Gekko'],
  },
  controller: {
    name: 'Controller',
    description: 'Masters of vision control who cut off areas with smokes and walls.',
    iconName: 'Wind',
    color: '#00B4D8',
    agents: ['Brimstone', 'Viper', 'Omen', 'Astra', 'Harbor', 'Clove'],
  },
  sentinel: {
    name: 'Sentinel',
    description: 'Defensive experts who lock down areas and protect teammates from flanks.',
    iconName: 'Shield',
    color: '#00C875',
    agents: ['Killjoy', 'Cypher', 'Sage', 'Chamber', 'Deadlock', 'Vyse'],
  },
};

// ─── Quick-Lookup Maps ────────────────────────────────────────────────────────

/** Maps lowercase role name → lucide-react icon name */
export const AGENT_ROLE_ICONS: Record<string, string> = {
  duelist:    'Sword',
  initiator:  'Zap',
  controller: 'Wind',
  sentinel:   'Shield',
};

/** Maps lowercase role name → brand colour hex */
export const AGENT_ROLE_COLORS: Record<string, string> = {
  duelist:    '#FF4655',
  initiator:  '#F5A623',
  controller: '#00B4D8',
  sentinel:   '#00C875',
};

// ─── Full Agent Roster ────────────────────────────────────────────────────────

export const ALL_AGENTS = [
  'Brimstone', 'Viper',    'Omen',      'Killjoy',  'Cypher',
  'Sova',      'Sage',     'Phoenix',   'Jett',     'Reyna',
  'Raze',      'Breach',   'Skye',      'Yoru',     'Astra',
  'KAY/O',     'Chamber',  'Neon',      'Fade',     'Harbor',
  'Gekko',     'Deadlock', 'Iso',       'Clove',    'Vyse',
  'Waylay',
] as const;

export type AgentName = (typeof ALL_AGENTS)[number];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the role key ("duelist", "sentinel", …) for a given agent name, or null. */
export function getRoleForAgent(agentName: string): string | null {
  for (const [role, data] of Object.entries(AGENT_ROLES)) {
    if (data.agents.includes(agentName)) return role;
  }
  return null;
}

/** Returns all agents belonging to the given role. */
export function getAgentsForRole(role: string): string[] {
  return AGENT_ROLES[role.toLowerCase()]?.agents ?? [];
}

/** Returns the role colour for an agent, or a neutral gray fallback. */
export function getColorForAgent(agentName: string): string {
  const role = getRoleForAgent(agentName);
  return role ? AGENT_ROLE_COLORS[role] : '#9CA3AF';
}
