export function profileIsPremium(profile: {
  is_premium: boolean;
  premium_until: string | null;
}): boolean {
  if (!profile.is_premium) return false;
  if (!profile.premium_until) return true;
  return new Date(profile.premium_until).getTime() > Date.now();
}
