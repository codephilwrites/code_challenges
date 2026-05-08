# Engineering Challenge League

GitHub-based coding challenge league with:

- Multi-language submissions
- Automated grading
- JSON grading results
- Jekyll leaderboard site
- GitHub Pages deployment workflow

## Local usage

From the repo root:

```powershell
npm run grade:all
npm run update:league
```

Or grade one submission:

```powershell
node .\rounds\round-002-pingpong\grader\grade.mjs .\submissions\emma-javascript
```

## Jekyll site

The leaderboard site lives in `site/`.

The aggregation script writes:

```text
site/_data/results.json
site/_data/leaderboard.json
site/_data/rounds.json
```

Jekyll reads those files through `site.data`.

## GitHub Pages

The workflow `.github/workflows/grade-and-publish.yml` grades submissions, updates the Jekyll data files, builds the site, and deploys to GitHub Pages.

In GitHub, enable Pages with GitHub Actions as the source.
