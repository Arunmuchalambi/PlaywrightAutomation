#!/usr/bin/env node
/**
 * Runs ExpandTesting UI + API suites (single shared window) and builds
 * the overall Opsera-style dashboard with combined cucumber report.
 *
 * Headed: HEADED=true npm run report:expand
 * Headless (default): npm run report:expand
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const RESULTS = path.join(ROOT, 'test-results');
const CUCUMBER_JSON = path.join(RESULTS, 'cucumber-report.json');
const CUCUMBER_HTML = path.join(RESULTS, 'cucumber-report.html');
const INDEX = path.join(RESULTS, 'index.html');

const headed = process.env.HEADED === 'true';
const expandEnv = {
  HEADED: headed ? 'true' : 'false',
  SLOW_MO: process.env.SLOW_MO || (headed ? '50' : '0'),
  BASE_URL: 'https://practice.expandtesting.com',
  SUT: 'expand',
};

function run(cmd, args, env = {}) {
  console.log(`\n▶ ${cmd} ${args.join(' ')}`);
  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    env: { ...process.env, ...env },
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
  console.log('  ExpandTesting UI + API — Full Run + Report');
  console.log(`  Mode: ${headed ? 'HEADED (one window)' : 'headless'}  slowMo=${expandEnv.SLOW_MO}`);
  console.log('══════════════════════════════════════════════');

  // UI core + catalog (not API)
  const uiOk = run(
    'npx',
    ['cucumber-js', '--tags', '@expand and not @api', '--parallel', '1'],
    expandEnv,
  );
  copyIfExists(CUCUMBER_JSON, path.join(RESULTS, 'cucumber-ui-report.json'));
  copyIfExists(CUCUMBER_HTML, path.join(RESULTS, 'cucumber-ui-report.html'));
  run('node', [
    'scripts/generate-overall-report.js',
    '--archive-cucumber',
    path.join(RESULTS, 'cucumber-ui-report.json'),
  ]);

  // API cucumber
  const apiOk = run(
    'npx',
    ['cucumber-js', '--tags', '@expand and @api', '--parallel', '1'],
    expandEnv,
  );
  copyIfExists(CUCUMBER_JSON, path.join(RESULTS, 'cucumber-api-report.json'));
  copyIfExists(CUCUMBER_HTML, path.join(RESULTS, 'cucumber-api-report.html'));
  run('node', [
    'scripts/generate-overall-report.js',
    '--archive-cucumber',
    path.join(RESULTS, 'cucumber-api-report.json'),
  ]);

  run('node', ['scripts/generate-overall-report.js', '--merge-cucumber']);

  // Playwright API specs
  const pwOk = run('npx', ['playwright', 'test', 'tests/api/expand-api.spec.js', '--project=api', '--workers=1']);
  run('node', ['scripts/generate-overall-report.js', '--archive-playwright']);
  run('node', ['scripts/generate-overall-report.js']);

  console.log('\n══════════════════════════════════════════════');
  console.log(`Expand UI:          ${uiOk ? 'PASSED' : 'FAILED'}`);
  console.log(`Expand API (BDD):   ${apiOk ? 'PASSED' : 'FAILED'}`);
  console.log(`Expand API (PW):    ${pwOk ? 'PASSED' : 'FAILED'}`);
  console.log(`Combined report:    file://${CUCUMBER_HTML}`);
  console.log(`Overall dashboard:  file://${INDEX}`);
  console.log('══════════════════════════════════════════════\n');

  process.exit(uiOk && apiOk && pwOk ? 0 : 1);
}

main();
