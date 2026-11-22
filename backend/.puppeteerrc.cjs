const { join } = require('path');

/**
 * Store Puppeteer's downloaded Chrome inside the project folder instead of
 * ~/.cache. On Render, only the project directory survives from the build
 * step into the running service, so the default cache location would leave
 * the server without a browser ("Could not find Chrome").
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
