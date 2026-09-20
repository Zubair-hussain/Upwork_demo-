# Testcases

## Candidate Profile

1. Open `/`.
2. Enter name and short description.
3. Press **Save profile**.
4. Confirm success toast appears.
5. Open `/admIn`, log in, and confirm admin shows the saved profile.

## Application Flow

1. Open a job detail page.
2. Try applying without a bid amount.
3. Confirm validation says to add a bid amount.
4. Add bid amount, boost Connects, cover letter, and screening answer.
5. Submit and confirm the application appears in admin.

## Integration Tests

Automated integration tests live in `__tests__/integration.test.tsx`.

- Saves candidate name and short description, then verifies admin visibility.
- Blocks proposal submission when bid amount is missing.
- Stores a complete proposal record with bid and boosted Connects.

## Client Verification

1. Open multiple jobs.
2. Confirm some clients show payment/phone verified.
3. Confirm some clients show missing verification state.

## Connects

1. Confirm total Connects are visible.
2. Confirm base plus boosted Connects are used for proposal cost.
3. Confirm below-40 Connects message appears when threshold is reached.
