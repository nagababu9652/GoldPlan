'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getApplicationConfiguration, listApplicationConfigurationHistory,
  saveApplicationConfiguration, type ApplicationConfigurationSection,
  type ApplicationConfigurationVersion,
} from '@/lib/api';
import { useSingleSubmission } from '@/lib/use-single-submission';

type Field = {
  key: string;
  label: string;
  kind?: 'text' | 'number' | 'date' | 'textarea' | 'boolean' | 'select' | 'codes' | 'emails';
  options?: string[];
  required?: boolean;
  note?: string;
};

const sections: { code: ApplicationConfigurationSection; title: string; description: string }[] = [
  { code: 'COMMON', title: 'Common & Empanelment', description: 'Organization contact and report identity for empanelment material.' },
  { code: 'PRE_SALES', title: 'Pre-Sales & Risk', description: 'Planning assumptions and the four client risk-profile parameters.' },
  { code: 'DOMAIN_RELATED', title: 'Domain Related', description: 'Mutual-fund, tax/report, auto-import, provider, insurance, and investment settings from the reference. Saving a policy does not activate an importer or change existing calculations.' },
];

const fields: Record<ApplicationConfigurationSection, Field[]> = {
  COMMON: [
    { key: 'empanelment_contact_name', label: 'Empanelment contact name', required: true },
    { key: 'empanelment_email', label: 'Empanelment email', required: true },
    { key: 'empanelment_phone', label: 'Empanelment phone', required: true },
    { key: 'empanelment_address', label: 'Empanelment address', kind: 'textarea', required: true },
    { key: 'report_title', label: 'Report title', required: true },
    { key: 'report_subtitle', label: 'Report subtitle' },
    { key: 'report_address_line1', label: 'Report address line 1' },
    { key: 'report_address_line2', label: 'Report address line 2' },
    { key: 'report_mobile', label: 'Report mobile' },
    { key: 'report_landline', label: 'Report landline' },
    { key: 'report_email', label: 'Report email' },
    { key: 'report_website', label: 'Report website', note: 'Include https://.' },
    { key: 'letterhead_style', label: 'Letterhead style', kind: 'select', options: ['FULL', 'CENTER', 'RIGHT', 'NONE'] },
    { key: 'email_sender_name', label: 'Email sender name' },
    { key: 'email_sender_address', label: 'Email sender address' },
    { key: 'email_footer', label: 'Email footer', kind: 'textarea' },
    { key: 'default_country', label: 'Default country', required: true },
    { key: 'default_state', label: 'Default state' },
    { key: 'default_city', label: 'Default city' },
    { key: 'birthday_lookahead_days', label: 'Birthday reminder days', kind: 'number' },
    { key: 'anniversary_lookahead_days', label: 'Anniversary reminder days', kind: 'number' },
  ],
  PRE_SALES: [
    { key: 'default_inflation_rate_pct', label: 'Default inflation rate %', kind: 'number', required: true },
    { key: 'section_80c_limit', label: 'Section 80C assumption', kind: 'number', required: true },
    { key: 'income_tax_assumption_pct', label: 'Income tax assumption %', kind: 'number', required: true },
    { key: 'investment_frequency', label: 'Investment frequency', kind: 'select', options: ['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY'] },
    { key: 'recommended_equity_fund', label: 'Recommended equity fund' },
    { key: 'recommended_debt_fund', label: 'Recommended debt fund' },
    { key: 'default_insurer', label: 'Default insurer' },
    { key: 'term_insurance_product', label: 'Term insurance product' },
    { key: 'allow_advisor_override', label: 'Allow advisor override', kind: 'boolean' },
  ],
  DOMAIN_RELATED: [
    { key: 'cost_basis_method', label: 'Cost basis method', kind: 'select', options: ['WEIGHTED_AVERAGE', 'FIFO'], note: 'The current transaction engine still uses weighted average. FIFO requires a separate lot-accounting implementation before this choice can affect calculations.' },
    { key: 'fund_visibility', label: 'Funds shown', kind: 'select', options: ['ALL', 'DIRECT', 'REGULAR'] },
    { key: 'default_ranking_basis', label: 'Default ranking basis', kind: 'select', options: ['INCEPTION', 'ONE_YEAR', 'THREE_YEAR', 'FIVE_YEAR'] },
    { key: 'crm_report_tolerance', label: 'CRM report tolerance', kind: 'number' },
    { key: 'mask_pan_internal', label: 'Mask PAN internally', kind: 'boolean' },
    { key: 'mask_folio_internal', label: 'Mask folios internally', kind: 'boolean' },
    { key: 'mask_folio_client_portal', label: 'Mask folios in client portal', kind: 'boolean' },
    { key: 'show_indices', label: 'Show indices', kind: 'boolean' },
    { key: 'show_sub_one_year_returns', label: 'Show returns under one year', kind: 'boolean' },
    { key: 'show_negative_xirr_cagr', label: 'Show negative XIRR / CAGR', kind: 'boolean' },
    { key: 'xirr_min_holding_days', label: 'Minimum XIRR holding days', kind: 'number' },
    { key: 'sip_summary_source', label: 'SIP summary source', kind: 'select', options: ['SIP_MASTER', 'LAST_MONTH_TRANSACTIONS'] },
    { key: 'show_stp_in_recent_widgets', label: 'Show STP in recent purchase/redemption widgets', kind: 'boolean' },
    { key: 'show_gst_breakup_in_brokerage_analysis', label: 'Show GST breakup in AMC brokerage analysis', kind: 'boolean' },
    { key: 'calculate_lt_capital_gain_exemption', label: 'Calculate exemption gain in LT capital-gain report', kind: 'boolean' },
    { key: 'include_switches_in_absolute_return', label: 'Count switch-out and switch-in for absolute returns', kind: 'boolean' },
    { key: 'show_surrender_value_in_mobile_app', label: 'Show surrender value in mobile app', kind: 'boolean' },
    { key: 'active_sip_report_from_last_month', label: 'Active SIP report from last-month transactions', kind: 'boolean' },
    { key: 'include_fully_redeemed_units_in_gain_loss', label: 'Include fully redeemed units in gain/loss report', kind: 'boolean' },
    { key: 'export_capital_gains_in_finsys_format', label: 'Finsys tax-format capital-gains export', kind: 'boolean' },
    { key: 'monthly_ecas_request_limit', label: 'Monthly eCAS/CAS request limit', kind: 'number' },
    { key: 'auto_import_enabled', label: 'Auto-import enabled', kind: 'boolean', note: 'This only stores the intended policy; mailbox/worker automation is not active yet.' },
    { key: 'forwarding_email_addresses', label: 'Trusted forwarding email addresses', kind: 'emails', note: 'Comma-separated addresses. Used only after mailbox integration is built.' },
    { key: 'cams_arn_number', label: 'CAMS ARN number' },
    { key: 'cams_subscription_expires_on', label: 'CAMS subscription expiry', kind: 'date' },
    { key: 'cams_registered_email', label: 'CAMS registered email' },
    { key: 'cams_provider_user_id', label: 'CAMS provider user ID' },
    { key: 'cams_is_corporate', label: 'CAMS corporate account', kind: 'boolean' },
    { key: 'kfin_arn_number', label: 'KFintech ARN number' },
    { key: 'kfin_subscription_expires_on', label: 'KFintech subscription expiry', kind: 'date' },
    { key: 'kfin_registered_email', label: 'KFintech registered email' },
    { key: 'kfin_provider_user_id', label: 'KFintech provider user ID' },
    { key: 'kfin_is_corporate', label: 'KFintech corporate account', kind: 'boolean' },
    { key: 'cams_360_user_id', label: 'CAMS 360 user ID' },
    { key: 'auto_create_customers_from_rta', label: 'Auto-create customers from RTA', kind: 'boolean', note: 'Stored for the future RTA importer; off by default.' },
    { key: 'self_reconcile_aum', label: 'Self-reconcile AUM', kind: 'boolean', note: 'Stored for future RTA reconciliation.' },
    { key: 'update_folio_bank_details_from_rta', label: 'Update folio bank details from RTA', kind: 'boolean' },
    { key: 'update_nominee_details_from_rta', label: 'Update nominee details from RTA', kind: 'boolean' },
    { key: 'auto_map_subbroker', label: 'Auto-map sub-broker', kind: 'boolean' },
    { key: 'import_closed_ended_transfer_in_out', label: 'Import closed-ended transfers', kind: 'boolean' },
    { key: 'import_segregated_schemes', label: 'Import segregated schemes', kind: 'boolean' },
    { key: 'show_active_sip', label: 'Show active SIP', kind: 'boolean' },
    { key: 'show_sip_summary', label: 'Show SIP summary', kind: 'boolean' },
    { key: 'show_subbroker_name_code', label: 'Show sub-broker name and code', kind: 'boolean' },
    { key: 'active_folio_only', label: 'Active folios only', kind: 'boolean' },
    { key: 'inward_transaction_type_codes', label: 'Inward transaction types', kind: 'codes', note: 'Comma-separated codes.' },
    { key: 'outward_transaction_type_codes', label: 'Outward transaction types', kind: 'codes', note: 'Comma-separated codes.' },
    { key: 'default_life_insurer', label: 'Default life insurer' },
    { key: 'overwrite_address_from_life_provider', label: 'Overwrite address from life provider', kind: 'boolean', note: 'Stored for future provider imports; it does not overwrite client addresses today.' },
    { key: 'default_general_insurer', label: 'Default general insurer' },
    { key: 'renewal_basis', label: 'Insurance renewal basis', kind: 'select', options: ['RENEWAL_DATE', 'EXPIRY_DATE'] },
    { key: 'default_fixed_term_investment_type', label: 'Default fixed-term investment' },
  ],
};

const domainGroups = [
  { title: 'Mutual Fund & Display', keys: [
    'cost_basis_method', 'fund_visibility', 'default_ranking_basis', 'crm_report_tolerance',
    'mask_pan_internal', 'mask_folio_internal', 'mask_folio_client_portal', 'show_indices',
    'show_sub_one_year_returns', 'show_negative_xirr_cagr', 'xirr_min_holding_days',
    'sip_summary_source', 'show_stp_in_recent_widgets', 'show_active_sip',
    'show_sip_summary', 'show_subbroker_name_code', 'active_folio_only',
  ] },
  { title: 'Reports, Tax & eCAS', keys: [
    'show_gst_breakup_in_brokerage_analysis', 'calculate_lt_capital_gain_exemption',
    'include_switches_in_absolute_return', 'show_surrender_value_in_mobile_app',
    'active_sip_report_from_last_month', 'include_fully_redeemed_units_in_gain_loss',
    'export_capital_gains_in_finsys_format', 'monthly_ecas_request_limit',
  ] },
  { title: 'Data Import Rules', keys: [
    'auto_create_customers_from_rta', 'self_reconcile_aum',
    'update_folio_bank_details_from_rta', 'update_nominee_details_from_rta',
    'auto_map_subbroker', 'import_closed_ended_transfer_in_out', 'import_segregated_schemes',
    'inward_transaction_type_codes', 'outward_transaction_type_codes',
  ] },
  { title: 'Auto-Import & Provider Details', keys: [
    'auto_import_enabled', 'forwarding_email_addresses', 'cams_arn_number',
    'cams_subscription_expires_on', 'cams_registered_email', 'cams_provider_user_id',
    'cams_is_corporate', 'kfin_arn_number', 'kfin_subscription_expires_on',
    'kfin_registered_email', 'kfin_provider_user_id', 'kfin_is_corporate',
    'cams_360_user_id',
  ] },
  { title: 'Insurance & Other Investments', keys: [
    'default_life_insurer', 'overwrite_address_from_life_provider', 'default_general_insurer', 'renewal_basis',
    'default_fixed_term_investment_type',
  ] },
];

const riskCodes = ['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE', 'VERY_AGGRESSIVE'];
const emptyRiskRows = () => riskCodes.map((risk_code) => ({
  risk_code, equity_allocation_pct: '', debt_allocation_pct: '',
  expected_equity_return_pct: '', expected_debt_return_pct: '',
}));
const defaults: Record<ApplicationConfigurationSection, Record<string, unknown>> = {
  COMMON: { letterhead_style: 'FULL', default_country: 'India', birthday_lookahead_days: 1, anniversary_lookahead_days: 1 },
  PRE_SALES: { investment_frequency: 'MONTHLY', allow_advisor_override: false, risk_profiles: emptyRiskRows() },
  DOMAIN_RELATED: {
    cost_basis_method: 'WEIGHTED_AVERAGE', fund_visibility: 'ALL', default_ranking_basis: 'INCEPTION', crm_report_tolerance: 0,
    mask_pan_internal: true, mask_folio_internal: true, mask_folio_client_portal: true,
    show_indices: false, show_sub_one_year_returns: false, show_negative_xirr_cagr: false,
    xirr_min_holding_days: 365, sip_summary_source: 'SIP_MASTER',
    show_stp_in_recent_widgets: false, show_gst_breakup_in_brokerage_analysis: false,
    calculate_lt_capital_gain_exemption: false, include_switches_in_absolute_return: false,
    show_surrender_value_in_mobile_app: false, active_sip_report_from_last_month: false,
    include_fully_redeemed_units_in_gain_loss: false, export_capital_gains_in_finsys_format: false,
    monthly_ecas_request_limit: 30, auto_import_enabled: false, forwarding_email_addresses: [],
    cams_is_corporate: false, kfin_is_corporate: false,
    overwrite_address_from_life_provider: false,
    auto_create_customers_from_rta: false, self_reconcile_aum: false,
    update_folio_bank_details_from_rta: false, update_nominee_details_from_rta: false,
    auto_map_subbroker: false, import_closed_ended_transfer_in_out: false,
    import_segregated_schemes: false, show_active_sip: false, show_sip_summary: false,
    show_subbroker_name_code: false, active_folio_only: false,
    inward_transaction_type_codes: [], outward_transaction_type_codes: [], renewal_basis: 'RENEWAL_DATE',
  },
};

function normalizedValues(section: ApplicationConfigurationSection, draft: Record<string, unknown>) {
  const values = { ...draft };
  for (const field of fields[section]) {
    if (field.kind === 'codes' || field.kind === 'emails') {
      values[field.key] = String(draft[field.key] ?? '').split(',').map((item) => field.kind === 'codes' ? item.trim().toUpperCase() : item.trim().toLowerCase()).filter(Boolean);
    } else if (!field.required && field.kind !== 'boolean' && field.kind !== 'number' && field.kind !== 'select' && draft[field.key] === '') {
      values[field.key] = null;
    }
  }
  return values;
}

export default function ApplicationConfigurationPage() {
  const [section, setSection] = useState<ApplicationConfigurationSection>('COMMON');
  const [current, setCurrent] = useState<ApplicationConfigurationVersion | null>(null);
  const [history, setHistory] = useState<ApplicationConfigurationVersion[]>([]);
  const [draft, setDraft] = useState<Record<string, unknown>>({ ...defaults.COMMON });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const { run, submitting } = useSingleSubmission();

  useEffect(() => {
    const token = localStorage.getItem('finplan_token');
    if (!token) { setError('Please sign in.'); setLoading(false); return; }
    let active = true;
    setLoading(true); setError(''); setNotice('');
    Promise.all([getApplicationConfiguration(token, section), listApplicationConfigurationHistory(token, section)])
      .then(([latest, versions]) => {
        if (!active) return;
        setCurrent(latest); setHistory(versions);
        setDraft({ ...defaults[section], ...(latest?.values ?? {}) });
      })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : 'Failed to load configuration'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [section]);

  function update(key: string, value: unknown) { setDraft((previous) => ({ ...previous, [key]: value })); setNotice(''); }

  function renderField(field: Field) {
    const value = draft[field.key];
    const id = `config-${field.key}`;
    if (field.kind === 'boolean') return (
      <label key={field.key} className="flex items-start gap-3 border border-line p-3 text-sm">
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => update(field.key, event.target.checked)} className="mt-1" />
        <span>{field.label}{field.note && <span className="block text-xs text-ash">{field.note}</span>}</span>
      </label>
    );
    const displayed = (field.kind === 'codes' || field.kind === 'emails') && Array.isArray(value) ? value.join(', ') : String(value ?? '');
    return (
      <label key={field.key} htmlFor={id} className="block text-sm">
        <span className="mb-2 block font-medium">{field.label}{field.required ? ' *' : ''}</span>
        {field.kind === 'select' ? (
          <select id={id} value={displayed} onChange={(event) => update(field.key, event.target.value)} className="w-full border border-line bg-white px-3 py-2">
            {field.options?.map((option) => <option key={option} value={option}>{option.replace(/_/g, ' ')}</option>)}
          </select>
        ) : field.kind === 'textarea' ? (
          <textarea id={id} value={displayed} onChange={(event) => update(field.key, event.target.value)} required={field.required} rows={3} className="w-full border border-line bg-white px-3 py-2" />
        ) : (
          <input id={id} type={field.kind === 'number' ? 'number' : field.kind === 'date' ? 'date' : 'text'} step={field.kind === 'number' ? 'any' : undefined}
            value={displayed} onChange={(event) => update(field.key, event.target.value)} required={field.required}
            className="w-full border border-line bg-white px-3 py-2" />
        )}
        {field.note && <span className="mt-1 block text-xs text-ash">{field.note}</span>}
      </label>
    );
  }

  function updateRisk(code: string, key: string, value: string) {
    const rows = (draft.risk_profiles as Record<string, string>[] | undefined) ?? emptyRiskRows();
    update('risk_profiles', rows.map((row) => row.risk_code === code ? { ...row, [key]: value } : row));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const token = localStorage.getItem('finplan_token');
    if (!token) { setError('Please sign in.'); return; }
    await run(async () => {
      setError(''); setNotice('');
      try {
        const saved = await saveApplicationConfiguration(token, section, current?.version ?? 0, normalizedValues(section, draft));
        setCurrent(saved);
        setHistory((previous) => [saved, ...previous.filter((item) => item.id !== saved.id)]);
        setDraft({ ...defaults[section], ...saved.values });
        setNotice(`Saved version ${saved.version}.`);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Failed to save configuration');
      }
    });
  }

  const selected = sections.find((item) => item.code === section)!;
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 text-obsidian">
      <p className="font-mono text-xs uppercase tracking-[.2em] text-ash">Administration</p>
      <h1 className="mt-2 font-serif text-4xl">Application Configuration</h1>
      <p className="mt-2 text-sm text-ash">Changes create a new organization-specific version. Earlier versions remain available for review.</p>
      <nav aria-label="Configuration sections" className="mt-7 flex flex-wrap gap-2">
        {sections.map((item) => <button key={item.code} type="button" onClick={() => setSection(item.code)}
          aria-current={section === item.code ? 'page' : undefined}
          className={`border px-4 py-2 text-sm ${section === item.code ? 'border-obsidian bg-obsidian text-white' : 'border-line bg-white text-obsidian'}`}>
          {item.title}
        </button>)}
      </nav>
      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="border border-line bg-white p-6">
          <h2 className="font-serif text-2xl">{selected.title}</h2>
          <p className="mt-1 text-sm text-ash">{selected.description}</p>
          {section === 'COMMON' && <p className="mt-2 text-sm text-ash">Legal name, PAN, GST, and registration number remain in <Link href="/admin/organization" className="underline">Organization</Link>; ARN records remain in <Link href="/admin/organization/arn-holders" className="underline">ARN Holders</Link>.</p>}
          {loading ? <p className="mt-6 text-sm text-ash">Loading configuration...</p> : (
            <form onSubmit={save} className="mt-6 space-y-6">
              {error && <p role="alert" className="border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              {notice && <p role="status" className="border border-green-300 bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
              {section === 'DOMAIN_RELATED' ? domainGroups.map((group) => (
                <section key={group.title} className="border-t border-line pt-5">
                  <h3 className="mb-4 font-serif text-xl">{group.title}</h3>
                  <div className="grid gap-4 md:grid-cols-2">{fields.DOMAIN_RELATED.filter((field) => group.keys.includes(field.key)).map(renderField)}</div>
                </section>
              )) : <div className="grid gap-4 md:grid-cols-2">{fields[section].map(renderField)}</div>}
              {section === 'DOMAIN_RELATED' && <div className="border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                <h3 className="font-semibold">Credentials and unsupported actions</h3>
                <p className="mt-1">CAMS/KFintech archive passwords, mailback passwords, CAMS 360 answers, and portal credentials are not stored in this configuration. They require the separate encrypted RTA connection workflow. Showing customer passwords and deleting ETF transactions are not offered.</p>
              </div>}
              {section === 'PRE_SALES' && (
                <div className="overflow-x-auto">
                  <h3 className="mb-2 font-serif text-xl">Client risk-profile parameters</h3>
                  <p className="mb-4 text-sm text-ash">Set allocations and expected returns for each profile. Equity and debt must total 100%.</p>
                  <table className="min-w-full text-left text-sm">
                    <thead><tr className="border-b border-line"><th className="p-2">Risk profile</th><th className="p-2">Equity %</th><th className="p-2">Debt %</th><th className="p-2">Equity return %</th><th className="p-2">Debt return %</th></tr></thead>
                    <tbody>{((draft.risk_profiles as Record<string, string>[] | undefined) ?? emptyRiskRows()).map((row) => (
                      <tr key={row.risk_code} className="border-b border-line">
                        <th scope="row" className="p-2 font-medium">{row.risk_code.replace(/_/g, ' ')}</th>
                        {(['equity_allocation_pct', 'debt_allocation_pct', 'expected_equity_return_pct', 'expected_debt_return_pct'] as const).map((key) => (
                          <td key={key} className="p-2"><input type="number" step="0.01" min="0" max="100" required
                            aria-label={`${row.risk_code} ${key.replace(/_/g, ' ')}`}
                            value={String(row[key] ?? '')} onChange={(event) => updateRisk(row.risk_code, key, event.target.value)}
                            className="w-24 border border-line px-2 py-2" /></td>
                        ))}
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
              <button type="submit" disabled={submitting} className="bg-obsidian px-5 py-3 text-sm text-white disabled:opacity-50">
                {submitting ? 'Saving...' : 'Save new version'}
              </button>
            </form>
          )}
        </section>
        <aside className="self-start border border-line bg-white p-5">
          <h2 className="font-serif text-xl">Version history</h2>
          <p className="mt-1 text-xs text-ash">Current version: {current?.version ?? 'Not configured'}</p>
          {history.length === 0 ? <p className="mt-4 text-sm text-ash">No saved versions yet.</p> : (
            <div className="mt-4 space-y-3">{history.map((item) => <details key={item.id} className="border border-line p-3 text-sm">
              <summary className="cursor-pointer">Version {item.version} · {new Date(item.created_at).toLocaleString()}</summary>
              <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words bg-bone-deep p-2 text-xs">{JSON.stringify(item.values, null, 2)}</pre>
            </details>)}</div>
          )}
        </aside>
      </div>
    </main>
  );
}
