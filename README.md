# OrnaCore Admin Toolbox

Professional React administration interface for the OrnaCore B2B jewelry platform.

## Integration status

The toolbox is connected to the real backend for:

- Admin/staff email and password login
- Access-token authorization
- Automatic refresh-token rotation
- Current-user hydration
- Logout
- Protected routes
- Live dashboard metrics and reports
- Staff, roles, and permissions
- Automatic staff employee-code/password generation, invitation email delivery, and mandatory
  first-login password change
- Shopkeeper approval and status workflows
- Metals and an unlimited parent-child category hierarchy
- Product creation, variants, pricing, inventory, and media mapping
- Orders, staff assignment, payments, refunds, due balances, and delivery
- Audit logs and accounts-ledger-backed financial views

Demo data is disabled by default. Empty modules display honest empty states from the live database.

## Start

```bash
npm install
npm run dev
```

The admin runs at `http://localhost:5173` and expects the backend at
`http://localhost:4000/api/v1`.

Create a backend administrator before logging in:

```bash
cd ../ornacore-backend
npm run auth:create-admin
```

## Validation

```bash
npm run build
npm run lint
npm run format:check
```

Authenticated browser smoke test:

```bash
E2E_ADMIN_EMAIL=admin@example.com \
E2E_ADMIN_PASSWORD='your-password' \
node scripts/browser-smoke.mjs
```

## Architecture

```text
src/
├── app/                 Redux store
├── components/          Shared controls, layout, and tables
├── config/              Validated frontend environment
├── data/                Development preview data
├── features/            Module-owned screens, state, and one feature SCSS entry
├── routes/              Protected and permission-aware routes
├── services/            Axios client and backend API contracts
├── styles/              Application tokens and reset only
└── utils/               Formatting helpers
```

Styling is SCSS-owned by feature or reusable component. Dashboard subcomponents share
`features/dashboard/Dashboard.scss`; shared controls import their matching component SCSS. There is
no global feature/component CSS file.
# ornacore-admin
