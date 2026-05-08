import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const submissionsRoot = "submissions";
const grader = "rounds/round-002-pingpong/grader/grade.mjs";
let failures = 0;

for (const folder of fs.readdirSync(submissionsRoot)) {
  const submissionPath = path.join(submissionsRoot, folder);
  const manifestPath = path.join(submissionPath, "manifest.json");

  if (!fs.statSync(submissionPath).isDirectory()) continue;
  if (!fs.existsSync(manifestPath)) continue;

  console.log(`\n=== Grading ${submissionPath} ===`);

  const result = spawnSync("node", [grader, submissionPath], {
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  if (result.status !== 0) failures += 1;
}

if (failures > 0) {
  console.warn(`Finished with ${failures} failing submission(s).`);
}
