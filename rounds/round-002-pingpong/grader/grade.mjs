import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { performance } from "perf_hooks";

const submissionPath = process.argv[2];
const round = "round-002-pingpong";

if (!submissionPath) {
  console.error("Usage: node grade.mjs <submission-folder>");
  process.exit(1);
}

const manifestPath = path.join(submissionPath, "manifest.json");

if (!fs.existsSync(manifestPath)) {
  console.error(`Missing manifest.json in ${submissionPath}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const command =
  process.platform === "win32"
    ? manifest.windowsCommand || manifest.command
    : manifest.command;

if (!command) {
  console.error("No command found in manifest.json");
  process.exit(1);
}

const normalise = (text) =>
  text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

function compareOutput(actual, expected) {
  const actualLines = normalise(actual).split("\n");
  const expectedLines = normalise(expected).split("\n");

  if (actualLines.length !== expectedLines.length) {
    return {
      passed: false,
      reason: "Line count mismatch",
      expectedLineCount: expectedLines.length,
      actualLineCount: actualLines.length
    };
  }

  for (let i = 0; i < expectedLines.length; i++) {
    if (actualLines[i] !== expectedLines[i]) {
      return {
        passed: false,
        reason: `Mismatch on line ${i + 1}`,
        line: i + 1,
        expected: expectedLines[i],
        actual: actualLines[i]
      };
    }
  }

  return { passed: true, reason: "Output matched expected result" };
}

function countCharacters(files) {
  if (!Array.isArray(files)) return 0;
  let total = 0;

  for (const file of files) {
    const filePath = path.join(submissionPath, file);
    if (fs.existsSync(filePath)) {
      total += fs.readFileSync(filePath, "utf8").length;
    }
  }

  return total;
}

function assessAiSignals(manifest, characterCount) {
  const reasons = [];

  if (manifest.aiUsed === true) reasons.push("Participant declared AI use");
  if (characterCount > 500) reasons.push("Solution is unusually verbose for a code golf round");
  if (!Array.isArray(manifest.scoredFiles) || manifest.scoredFiles.length === 0) {
    reasons.push("No scored files declared");
  }

  let level = "low";
  if (reasons.length >= 3) level = "high";
  else if (reasons.length >= 1) level = "medium";

  return {
    level,
    confidence: "low",
    reasons,
    recommendedAction:
      level === "high" ? "Required walkthrough" :
      level === "medium" ? "Optional walkthrough" :
      "None"
  };
}

function getDivision(manifest) {
  return manifest.aiUsed === true ? "Open" : "Classic";
}

const expected = fs.readFileSync(
  path.resolve("rounds/round-002-pingpong/public-tests/expected.txt"),
  "utf8"
);

const started = performance.now();
let output = "";
let executionError = null;

try {
  output = execSync(command, {
    cwd: submissionPath,
    encoding: "utf8",
    timeout: 5000,
    stdio: ["ignore", "pipe", "pipe"]
  });
} catch (err) {
  executionError = {
    message: err.message,
    stdout: err.stdout?.toString() || "",
    stderr: err.stderr?.toString() || ""
  };
}

const runtimeMs = Math.round(performance.now() - started);
const comparison = executionError
  ? { passed: false, reason: "Execution failed", executionError }
  : compareOutput(output, expected);

const characterCount = countCharacters(manifest.scoredFiles);
const correctness = comparison.passed ? 70 : 0;
const golfScore = comparison.passed
  ? characterCount <= 80 ? 25
  : characterCount <= 120 ? 20
  : characterCount <= 200 ? 15
  : characterCount <= 400 ? 10
  : 5
  : 0;

let submissionHygiene = 0;
if (fs.existsSync(manifestPath)) submissionHygiene += 1;
if (!executionError) submissionHygiene += 1;
if (Array.isArray(manifest.scoredFiles) && manifest.scoredFiles.length > 0) submissionHygiene += 1;
if (characterCount > 0) submissionHygiene += 1;
if (comparison.passed) submissionHygiene += 1;

const scores = {
  correctness,
  golfScore,
  submissionHygiene,
  total: correctness + golfScore + submissionHygiene
};

const result = {
  participant: manifest.name,
  language: manifest.language,
  division: getDivision(manifest),
  round,
  passed: comparison.passed,
  comparison,
  metrics: { runtimeMs, characterCount },
  aiUsed: manifest.aiUsed === true,
  aiTools: manifest.aiTools || [],
  aiUseType: manifest.aiUseType || "none",
  aiSignals: assessAiSignals(manifest, characterCount),
  scores,
  gradedAt: new Date().toISOString()
};

fs.writeFileSync(path.join(submissionPath, "grading-result.json"), JSON.stringify(result, null, 2));

const summary = `# Grading Summary

Participant: ${result.participant}  
Language: ${result.language}  
Division: ${result.division}  
Round: ${result.round}  
Passed: ${result.passed ? "Yes" : "No"}  

## Scores

| Area | Score |
|---|---:|
| Correctness | ${scores.correctness} |
| Golf Score | ${scores.golfScore} |
| Submission Hygiene | ${scores.submissionHygiene} |
| Total | ${scores.total} |

## Metrics

| Metric | Value |
|---|---:|
| Runtime | ${runtimeMs}ms |
| Character Count | ${characterCount} |

## Comparison

${comparison.reason}

## AI

AI Used: ${result.aiUsed ? "Yes" : "No"}  
AI Use Type: ${result.aiUseType}  

## AI Signals

Level: ${result.aiSignals.level}  
Confidence: ${result.aiSignals.confidence}  
Recommended Action: ${result.aiSignals.recommendedAction}  

${result.aiSignals.reasons.map((r) => `- ${r}`).join("\n") || "- None"}
`;

fs.writeFileSync(path.join(submissionPath, "grading-summary.md"), summary);
console.log(summary);

if (!comparison.passed) process.exit(1);
