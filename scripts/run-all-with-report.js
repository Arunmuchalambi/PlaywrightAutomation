#!/usr/bin/env node
/**
 * Runs UI (Cucumber) + API (Cucumber + Playwright) suites, then builds the
 * Opsera-style overall dashboard at test-results/index.html
 *
 * Keeps separate + combined Cucumber reports:
 *   cucumber-ui-report.html / .json
 *   cucumber-api-report.html / .json
 *   cucumber-report.html / .json   ← combined UI + API
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const RESULTS = path.join(ROOT, 'test-results');
const INDEX = path.join(RESULTS, 'index.html');
const CUCUMBER_JSON = path.join(RESULTS, 'cucumber-report.json');
const CUCUMBER_HTML = path.join(RESULTS, 'cucumber-report.html');

function run(cmd, args, opts = {}) {
  console.log(`\n▶ ${cmd} ${args.join(' ')}`);
  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    env: { ...process.env, ...(opts.env || {}) },
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  return result.status === 0;
}

function copyIfExists(src, dest) {
  if (!fs.existsSync(src)) return false;
  fs.copyFileSync(src, dest);
  return true;
}

function main() {
  fs.mkdirSync(RESULTS, { recursive: true });

  console.log('══════════════════════════════════════════════');
  console.log('  UI + API Automation — Full Run + Report');
  console.log('══════════════════════════════════════════════');

  const headlessEnv = { HEADED: 'false', SLOW_MO: '0' };

  // 1) UI Cucumber
  const uiOk = run('npx', ['cucumber-js', '--tags', 'not @api'], { env: headlessEnv });
  copyIfExists(CUCUMBER_JSON, path.join(RESULTS, 'cucumber-ui-report.json'));
  copyIfExists(CUCUMBER_HTML, path.join(RESULTS, 'cucumber-ui-report.html'));
  run('node', ['scripts/generate-overall-report.js', '--archive-cucumber', path.join(RESULTS, 'cucumber-ui-report.json')]);

  // 2) API Cucumber
  const apiCucumberOk = run('npx', ['cucumber-js', '--tags', '@api'], { env: headlessEnv });
  copyIfExists(CUCUMBER_JSON, path.join(RESULTS, 'cucumber-api-report.json'));
  copyIfExists(CUCUMBER_HTML, path.join(RESULTS, 'cucumber-api-report.html'));
  run('node', [
    'scripts/generate-overall-report.js',
    '--archive-cucumber',
    path.join(RESULTS, 'cucumber-api-report.json'),
  ]);

  // 3) Merge UI + API into combined cucumber-report.*
  run('node', ['scripts/generate-overall-report.js', '--merge-cucumber']);

  // 4) Playwright API
  const apiPwOk = run('npx', ['playwright', 'test', '--project=api', '--workers=1'], {
    env: headlessEnv,
  });
  run('node', ['scripts/generate-overall-report.js', '--archive-playwright']);

  // 5) Final dashboard
  run('node', ['scripts/generate-overall-report.js']);

  console.log('\n══════════════════════════════════════════════');
  console.log(`UI Cucumber:        ${uiOk ? 'PASSED' : 'FAILED'}`);
  console.log(`API Cucumber:       ${apiCucumberOk ? 'PASSED' : 'FAILED'}`);
  console.log(`API Playwright:     ${apiPwOk ? 'PASSED' : 'FAILED'}`);
  console.log(`UI report:          file://${path.join(RESULTS, 'cucumber-ui-report.html')}`);
  console.log(`API report:         file://${path.join(RESULTS, 'cucumber-api-report.html')}`);
  console.log(`Combined Cucumber:  file://${CUCUMBER_HTML}`);
  console.log(`Overall dashboard:  file://${INDEX}`);
  console.log('══════════════════════════════════════════════\n');

  process.exit(uiOk && apiCucumberOk && apiPwOk ? 0 : 1);
}

main();
