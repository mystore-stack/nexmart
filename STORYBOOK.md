Storybook
=========

Local
-----

Install dev dependencies:

```bash
npm install
# or to install dev deps only
npm install --save-dev @storybook/react-webpack5 @storybook/addon-essentials @storybook/addon-a11y @storybook/builder-webpack5 @storybook/manager-webpack5 pa11y-ci http-server
```

Run Storybook:

```bash
npm run storybook
```

Build static Storybook:

```bash
npm run build-storybook
```

CI
--

The repository includes a GitHub Actions workflow at `.github/workflows/build-storybook.yml` which will build Storybook and run basic accessibility checks using `pa11y-ci` against the static build. The accessibility step is non-blocking (will not fail the job) but will upload the `storybook-static` artifact for review.

Next steps
----------
- Add `@storybook/test-runner` or Playwright-based accessibility checks for blocking failures.
- Integrate visual regression testing (Chromatic or Percy) for visual QA.
- Expand stories for admin components and edge cases.

Playwright & Storybook Test Runner
----------------------------------

Running the Storybook Playwright tests locally:

1. Build Storybook and serve the static build on port 9001:

```bash
npm run build-storybook
npx http-server storybook-static -p 9001 &
```

2. Run the Storybook test runner (Playwright-based) which executes interaction and accessibility checks:

```bash
npm run test:storybook:runner
```

3. Or run the Playwright test suite directly (uses `playwright.config.ts`):

```bash
npm run test:playwright
```

Notes:
- The CI workflow runs the test runner before `pa11y-ci` to catch interaction regressions early.
- For visual regression, consider adding Chromatic or Percy; CI tokens are required for publishing snapshots.
