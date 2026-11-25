// Top-navigation items shared by every screen: [id, label, href]
export const NAV_ITEMS = [
  ['home', 'Home', '#/'],
  ['explore', 'Explore', '#/explore'],
  ['forum', 'Community', '#/community'],
  ['feed', 'Feed', '#/feed'],
  ['leaders', 'Leaderboard', '#/leaderboard'],
  ['studio', 'AI Studio', '#/studio'],
];

export function navigation(active) {
  return {
    links: NAV_ITEMS.map(([id, label, href]) => ({
      id,
      label,
      href,
      current: id === active ? 'page' : 'false',
      style: id === active ? 'color:#0A0A10;background:#F2F0EA' : 'color:#B9B7C6;background:transparent',
    })),
  };
}
