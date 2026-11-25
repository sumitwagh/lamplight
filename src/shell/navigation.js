// Top-navigation items shared by every screen: [id, label, href]
export const NAV_ITEMS = [
  ['home', 'Reading Room', '#/'],
  ['explore', 'Library', '#/explore'],
  ['forum', 'Community', '#/community'],
  ['feed', 'Feed', '#/feed'],
  ['leaders', 'Leaderboard', '#/leaderboard'],
  ['studio', 'AI Studio', '#/studio'],
];

export function navigation(active, page = '01') {
  return {
    page,
    links: NAV_ITEMS.map(([id, label, href], i) => ({
      id,
      label,
      href,
      n: String(i + 1).padStart(2, '0'),
      current: id === active ? 'page' : 'false',
    })),
  };
}
