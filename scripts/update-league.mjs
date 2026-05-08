import fs from "fs";
import path from "path";

const submissionsRoot = "submissions";
const siteDataRoot = "site/_data";
fs.mkdirSync(siteDataRoot, { recursive: true });

const results = [];

for (const folder of fs.readdirSync(submissionsRoot)) {
  const resultPath = path.join(submissionsRoot, folder, "grading-result.json");
  if (!fs.existsSync(resultPath)) continue;
  results.push(JSON.parse(fs.readFileSync(resultPath, "utf8")));
}

results.sort((a, b) =>
  `${a.round}-${a.participant}`.localeCompare(`${b.round}-${b.participant}`)
);

fs.writeFileSync(path.join(siteDataRoot, "results.json"), JSON.stringify(results, null, 2));

const byParticipant = new Map();
const roundWinners = new Map();

for (const result of results) {
  if (!result.passed) continue;
  const current = roundWinners.get(result.round);
  if (!current || result.scores.total > current.scores.total) {
    roundWinners.set(result.round, result);
  }
}

for (const result of results) {
  const key = `${result.participant}|${result.division || "Classic"}`;

  if (!byParticipant.has(key)) {
    byParticipant.set(key, {
      participant: result.participant,
      division: result.division || "Classic",
      roundsEntered: 0,
      passedRounds: 0,
      totalScore: 0,
      wins: 0,
      bestScore: 0,
      averageScore: 0,
      languages: new Set(),
      aiUsedCount: 0
    });
  }

  const row = byParticipant.get(key);
  row.roundsEntered += 1;
  row.totalScore += result.scores?.total || 0;
  row.bestScore = Math.max(row.bestScore, result.scores?.total || 0);

  if (result.passed) row.passedRounds += 1;
  if (result.language) row.languages.add(result.language);
  if (result.aiUsed) row.aiUsedCount += 1;

  const winner = roundWinners.get(result.round);
  if (winner && winner.participant === result.participant && winner.division === result.division) {
    row.wins += 1;
  }
}

const leaderboard = [...byParticipant.values()]
  .map((row) => ({
    ...row,
    averageScore: row.roundsEntered === 0 ? 0 : Math.round((row.totalScore / row.roundsEntered) * 10) / 10,
    languages: [...row.languages].sort()
  }))
  .sort((a, b) =>
    b.totalScore - a.totalScore ||
    b.wins - a.wins ||
    b.bestScore - a.bestScore ||
    a.participant.localeCompare(b.participant)
  );

fs.writeFileSync(path.join(siteDataRoot, "leaderboard.json"), JSON.stringify(leaderboard, null, 2));

const rounds = [...new Set(results.map((r) => r.round))].sort().map((round) => ({
  id: round,
  entries: results.filter((r) => r.round === round).length
}));

fs.writeFileSync(path.join(siteDataRoot, "rounds.json"), JSON.stringify(rounds, null, 2));

console.log(`Updated ${results.length} results`);
console.log(`Updated ${leaderboard.length} leaderboard rows`);
