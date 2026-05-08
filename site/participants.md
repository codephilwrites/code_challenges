---
layout: default
title: Participants
---

# Participants

{% assign grouped = site.data.results | group_by: "participant" %}

{% for group in grouped %}
## {{ group.name }}

| Round | Division | Language | Passed | Score | Chars | Runtime |
|---|---|---|---|---:|---:|---:|
{% for result in group.items %}
| {{ result.round }} | {{ result.division }} | {{ result.language }} | {{ result.passed }} | {{ result.scores.total }} | {{ result.metrics.characterCount }} | {{ result.metrics.runtimeMs }}ms |
{% endfor %}

{% endfor %}
