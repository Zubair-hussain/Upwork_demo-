# Coverage Report

Vitest coverage is configured with V8 coverage.

Run:

```bash
npm run coverage
```

Expected outputs:

- Terminal coverage table.
- HTML report in `coverage/`.

Current test focus:

- Job seed data integrity.
- Seven jobs and seven bids.
- Connect spending math, including boosted Connects.
- Fit score labels and scoring thresholds.

Recommended next tests:

- Component tests for candidate profile save.
- Component tests for required bid validation.
- Component tests for admin reading saved profile.

Added integration tests:

- Candidate profile save -> admin visibility.
- Required proposal bid validation.
- Complete proposal record persistence.
