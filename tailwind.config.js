/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './layout/*.liquid',
    './sections/*.liquid',
    './snippets/*.liquid',
    './templates/**/*.{liquid,json}',
    './assets/*.js',
    './*.html', // For testing
  ],
};
