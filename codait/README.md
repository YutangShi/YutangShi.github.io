# Codait Setup

This folder contains AI operation assets for this repository.

## Purpose
- Standardize how AI agents produce blog content and code changes.
- Make outputs consistent, testable, and reviewable.

## Files
- `codait/config.toml`: project-level AI behavior and guardrails
- `codait/agents.yaml`: role definitions for specialized agents
- `codait/prompts/`: reusable prompt templates
- `codait/workflows/`: repeatable execution workflows

## Quick Start
1. Read `codait/config.toml`.
2. Pick a role from `codait/agents.yaml`.
3. Use a prompt template from `codait/prompts/`.
4. Follow a workflow in `codait/workflows/`.
5. If behavior changes, update `openspec/specs/`.
