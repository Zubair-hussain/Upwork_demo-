# GitHub Actions Record

## Workflows

- `.github/workflows/ci.yml`: install, audit, typecheck, test, coverage artifact, build.
- `.github/workflows/lighthouse.yml`: build and Lighthouse CI report artifact.
- `.github/workflows/release.yml`: release tag verification for `v*.*.*` tags.

## Development Tracking

Suggested branch flow:

- `develop`: active development and integration testing.
- `main`: stable demo branch.
- `vX.Y.Z`: release tags after CI passes.

## Evidence Artifacts

GitHub Actions uploads:

- `coverage-report`
- `lighthouse-report`
- `release-evidence-vX.Y.Z`

## Local Commands

```bash
npm run typecheck
npm test
npm run coverage
npm run build
npm audit --audit-level=moderate
```
