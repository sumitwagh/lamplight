import './shell/shell.css';
import { startRouter, go } from './router.js';
import { startScroll, startCursor, startPalette, preloader } from './lib/ui.js';

startScroll();
startCursor();
startPalette(go);
preloader().then(() => document.documentElement.classList.add('is-lit'));
startRouter();
