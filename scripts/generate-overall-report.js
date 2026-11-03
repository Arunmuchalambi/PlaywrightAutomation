#!/usr/bin/env node
/**
 * Builds Opsera-style overall dashboard at test-results/index.html
 * covering both UI (Cucumber BDD) and API (Playwright + Cucumber) runs.
 *
 * Usage:
 *   node scripts/generate-overall-report.js
 *   node scripts/generate-overall-report.js --archive-cucumber [json]
 *   node scripts/generate-overall-report.js --archive-playwright [json]
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const reporter = require('cucumber-html-reporter');

const RESULTS_DIR = path.join(process.cwd(), 'test-results');
const HISTORY_DIR = path.join(RESULTS_DIR, 'history');
const RUNS_INDEX = path.join(HISTORY_DIR, 'runs.json');
const CUCUMBER_JSON = path.join(RESULTS_DIR, 'cucumber-report.json');
const CUCUMBER_UI_JSON = path.join(RESULTS_DIR, 'cucumber-ui-report.json');
const CUCUMBER_API_JSON = path.join(RESULTS_DIR, 'cucumber-api-report.json');
const PLAYWRIGHT_JSON = path.join(RESULTS_DIR, 'playwright-results.json');

function ensureDirs() {
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
}

function slugify(value) {
  return String(value)
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'run';
}

function formatStamp(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

function formatDuration(ms) {
  if (!ms || ms < 1000) return `${ms || 0}ms`;
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function readRuns() {
  if (!fs.existsSync(RUNS_INDEX)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(RUNS_INDEX, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRuns(runs) {
  runs.sort((a, b) => new Date(b.executedAt) - new Date(a.executedAt));
  fs.writeFileSync(RUNS_INDEX, JSON.stringify(runs, null, 2));
}

function visibleSteps(scenario) {
  return (scenario.steps || []).filter(
    (step) => step.result && !step.hidden && !['Before', 'After'].includes(step.keyword),
  );
}

function scenarioStatus(scenario) {
  const steps = visibleSteps(scenario);
  if (steps.some((step) => step.result.status === 'failed')) return 'failed';
  if (steps.some((step) => ['undefined', 'ambiguous'].includes(step.result.status))) return 'failed';
  if (steps.length > 0 && steps.every((step) => step.result.status === 'skipped')) return 'skipped';
  return 'passed';
}

function summarizeCucumber(report) {
  const summary = {
    features: [],
    scenarios: { total: 0, passed: 0, failed: 0, skipped: 0 },
    steps: { total: 0, passed: 0, failed: 0, skipped: 0 },
    durationMs: 0,
    failures: [],
  };

  report.forEach((feature) => {
    if (feature.name) summary.features.push(feature.name);
    (feature.elements || []).forEach((scenario) => {
      if (scenario.type === 'background') return;
      summary.scenarios.total++;
      const status = scenarioStatus(scenario);
      summary.scenarios[status] = (summary.scenarios[status] || 0) + 1;
      visibleSteps(scenario).forEach((step) => {
        summary.steps.total++;
        const stepStatus = step.result.status;
        if (summary.steps[stepStatus] !== undefined) summary.steps[stepStatus]++;
        summary.durationMs += (step.result.duration || 0) / 1e6;
        if (stepStatus === 'failed') {
          summary.failures.push({
            scenario: scenario.name,
            step: `${step.keyword || ''}${step.name || ''}`.trim(),
            error: (step.result.error_message || '').split('\n').slice(0, 3).join(' '),
          });
        }
      });
    });
  });

  summary.durationMs = Math.round(summary.durationMs);
  summary.status = summary.scenarios.failed > 0 ? 'failed' : 'passed';
  return summary;
}

function detectSuiteType(features) {
  const joined = features.join(' ').toLowerCase();
  if (joined.includes('api testing') || joined.includes('jsonplaceholder') || joined.includes('rest')) {
    return 'API';
  }
  return 'UI';
}

function summarizePlaywright(report) {
  const suites = [];
  const walk = (suite, trail = []) => {
    const name = [...trail, suite.title].filter(Boolean);
    (suite.specs || []).forEach((spec) => {
      suites.push({ title: [...name, spec.title].filter(Boolean).join(' › '), spec });
    });
    (suite.suites || []).forEach((child) => walk(child, name));
  };
  (report.suites || []).forEach((s) => walk(s));

  const summary = {
    features: [],
    scenarios: { total: 0, passed: 0, failed: 0, skipped: 0 },
    steps: { total: 0, passed: 0, failed: 0, skipped: 0 },
    durationMs: 0,
    failures: [],
  };

  const featureSet = new Set();
  suites.forEach(({ title, spec }) => {
    const ok = (spec.tests || []).some((t) =>
      (t.results || []).some((r) => r.status === 'passed' || r.status === 'skipped'),
    );
    const failed = (spec.tests || []).some((t) =>
      (t.results || []).some((r) => r.status === 'failed' || r.status === 'timedOut'),
    );
    const skipped = !failed && (spec.tests || []).every((t) =>
      (t.results || []).every((r) => r.status === 'skipped'),
    );

    summary.scenarios.total++;
    summary.steps.total++;
    if (failed) {
      summary.scenarios.failed++;
      summary.steps.failed++;
      const err =
        (((spec.tests || [])[0] || {}).results || [])
          .map((r) => (r.error && r.error.message) || '')
          .filter(Boolean)[0] || 'failed';
      summary.failures.push({ scenario: title, step: title, error: String(err).split('\n')[0] });
    } else if (skipped) {
      summary.scenarios.skipped++;
      summary.steps.skipped++;
    } else if (ok) {
      summary.scenarios.passed++;
      summary.steps.passed++;
    }

    const top = title.split(' › ')[0] || 'Playwright';
    featureSet.add(top);

    (spec.tests || []).forEach((t) => {
      (t.results || []).forEach((r) => {
        summary.durationMs += r.duration || 0;
      });
    });
  });

  summary.features = [...featureSet];
  summary.durationMs = Math.round(summary.durationMs);
  summary.status = summary.scenarios.failed > 0 ? 'failed' : 'passed';
  return summary;
}

function buildCucumberHtml(jsonPath, outputPath, metadata) {
  reporter.generate({
    theme: 'bootstrap',
    jsonFile: jsonPath,
    output: outputPath,
    reportSuiteAsScenarios: true,
    scenarioTimestamp: true,
    launchReport: false,
    metadata,
  });
}

function buildPlaywrightHtml(summary, outputPath, meta) {
  const rows = (summary.failures || [])
    .map(
      (f) => `<tr><td>${escapeHtml(f.scenario)}</td><td>${escapeHtml(f.error)}</td></tr>`,
    )
    .join('');
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Playwright API Report</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:24px;background:#f8f9fa;color:#1c2333}
.card{background:#fff;border-radius:12px;padding:20px;box-shadow:0 8px 24px rgba(0,0,0,.12);margin-bottom:16px}
.badge{padding:4px 12px;border-radius:999px;color:#fff;font-weight:700;font-size:12px}
.passed{background:#10b981}.failed{background:#ef4444}
table{width:100%;border-collapse:collapse}td,th{padding:10px;border-bottom:1px solid #eee;text-align:left}
</style></head><body>
<h1>Playwright Report — ${escapeHtml(meta.suiteType)}</h1>
<div class="card">
  <p><strong>Executed:</strong> ${escapeHtml(meta.executedAt)}</p>
  <p><strong>Status:</strong> <span class="badge ${summary.status}">${summary.status.toUpperCase()}</span></p>
  <p><strong>Tests:</strong> ${summary.scenarios.passed}/${summary.scenarios.total} passed</p>
  <p><strong>Duration:</strong> ${formatDuration(summary.durationMs)}</p>
</div>
${rows ? `<div class="card"><h3>Failures</h3><table><thead><tr><th>Test</th><th>Error</th></tr></thead><tbody>${rows}</tbody></table></div>` : '<div class="card">All tests passed.</div>'}
</body></html>`;
  fs.writeFileSync(outputPath, html);
}

function archiveEntry({ checksum, summary, suiteType, label, sourceKind, executedAt = new Date(), extraFiles = {} }) {
  const existing = readRuns().find((run) => run.checksum === checksum);
  if (existing) {
    return { runId: existing.id, skipped: true, summary: null };
  }

  const stamp = formatStamp(executedAt);
  const runId = `${stamp}__${slugify(suiteType)}-${slugify(label)}`;
  const runDir = path.join(HISTORY_DIR, runId);
  fs.mkdirSync(runDir, { recursive: true });

  Object.entries(extraFiles).forEach(([name, content]) => {
    const dest = path.join(runDir, name);
    if (typeof content === 'string' && fs.existsSync(content)) {
      fs.copyFileSync(content, dest);
    } else if (Buffer.isBuffer(content) || typeof content === 'string') {
      fs.writeFileSync(dest, content);
    }
  });

  const runs = readRuns().filter((run) => run.id !== runId);
  runs.push({
    id: runId,
    checksum,
    executedAt: executedAt.toISOString(),
    suiteType,
    sourceKind,
    feature: label,
    features: summary.features,
    status: summary.status,
    scenarios: summary.scenarios,
    steps: summary.steps,
    durationMs: summary.durationMs,
    failures: summary.failures,
    reportPath: `history/${runId}/report.html`,
    jsonPath: `history/${runId}/report.json`,
  });
  writeRuns(runs);
  return { runId, skipped: false, summary };
}

function archiveCucumber(sourceJson = CUCUMBER_JSON) {
  if (!fs.existsSync(sourceJson)) throw new Error(`Cucumber JSON not found: ${sourceJson}`);
  const raw = fs.readFileSync(sourceJson, 'utf8');
  const report = JSON.parse(raw);
  if (!Array.isArray(report) || report.length === 0) throw new Error('Empty cucumber JSON');

  const checksum = crypto.createHash('sha1').update(raw).digest('hex');
  const summary = summarizeCucumber(report);
  const suiteType = detectSuiteType(summary.features);
  const label = summary.features[0] || 'Cucumber Run';
  const executedAt = new Date();

  const stampDir = path.join(HISTORY_DIR, '_tmp_write');
  fs.mkdirSync(stampDir, { recursive: true });
  const tmpJson = path.join(stampDir, 'report.json');
  fs.writeFileSync(tmpJson, raw);

  const result = archiveEntry({
    checksum,
    summary,
    suiteType,
    label,
    sourceKind: 'cucumber',
    executedAt,
    extraFiles: { 'report.json': tmpJson },
  });

  if (!result.skipped) {
    const runDir = path.join(HISTORY_DIR, result.runId);
    buildCucumberHtml(path.join(runDir, 'report.json'), path.join(runDir, 'report.html'), {
      'Executed At': executedAt.toLocaleString(),
      Suite: suiteType,
      Feature: label,
      Platform: process.platform,
      Result: summary.status.toUpperCase(),
    });

    // Suite-specific root report (do NOT overwrite the combined cucumber-report.html here)
    const suiteHtml =
      suiteType === 'API'
        ? path.join(RESULTS_DIR, 'cucumber-api-report.html')
        : path.join(RESULTS_DIR, 'cucumber-ui-report.html');
    const suiteJson =
      suiteType === 'API'
        ? path.join(RESULTS_DIR, 'cucumber-api-report.json')
        : path.join(RESULTS_DIR, 'cucumber-ui-report.json');
    if (path.resolve(sourceJson) !== path.resolve(suiteJson)) {
      fs.copyFileSync(sourceJson, suiteJson);
    }
    buildCucumberHtml(suiteJson, suiteHtml, {
      'Executed At': executedAt.toLocaleString(),
      Suite: suiteType,
      Result: summary.status.toUpperCase(),
    });
  }

  fs.rmSync(stampDir, { recursive: true, force: true });
  return result;
}

/**
 * Merge UI + API Cucumber JSON into one combined report (cucumber-report.html).
 */
function mergeCucumberReports() {
  const parts = [];
  for (const file of [CUCUMBER_UI_JSON, CUCUMBER_API_JSON]) {
    if (!fs.existsSync(file)) {
      console.warn(`Missing for merge: ${file}`);
      continue;
    }
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (Array.isArray(data)) parts.push(...data);
  }
  if (parts.length === 0) {
    throw new Error('No UI/API cucumber JSON found to merge. Run report:all first.');
  }

  fs.writeFileSync(CUCUMBER_JSON, JSON.stringify(parts, null, 2));
  const summary = summarizeCucumber(parts);
  buildCucumberHtml(CUCUMBER_JSON, path.join(RESULTS_DIR, 'cucumber-report.html'), {
    'Executed At': new Date().toLocaleString(),
    Suite: 'UI + API Combined',
    Features: summary.features.join(', '),
    Scenarios: `${summary.scenarios.passed}/${summary.scenarios.total}`,
    Result: summary.status.toUpperCase(),
  });

  console.log(
    `Combined Cucumber report: ${summary.scenarios.passed}/${summary.scenarios.total} scenarios ` +
      `(${summary.features.length} features) → test-results/cucumber-report.html`,
  );
  return summary;
}

function archivePlaywright(sourceJson = PLAYWRIGHT_JSON) {
  if (!fs.existsSync(sourceJson)) throw new Error(`Playwright JSON not found: ${sourceJson}`);
  const raw = fs.readFileSync(sourceJson, 'utf8');
  const report = JSON.parse(raw);
  const checksum = crypto.createHash('sha1').update(raw).digest('hex');
  const summary = summarizePlaywright(report);
  const suiteType = summary.features.some((f) => /api|rest|broken|http/i.test(f)) ? 'API' : 'UI';
  const label = summary.features[0] || 'Playwright Suite';
  const executedAt = new Date();

  const result = archiveEntry({
    checksum,
    summary,
    suiteType,
    label,
    sourceKind: 'playwright',
    executedAt,
    extraFiles: { 'report.json': sourceJson },
  });

  if (!result.skipped) {
    const runDir = path.join(HISTORY_DIR, result.runId);
    buildPlaywrightHtml(summary, path.join(runDir, 'report.html'), {
      suiteType,
      executedAt: executedAt.toLocaleString(),
    });
  }
  return result;
}

function suiteTotals(runs, type) {
  const filtered = type ? runs.filter((r) => r.suiteType === type) : runs;
  return filtered.reduce(
    (acc, run) => {
      acc.runs++;
      if (run.status === 'passed') acc.passed++;
      else acc.failed++;
      acc.scenarios += run.scenarios.total || 0;
      acc.scenariosPassed += run.scenarios.passed || 0;
      acc.scenariosFailed += run.scenarios.failed || 0;
      acc.steps += run.steps.total || 0;
      acc.durationMs += run.durationMs || 0;
      return acc;
    },
    { runs: 0, passed: 0, failed: 0, scenarios: 0, scenariosPassed: 0, scenariosFailed: 0, steps: 0, durationMs: 0 },
  );
}

function buildDashboard() {
  const runs = readRuns();
  const overall = suiteTotals(runs);
  const ui = suiteTotals(runs, 'UI');
  const api = suiteTotals(runs, 'API');
  const passPct = overall.runs ? ((overall.passed / overall.runs) * 100).toFixed(1) : 0;
  const failPct = overall.runs ? ((overall.failed / overall.runs) * 100).toFixed(1) : 0;

  const features = [...new Set(runs.map((r) => r.feature))].sort();
  const featureOptions = features
    .map((f) => `<option value="${escapeHtml(f)}">${escapeHtml(f)}</option>`)
    .join('\n');

  const rows = runs
    .map((run) => {
      const executed = new Date(run.executedAt);
      const failureHint =
        run.failures && run.failures.length
          ? `<div class="hint">${escapeHtml(run.failures[0].step)}</div>`
          : '';
      return `
        <tr data-feature="${escapeHtml(run.feature)}" data-status="${run.status}" data-suite="${run.suiteType || ''}">
          <td>
            <div class="when">${executed.toLocaleString()}</div>
            <div class="hint">${escapeHtml(run.id)}</div>
          </td>
          <td>
            <div><span class="suite-pill ${(run.suiteType || '').toLowerCase()}">${escapeHtml(run.suiteType || 'UI')}</span> ${escapeHtml(run.feature)}</div>
            ${failureHint}
          </td>
          <td><span class="badge ${run.status}">${run.status.toUpperCase()}</span></td>
          <td class="num">${run.scenarios.passed}/${run.scenarios.total}</td>
          <td class="num">${run.steps.passed}/${run.steps.total}</td>
          <td class="num">${formatDuration(run.durationMs)}</td>
          <td class="links">
            <a href="${run.reportPath}" target="_blank">HTML</a>
            <a href="${run.jsonPath}" target="_blank">JSON</a>
          </td>
        </tr>`;
    })
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Playwright Automation — Overall Report</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  body {
    margin: 0; padding: 32px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #f8f9fa; color: #1c2333; min-height: 100vh;
  }
  .container { max-width: 1400px; margin: 0 auto; }
  h1 {
    margin: 0 0 8px; font-size: 30px; font-weight: 500; text-align: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    animation: fadeIn 0.6s ease;
  }
  .sub { color: #6b7280; margin-bottom: 24px; font-size: 14px; text-align: center; animation: fadeIn 0.8s ease; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 24px; }
  .card {
    background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    transition: all 0.3s ease; position: relative; overflow: hidden; animation: fadeIn 1s ease;
  }
  .card::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; background: linear-gradient(90deg,#667eea,#764ba2); }
  .card:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.2); }
  .card .label { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: #6b7280; font-weight: 600; }
  .card .value {
    font-size: 34px; font-weight: 700; margin-top: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .card.pass::before { background: linear-gradient(90deg,#10b981,#059669); }
  .card.pass .value { background: linear-gradient(135deg,#10b981,#059669); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .card.fail::before { background: linear-gradient(90deg,#ef4444,#dc2626); }
  .card.fail .value { background: linear-gradient(135deg,#ef4444,#dc2626); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .card.api::before { background: linear-gradient(90deg,#0ea5e9,#0284c7); }
  .card.api .value { background: linear-gradient(135deg,#0ea5e9,#0284c7); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .card.ui::before { background: linear-gradient(90deg,#f59e0b,#d97706); }
  .card.ui .value { background: linear-gradient(135deg,#f59e0b,#d97706); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .panel { background:#fff; border-radius:16px; padding:24px; margin-bottom:24px; box-shadow:0 10px 30px rgba(0,0,0,0.15); }
  .grid-2 { display:grid; grid-template-columns: 200px 1fr; gap:32px; align-items:center; }
  .suite-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:24px; }
  @media (max-width: 900px) { .grid-2, .suite-grid { grid-template-columns: 1fr; } }
  .suite-box { background:#fff; border-radius:16px; padding:20px; box-shadow:0 10px 30px rgba(0,0,0,0.12); }
  .suite-box h3 { margin:0 0 12px; font-size:16px; }
  .bar { flex:1; background:#f3f4f6; height:20px; border-radius:10px; overflow:hidden; }
  .bar > div { height:100%; transition:width .5s ease; }
  .controls { display:flex; gap:12px; margin-bottom:20px; flex-wrap:wrap; }
  select { padding:10px 14px; border:1px solid #d1d5db; border-radius:8px; background:#fff; font-size:14px; font-weight:500; }
  table { width:100%; border-collapse:collapse; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.15); }
  th, td { padding:16px 18px; text-align:left; border-bottom:1px solid #f3f4f6; font-size:14px; vertical-align:top; }
  th { background: linear-gradient(135deg,#667eea,#764ba2); color:#fff; font-size:12px; text-transform:uppercase; letter-spacing:.08em; font-weight:600; }
  tbody tr:hover { background:#f9fafb; }
  td.num, th.num { text-align:right; white-space:nowrap; }
  .badge { display:inline-block; padding:5px 14px; border-radius:999px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#fff; }
  .badge.passed { background: linear-gradient(135deg,#10b981,#059669); }
  .badge.failed { background: linear-gradient(135deg,#ef4444,#dc2626); }
  .suite-pill { display:inline-block; padding:2px 8px; border-radius:999px; font-size:10px; font-weight:700; margin-right:6px; color:#fff; }
  .suite-pill.ui { background:#f59e0b; }
  .suite-pill.api { background:#0ea5e9; }
  .when { font-weight:600; color:#1f2937; }
  .hint { color:#6b7280; font-size:12px; margin-top:3px; }
  .links a { color:#667eea; text-decoration:none; margin-right:12px; font-weight:600; }
  .links a:hover { color:#764ba2; text-decoration:underline; }
  .empty { padding:60px; text-align:center; color:#6b7280; }
  .quick-links a { margin-right:16px; font-weight:600; color:#667eea; text-decoration:none; }
</style>
</head>
<body>
  <div class="container">
    <h1>Test Execution Summary</h1>
    <div class="sub">Overall UI + API Automation Report · Generated ${new Date().toLocaleString()}</div>

    <div class="panel" style="text-align:center;">
      <div class="quick-links">
        <a href="cucumber-report.html" target="_blank">Combined Cucumber (UI+API)</a>
        <a href="cucumber-ui-report.html" target="_blank">UI Cucumber</a>
        <a href="cucumber-api-report.html" target="_blank">API Cucumber</a>
        <a href="../playwright-report/index.html" target="_blank">Playwright HTML</a>
        <a href="history/runs.json" target="_blank">runs.json</a>
        <a href="overall-summary.json" target="_blank">Summary JSON</a>
      </div>
    </div>

    <div class="panel">
      <h2 style="margin:0 0 20px;font-size:18px;">Overall Execution</h2>
      <div class="grid-2">
        <div><canvas id="executionChart" width="200" height="200"></canvas></div>
        <div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:16px;">
            <div><div class="hint">Test Runs</div><div style="font-size:22px;font-weight:700;">${overall.runs}</div></div>
            <div><div class="hint">Passed</div><div style="font-size:22px;font-weight:700;color:#10b981;">${overall.passed}</div></div>
            <div><div class="hint">Failed</div><div style="font-size:22px;font-weight:700;color:#ef4444;">${overall.failed}</div></div>
            <div><div class="hint">Scenarios</div><div style="font-size:22px;font-weight:700;color:#f59e0b;">${overall.scenarios}</div></div>
          </div>
          <div style="border-top:1px solid #e5e7eb;padding-top:16px;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
              <div style="min-width:90px;font-weight:600;">Passed</div>
              <div class="bar"><div style="width:${passPct}%;background:linear-gradient(90deg,#10b981,#059669);"></div></div>
              <div style="min-width:50px;text-align:right;font-weight:700;color:#10b981;">${Math.round(passPct)}%</div>
            </div>
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="min-width:90px;font-weight:600;">Failed</div>
              <div class="bar"><div style="width:${failPct}%;background:linear-gradient(90deg,#ef4444,#dc2626);"></div></div>
              <div style="min-width:50px;text-align:right;font-weight:700;color:#ef4444;">${Math.round(failPct)}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="suite-grid">
      <div class="suite-box">
        <h3>UI Automation</h3>
        <p class="hint">Cucumber Feature → Steps → Pages</p>
        <div class="cards" style="margin:12px 0 0;">
          <div class="card ui"><div class="label">UI Runs</div><div class="value">${ui.runs}</div></div>
          <div class="card pass"><div class="label">Passed</div><div class="value">${ui.passed}</div></div>
          <div class="card fail"><div class="label">Failed</div><div class="value">${ui.failed}</div></div>
          <div class="card"><div class="label">Scenarios</div><div class="value">${ui.scenarios}</div></div>
        </div>
      </div>
      <div class="suite-box">
        <h3>API Automation</h3>
        <p class="hint">REST CRUD · Site HTTP · Broken Links · Network</p>
        <div class="cards" style="margin:12px 0 0;">
          <div class="card api"><div class="label">API Runs</div><div class="value">${api.runs}</div></div>
          <div class="card pass"><div class="label">Passed</div><div class="value">${api.passed}</div></div>
          <div class="card fail"><div class="label">Failed</div><div class="value">${api.failed}</div></div>
          <div class="card"><div class="label">Scenarios / Tests</div><div class="value">${api.scenarios}</div></div>
        </div>
      </div>
    </div>

    <h3 style="margin:0 0 16px;font-size:18px;">Detailed Statistics</h3>
    <div class="cards">
      <div class="card"><div class="label">Total Runs</div><div class="value">${overall.runs}</div></div>
      <div class="card pass"><div class="label">Passed Runs</div><div class="value">${overall.passed}</div></div>
      <div class="card fail"><div class="label">Failed Runs</div><div class="value">${overall.failed}</div></div>
      <div class="card ui"><div class="label">UI Scenarios</div><div class="value">${ui.scenarios}</div></div>
      <div class="card api"><div class="label">API Tests</div><div class="value">${api.scenarios}</div></div>
      <div class="card"><div class="label">Total Duration</div><div class="value" style="font-size:22px;">${formatDuration(overall.durationMs)}</div></div>
    </div>

    <div class="controls">
      <select id="suiteFilter">
        <option value="">All suites</option>
        <option value="UI">UI only</option>
        <option value="API">API only</option>
      </select>
      <select id="featureFilter"><option value="">All features</option>${featureOptions}</select>
      <select id="statusFilter">
        <option value="">All statuses</option>
        <option value="passed">Passed only</option>
        <option value="failed">Failed only</option>
      </select>
    </div>

    <h3 style="margin:0 0 16px;font-size:18px;">Test Run History</h3>
    <table>
      <thead>
        <tr>
          <th>Executed</th>
          <th>Suite / Feature</th>
          <th>Status</th>
          <th class="num">Scenarios</th>
          <th class="num">Steps/Tests</th>
          <th class="num">Duration</th>
          <th>Report</th>
        </tr>
      </thead>
      <tbody id="runs">
        ${rows || '<tr><td colspan="7" class="empty">No archived runs yet. Execute npm run report:all</td></tr>'}
      </tbody>
    </table>
  </div>

<script>
  const suiteFilter = document.getElementById('suiteFilter');
  const featureFilter = document.getElementById('featureFilter');
  const statusFilter = document.getElementById('statusFilter');
  function applyFilters() {
    document.querySelectorAll('#runs tr').forEach((row) => {
      if (!row.dataset.feature) return;
      const okSuite = !suiteFilter.value || row.dataset.suite === suiteFilter.value;
      const okFeature = !featureFilter.value || row.dataset.feature === featureFilter.value;
      const okStatus = !statusFilter.value || row.dataset.status === statusFilter.value;
      row.style.display = okSuite && okFeature && okStatus ? '' : 'none';
    });
  }
  suiteFilter.addEventListener('change', applyFilters);
  featureFilter.addEventListener('change', applyFilters);
  statusFilter.addEventListener('change', applyFilters);
</script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<script>
  const ctx = document.getElementById('executionChart').getContext('2d');
  const passedRuns = ${overall.passed};
  const failedRuns = ${overall.failed};
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Passed', 'Failed'],
      datasets: [{
        data: [passedRuns || 0.0001, failedRuns],
        backgroundColor: ['#10b981', '#ef4444'],
        borderWidth: 0,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => {
              const total = passedRuns + failedRuns;
              const value = context.parsed || 0;
              const pct = total ? ((value / total) * 100).toFixed(1) : 0;
              return context.label + ': ' + value + ' (' + pct + '%)';
            }
          }
        }
      },
      cutout: '60%'
    }
  });
</script>
</body>
</html>`;

  fs.writeFileSync(path.join(RESULTS_DIR, 'index.html'), html);

  const summaryJson = {
    generatedAt: new Date().toISOString(),
    overall,
    ui,
    api,
    runs: runs.length,
  };
  fs.writeFileSync(path.join(RESULTS_DIR, 'overall-summary.json'), JSON.stringify(summaryJson, null, 2));
  return runs.length;
}

function main() {
  ensureDirs();
  const args = process.argv.slice(2);

  const archiveCucumberFlag = args.includes('--archive-cucumber');
  const archivePlaywrightFlag = args.includes('--archive-playwright');
  const mergeCucumberFlag = args.includes('--merge-cucumber');
  const jsonArg = args.find((a) => !a.startsWith('--'));

  let didArchive = false;

  if (mergeCucumberFlag) {
    try {
      mergeCucumberReports();
    } catch (e) {
      console.warn(`Merge skipped: ${e.message}`);
      process.exitCode = 1;
    }
    // Still refresh dashboard after merge
    const total = buildDashboard();
    console.log(`Dashboard updated with ${total} run(s): ${path.join(RESULTS_DIR, 'index.html')}`);
    return;
  }

  // Archive only when explicitly requested (never re-archive combined cucumber-report.json)
  if (archiveCucumberFlag) {
    try {
      const source = jsonArg || CUCUMBER_UI_JSON;
      if (fs.existsSync(source)) {
        const result = archiveCucumber(source);
        didArchive = true;
        if (result.skipped) console.log(`Already archived cucumber: history/${result.runId}`);
        else {
          console.log(`Archived cucumber: history/${result.runId}`);
          console.log(
            `  ${result.summary.status.toUpperCase()} | scenarios ${result.summary.scenarios.passed}/${result.summary.scenarios.total}`,
          );
        }
      }
    } catch (e) {
      console.warn(`Cucumber archive skipped: ${e.message}`);
    }
  }

  if (archivePlaywrightFlag) {
    try {
      const source = jsonArg || PLAYWRIGHT_JSON;
      if (fs.existsSync(source)) {
        const result = archivePlaywright(source);
        didArchive = true;
        if (result.skipped) console.log(`Already archived playwright: history/${result.runId}`);
        else {
          console.log(`Archived playwright: history/${result.runId}`);
          console.log(
            `  ${result.summary.status.toUpperCase()} | tests ${result.summary.scenarios.passed}/${result.summary.scenarios.total}`,
          );
        }
      }
    } catch (e) {
      console.warn(`Playwright archive skipped: ${e.message}`);
    }
  }

  // Always refresh combined UI+API cucumber HTML when both suite files exist
  if (fs.existsSync(CUCUMBER_UI_JSON) && fs.existsSync(CUCUMBER_API_JSON)) {
    try {
      mergeCucumberReports();
    } catch (e) {
      console.warn(`Combine refresh skipped: ${e.message}`);
    }
  }

  const total = buildDashboard();
  const indexPath = path.join(RESULTS_DIR, 'index.html');
  console.log(`Dashboard updated with ${total} run(s): ${indexPath}`);
  console.log(`Open: file://${indexPath}`);
  if (!didArchive && total === 0) {
    console.log('Tip: run `npm run report:all` to execute UI+API and refresh this dashboard.');
  }
}

main();
