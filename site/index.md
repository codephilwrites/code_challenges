---
layout: default
title: Leaderboard
---

# Leaderboard

| Rank | Participant | Division | Rounds | Passed | Wins | Total | Average | Best | Languages | AI Entries |
|---:|---|---|---:|---:|---:|---:|---:|---:|---|---:|
{% for row in site.data.leaderboard %}
| {{ forloop.index }} | {{ row.participant }} | {{ row.division }} | {{ row.roundsEntered }} | {{ row.passedRounds }} | {{ row.wins }} | {{ row.totalScore }} | {{ row.averageScore }} | {{ row.bestScore }} | {{ row.languages | join: ', ' }} | {{ row.aiUsedCount }} |
{% endfor %}
