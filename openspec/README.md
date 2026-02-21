# OpenSpec

This folder stores change specifications for product and engineering decisions.

## Why
- Keep AI-assisted changes auditable.
- Clarify expected behavior before implementation.
- Preserve decision context for future maintenance.

## Structure
- `openspec/project.yaml`: project-level spec metadata
- `openspec/templates/spec-template.md`: template for new specs
- `openspec/specs/*.md`: versioned individual specs

## When to Create a Spec
- New user-facing feature
- Significant UI behavior change
- Deployment/runtime behavior change
- Content pipeline or governance rule changes
