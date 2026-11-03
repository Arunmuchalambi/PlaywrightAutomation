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
      headless: process.env.HEADED === 'true' ? false : process.env.CI ? true : false,
      slowMo: Number(process.env.SLOW_MO || 0),
      baseURL: process.env.BASE_URL || 'https://testautomationpractice.blogspot.com',
    },
  },
};
