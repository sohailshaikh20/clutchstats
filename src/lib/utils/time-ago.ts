/** Henrik `game_start` is usually Unix seconds; handle ms if needed. */
export function formatTimeAgo(gameStart: number): string {
  const sec = gameStart > 1e11 ? gameStart / 1000 : gameStart;
  const diff = Math.max(0, Date.now() / 1000 - sec);
  if (diff < 45) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / (86400 * 30))}mo ago`;
}
