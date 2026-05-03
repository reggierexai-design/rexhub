#!/usr/bin/env python3
"""Update rexhub website from v0.6 to v1.0 skill library stats."""
import re

FILE = r"E:\rexhub-repos\rexhub\index.html"

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update hero subtitle
content = content.replace(
    "185 deep operator playbooks. 22 profiles. 15 categories. Profile-first deployment, safety-forward defaults, and handoff-aware routing. Free, MIT-licensed, community-maintained by RexBot / Rex Hub.",
    "215 domain-deep operating playbooks. 24 profiles. 20 categories. Zero boilerplate — every skill is genuine domain expertise, including solo founder, legal, finance, vibe coding, and community skills. Free, MIT-licensed, community-maintained by RexBot / Rex Hub."
)

# 2. Update all v0.6 references to v1.0
content = content.replace("Skill Library <em>v0.6</em>", "Skill Library <em>v1.0</em>")
content = content.replace("Generalist Skill Library", "Ultimate Skill Library")

# 3. Update skill counts: 185 → 215
content = content.replace(">185 skills<", ">215 skills<")
content = content.replace(">185<", ">215<")

# 4. Update profile counts: 22 → 24
content = content.replace(">22 profiles<", ">24 profiles<")
content = content.replace(">22<", ">24<")

# 5. Update avg words: 619 → 684
content = content.replace(">619<", ">684<")

# 6. Update OpenClaw description
content = content.replace(
    "The native release. 185 skills, 22 profiles, full OpenClaw tool patterns, slash commands, and profile-based deployment.",
    "The flagship release. 215 skills, 24 profiles, domain-deep operating playbooks with full OpenClaw tool patterns, slash commands, and profile-based deployment."
)

# 7. Update Antigravity description
content = content.replace(
    "Ported for Google's agent framework. Same depth, adapted tool patterns and integration points for Antigravity workflows.",
    "Ported for Google's agent framework. 215 skills with adapted tool patterns and integration points for Antigravity workflows."
)

# 8. Update Claude Code description
content = content.replace(
    "Ported for Anthropic's CLI agent. Adapted skill anatomy, slash commands, and tool patterns for Claude Code workflows.",
    "Ported for Anthropic's CLI agent. 215 skills with adapted anatomy, slash commands, and tool patterns for Claude Code workflows."
)

# 9. Update Codex description
content = content.replace(
    "Ported for OpenAI's Codex agent. Adapted skill anatomy, integration points, and tool patterns for Codex workflows.",
    "Ported for OpenAI's Codex agent. 215 skills with adapted anatomy, integration points, and tool patterns for Codex workflows."
)

# 10. Update "What's inside" description
content = content.replace(
    "Not a prompt pack &mdash; an operator playbook.",
    "Not a prompt pack &mdash; a domain-deep operating playbook with zero filler."
)

# 11. Add "20 categories" badge after each "platform-native" badge
# For OpenClaw
content = content.replace(
    ">OpenClaw-native</span>\n </div>",
    ">OpenClaw-native</span>\n <span style=\"font-family:var(--font-mono);font-size:.72rem;color:var(--fg-dim);background:var(--gold-soft);padding:.25rem .6rem;border-radius:4px;border:1px solid var(--gold-mid)\">20 categories</span>\n </div>",
    1  # only first occurrence
)

# For Antigravity
content = content.replace(
    ">Antigravity-native</span>\n </div>",
    ">Antigravity-native</span>\n <span style=\"font-family:var(--font-mono);font-size:.72rem;color:var(--fg-dim);background:rgba(66,133,244,.06);padding:.25rem .6rem;border-radius:4px;border:1px solid rgba(66,133,244,.15)\">20 categories</span>\n </div>",
    1
)

# For Claude Code
content = content.replace(
    ">Claude Code-native</span>\n </div>",
    ">Claude Code-native</span>\n <span style=\"font-family:var(--font-mono);font-size:.72rem;color:var(--fg-dim);background:rgba(217,119,87,.06);padding:.25rem .6rem;border-radius:4px;border:1px solid rgba(217,119,87,.15)\">20 categories</span>\n </div>",
    1
)

# For Codex
content = content.replace(
    ">Codex-native</span>\n </div>",
    ">Codex-native</span>\n <span style=\"font-family:var(--font-mono);font-size:.72rem;color:var(--fg-dim);background:rgba(16,163,127,.06);padding:.25rem .6rem;border-radius:4px;border:1px solid rgba(16,163,127,.15)\">20 categories</span>\n </div>",
    1
)

# 12. Also update the structured data
content = content.replace(
    '"description":"125 AI agents on your machine. No cloud. No middleman. Just your keys and your code."',
    '"description":"215 domain-deep skill playbooks across 4 platforms. 125 AI agents on your machine. No cloud. No middleman. Just your keys and your code."'
)

with open(FILE, "w", encoding="utf-8") as f:
    f.write(content)

# Verify
v06_count = content.count("v0.6")
v10_count = content.count("v1.0")
count_185 = content.count(">185")
count_215 = content.count(">215")
print(f"v0.6 references remaining: {v06_count}")
print(f"v1.0 references: {v10_count}")
print(f"185 references: {count_185}")
print(f"215 references: {count_215}")
print("Website updated!")
