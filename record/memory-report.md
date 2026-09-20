# Memory Report

The demo uses browser `localStorage` for lightweight assessment state.

## Keys

- `uet-candidate-profile`: candidate name, short description, and saved timestamp.
- `uet-applications`: proposal records for each job.
- `uet-client-views`: client-viewed job ids.

## Admin Visibility

The admin page reads the saved candidate profile first. If no profile exists, it falls back to the first application name.

## Persistence Scope

Data persists per browser and domain until reset from the admin screen or cleared by the browser.
