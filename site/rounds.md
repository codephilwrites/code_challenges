---
layout: default
title: Round Results
---

# Round Results

| Round | Participant | Division | Language | Passed | Score | Correctness | Golf | Hygiene | Chars | Runtime | AI |
|---|---|---|---|---|---:|---:|---:|---:|---:|---:|---|
{% for result in site.data.results %}
| {{ result.round }} | {{ result.participant }} | {{ result.division }} | {{ result.language }} | {{ result.passed }} | {{ result.scores.total }} | {{ result.scores.correctness }} | {{ result.scores.golfScore }} | {{ result.scores.submissionHygiene }} | {{ result.metrics.characterCount }} | {{ result.metrics.runtimeMs }}ms | {{ result.aiUsed }} |
{% endfor %}
