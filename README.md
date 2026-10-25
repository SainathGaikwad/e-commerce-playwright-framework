# Multi-Site Playwright Framework (TypeScript)

![Playwright Tests](https://github.com/SainathGaikwad/e-commerce-playwright-framework/actions/workflows/main.yml/badge.svg)

One Playwright + TypeScript framework exercising three public practice applications, each chosen for a different class of UI problem:

| Site | What it exercises | Specs |
|---|---|---|
| [Swag Labs](https://www.saucedemo.com) (e-commerce) | Login states, catalogue, cart, three-step checkout | `tests/sauce-demo/`, `tests/authentication/`, `tests/cart/`, `tests/checkout/` |
| [The Internet](https://the-internet.herokuapp.com) | File upload/download, drag-and-drop, hover, JS alerts/confirms/prompts, dynamic content | `tests/file-operations/`, `tests/advanced/` |
| [DemoQA](https://demoqa.com) | Form controls, buttons (double/right-click), editable web tables, modals | `tests/forms/`, `tests/elements/`, `tests/cross-site/` |

Shared page-object layer with reusable components (header, footer, modal, table, product card), per-site base pages, a login/auth fixture, and a CI matrix that runs on every push.

> **Author:** Sainath Gaikwad — QA Engineer (Playwright/TypeScript, API & performance testing, U.S. healthcare EHR/EMR).
> See also: [swaglabs-playwright](https://github.com/SainathGaikwad/swaglabs-playwright) — a focused single-app suite with a written test plan, test-case matrix and defect report.

## Status

31 tests across 12 spec files run on Chromium in CI. Firefox, WebKit, mobile Chrome/Safari and Edge projects are configured and can be run locally with `npm run test:all-browsers`.

Recent work on this repo (Oct 2026): removed every `waitForTimeout` from the test layer and the SauceDemo page objects, replaced a `waitForNavigation()` race in `login()` that was double-submitting the form, and fixed an `all()[i]` snapshot bug that made product clicks intermittently fail. CI time for the same suite went from **6m 26s to 1m 06s**, with no retries.

Known work remaining, in priority order:
- `pages/demoqa/` and `pages/the-internet/` still contain 20 timed waits; they are being replaced file by file as each suite gets a verified run.
- `tests/advanced/interactions.spec.ts` skips itself when drag-and-drop doesn't fire, so it cannot fail; it needs a real assertion.
- `utils/test-data-generator.ts` (Faker) is partly commented out and unused by current specs.
- Duplicate page objects for SauceDemo exist at `pages/` and `pages/sauce-demo/`; the root copies are kept for `global-setup.ts` and will be consolidated.

## Quick start

```bash
git clone https://github.com/SainathGaikwad/e-commerce-playwright-framework.git
cd e-commerce-playwright-framework
npm install
npx playwright install chromium       # or --with-deps for all browsers

npm run test:sauce                    # SauceDemo suites on Chromium (~40 s)
npm run test:chromium                 # everything on Chromium
npm run test:smoke                    # @smoke-tagged tests only
npm run report                        # open the HTML report
```

Useful variations:

```bash
npx playwright test tests/file-operations --project=chromium --headed
npx playwright test --project=firefox --project=webkit
npm run typecheck
```

## Structure

```
.
├── .github/workflows/main.yml   CI: Node 22, type-check, Chromium matrix, report artifact
├── playwright.config.ts         6 projects, retries on CI only, HTML + list reporters
├── config/                      environment.config.ts (base URLs per site)
├── data/test-users.json         SauceDemo demo accounts
├── fixtures/authentication.fixture.ts
├── global-setup.ts / global-teardown.ts
├── pages/
│   ├── base-page.ts             navigate(), waitForPageLoad(), common helpers
│   ├── components/              header, footer, modal, table, product-card, form-elements
│   ├── sauce-demo/              login, product details, checkout complete, site base page
│   ├── the-internet/            alerts, drag-drop, file upload, file download
│   └── demoqa/                  buttons, forms, web tables
├── tests/                       grouped by capability (see table above)
└── utils/                       api-helpers, visual-comparison (pixelmatch), reporting helpers
```

## Design notes

**Waiting.** Every wait is on a condition — a URL, an element's visibility, a value, a count — never on a timer. Where a wait used to hide a real race (snapshotting a list with `all()` before it rendered), the fix was to use `nth()`/`count()`, which auto-wait.

**Login.** `login()` fills and clicks, nothing else; the caller asserts the outcome (`toHaveURL(/inventory/)` or an error message). That keeps one method valid for positive and negative tests and avoids the double-submit bug that `waitForNavigation()` caused.

**Isolation.** Every test runs in a fresh context; the auth fixture can reuse `storageState` for suites that don't need to test login itself.

**Screenshots.** Written to `test-results/screenshots/` and ignored by git; only Playwright's own failure artifacts are kept, and only in CI.

## License

MIT
