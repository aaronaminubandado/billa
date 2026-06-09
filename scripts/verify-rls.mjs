#!/usr/bin/env node
/**
 * Runs supabase/scripts/audit_rls.sql checks against DATABASE_URL.
 * Usage: DATABASE_URL=postgresql://... node scripts/verify-rls.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXPECTED_TABLES = [
  "profiles",
  "categories",
  "wallets",
  "transactions",
  "budgets",
  "goals",
  "notifications",
  "notification_settings",
];

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required (direct Postgres connection string).");
  process.exit(1);
}

const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

function pass(value) {
  return value ? "PASS" : "FAIL";
}

async function main() {
  await client.connect();

  const existence = await client.query(
    `
    SELECT expected.table_name,
      EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname = expected.table_name
      ) AS exists
    FROM unnest($1::text[]) AS expected(table_name)
    ORDER BY expected.table_name
    `,
    [EXPECTED_TABLES]
  );

  const rls = await client.query(
    `
    SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled, c.relforcerowsecurity AS rls_forced
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname = ANY($1::text[])
    ORDER BY c.relname
    `,
    [EXPECTED_TABLES]
  );

  const policyCounts = await client.query(
    `
    SELECT tablename, COUNT(*)::int AS policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = ANY($1::text[])
    GROUP BY tablename
    ORDER BY tablename
    `,
    [EXPECTED_TABLES]
  );

  const total = await client.query(
    `
    SELECT COUNT(*)::int AS total_policies
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = ANY($1::text[])
    `,
    [EXPECTED_TABLES]
  );

  const tablesExist = existence.rows.every((r) => r.exists);
  const rlsEnabled =
    rls.rows.length === EXPECTED_TABLES.length &&
    rls.rows.every((r) => r.rls_enabled === true);
  const policyMap = Object.fromEntries(
    policyCounts.rows.map((r) => [r.tablename, r.policy_count])
  );
  const policiesPerTable = EXPECTED_TABLES.every((t) => policyMap[t] === 4);
  const totalPolicies = total.rows[0]?.total_policies === 32;

  const allPass = tablesExist && rlsEnabled && policiesPerTable && totalPolicies;

  const auditPath = path.join(__dirname, "../supabase/audits/2026-06-02_rls_audit.md");
  let audit = fs.readFileSync(auditPath, "utf8");

  const today = new Date().toISOString().slice(0, 10);
  const statusLine = allPass ? "**PASS**" : "**GAP**";

  audit = audit.replace(
    /\| Status \| \*\*[^*]+\*\*[^|]*\|/,
    `| Status | ${statusLine} — verified via \`pnpm verify:rls\` on ${today} |`
  );

  const fillTable = (sectionHeader, rows, formatter) => {
    const start = audit.indexOf(sectionHeader);
    if (start === -1) return;
    const tableStart = audit.indexOf("| --- |", start);
    const tableEnd = audit.indexOf("\n\n", tableStart);
    const header = audit.slice(start, tableStart);
    audit = audit.slice(0, start) + header + formatter(rows) + audit.slice(tableEnd);
  };

  fillTable("### Query 0 — Table existence", existence.rows, (rows) =>
    rows
      .map(
        (r) =>
          `| ${r.table_name} | ${r.exists} | ${pass(r.exists)} |`
      )
      .join("\n") + "\n"
  );

  fillTable("### Query 1 — RLS enabled", rls.rows, (rows) =>
    rows
      .map(
        (r) =>
          `| ${r.table_name} | ${r.rls_enabled} | ${r.rls_forced} | ${pass(r.rls_enabled)} |`
      )
      .join("\n") + "\n"
  );

  fillTable("### Query 3 — Policy count per table", policyCounts.rows, (rows) => {
    const byName = Object.fromEntries(rows.map((r) => [r.tablename, r.policy_count]));
    return EXPECTED_TABLES.map(
      (t) => `| ${t} | ${byName[t] ?? 0} | ${pass(byName[t] === 4)} |`
    ).join("\n") + "\n";
  });

  audit = audit.replace(
    /```\ntotal_policies: ___\n```/,
    `\`\`\`\ntotal_policies: ${total.rows[0]?.total_policies ?? 0}\n\`\`\``
  );

  audit = audit.replace(
    /- \[ \] \*\*PASS\*\* — remote matches migration spec\n- \[ \] \*\*GAP\*\* — record mismatch and reconcile/,
    allPass
      ? "- [x] **PASS** — remote matches migration spec\n- [ ] **GAP** — record mismatch and reconcile"
      : "- [ ] **PASS** — remote matches migration spec\n- [x] **GAP** — record mismatch and reconcile"
  );

  audit = audit.replace(/Updated status: _\(PASS \/ FAIL\)_/, `Updated status: ${allPass ? "PASS" : "FAIL"}`);
  audit = audit.replace(/Updated date: _\(YYYY-MM-DD\)_/, `Updated date: ${today}`);

  fs.writeFileSync(auditPath, audit);

  console.log(JSON.stringify({ allPass, totalPolicies: total.rows[0]?.total_policies, policyMap }, null, 2));
  process.exit(allPass ? 0 : 1);
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  })
  .finally(() => client.end());
