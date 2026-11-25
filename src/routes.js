// Every screen in the app, keyed by its URL hash (#/discover, #/book …).
// To add a screen: create src/screens/<name>/ with template.html, screen.js and style.css,
// then add it here and (optionally) to src/shell/navigation.js.
import ReadingRoomScreen from './screens/home/screen.js';
import homeMarkup from './screens/home/template.html?raw';
import homeStyle from './screens/home/style.css?inline';
import LibraryScreen from './screens/explore/screen.js';
import exploreMarkup from './screens/explore/template.html?raw';
import exploreStyle from './screens/explore/style.css?inline';
import BookScreen from './screens/book/screen.js';
import bookTemplate from './screens/book/template.html?raw';
import { expandPages } from './screens/book/page.js';
import bookStyle from './screens/book/style.css?inline';

const bookMarkup = expandPages(bookTemplate);
import AuthorScreen from './screens/author/screen.js';
import authorMarkup from './screens/author/template.html?raw';
import authorStyle from './screens/author/style.css?inline';
import CommunityScreen from './screens/community/screen.js';
import communityMarkup from './screens/community/template.html?raw';
import communityStyle from './screens/community/style.css?inline';
import FeedScreen from './screens/feed/screen.js';
import feedMarkup from './screens/feed/template.html?raw';
import feedStyle from './screens/feed/style.css?inline';
import LeaderboardScreen from './screens/leaderboard/screen.js';
import leaderboardMarkup from './screens/leaderboard/template.html?raw';
import leaderboardStyle from './screens/leaderboard/style.css?inline';
import StudioScreen from './screens/studio/screen.js';
import studioMarkup from './screens/studio/template.html?raw';
import studioStyle from './screens/studio/style.css?inline';
import DashboardScreen from './screens/dashboard/screen.js';
import dashboardMarkup from './screens/dashboard/template.html?raw';
import dashboardStyle from './screens/dashboard/style.css?inline';

export const ROUTES = {
  '/': { page: '001', Screen: ReadingRoomScreen, markup: homeMarkup, style: homeStyle, nav: 'home', title: 'The Reading Room' },
  '/explore': { page: '024', Screen: LibraryScreen, markup: exploreMarkup, style: exploreStyle, nav: 'explore', title: '3D Library' },
  '/book': { page: '071', Screen: BookScreen, markup: bookMarkup, style: bookStyle, nav: 'explore', title: 'Book' },
  '/author': { page: '112', Screen: AuthorScreen, markup: authorMarkup, style: authorStyle, nav: 'none', title: 'Author' },
  '/community': { page: '148', Screen: CommunityScreen, markup: communityMarkup, style: communityStyle, nav: 'forum', title: 'Community' },
  '/feed': { page: '186', Screen: FeedScreen, markup: feedMarkup, style: feedStyle, nav: 'feed', title: 'Feed' },
  '/leaderboard': { page: '233', Screen: LeaderboardScreen, markup: leaderboardMarkup, style: leaderboardStyle, nav: 'leaders', title: 'Leaderboard' },
  '/studio': { page: '270', Screen: StudioScreen, markup: studioMarkup, style: studioStyle, nav: 'studio', title: 'AI Studio' },
  '/dashboard': { page: '318', Screen: DashboardScreen, markup: dashboardMarkup, style: dashboardStyle, nav: 'none', title: 'Author dashboard' },
};
