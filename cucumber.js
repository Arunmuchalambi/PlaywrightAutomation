// Default: headless. Set HEADED=true only when you want to watch the browser.
const headed = process.env.HEADED === 'true';

module.exports = {
  default: {
    requireModule: [],
    require: ['support/*.js', 'stepdefinitions/**/*.js'],
    paths: ['features/**/*.feature'],
    format: [
      'progress-bar',
      'html:test-results/cucumber-report.html',
      'json:test-results/cucumber-report.json',
    ],
    formatOptions: { snippetInterface: 'async-await' },
    publishQuiet: true,
    parallel: 1,
    worldParameters: {
      headless: !headed,
      slowMo: Number(process.env.SLOW_MO || 0),
      baseURL: process.env.BASE_URL || 'https://testautomationpractice.blogspot.com',
    },
  },
};
