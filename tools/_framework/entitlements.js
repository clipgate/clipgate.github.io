// ClipGate Tools — Entitlements Registry
// SINGLE SOURCE OF TRUTH for feature gating across all tools.
// Changing a line here changes behavior site-wide.
//
// Phase 1 state: all features are tier: 'free'.
// Phase X state: batch/API/persistence/team features flip to their real tiers.
//
// See /Clip Gate Private/docs/TOOLS_STRATEGY.md §5.2 + Appendix A for full
// design rationale. This file is served as static ES module from the site.

export const FEATURES = {
  // ── JWT Decoder ──────────────────────────────────────────────
  'jwt.decode_single':      { tier: 'free' },
  'jwt.signature_verify':   { tier: 'free' },  // Phase X → 'pro'
  'jwt.batch_decode':       { tier: 'free' },  // Phase X → 'pro', free_limit: 1
  'jwt.save_history':       { tier: 'free' },  // Phase X → 'pro'
  'jwt.api_access':         { tier: 'free' },  // Phase X → 'pro_api'

  // ── JSON Formatter ───────────────────────────────────────────
  'json.format_single':     { tier: 'free' },
  'json.minify':            { tier: 'free' },
  'json.schema_validate':   { tier: 'free' },  // Phase X → 'pro'
  'json.diff_two':          { tier: 'free' },  // Phase X → 'pro'
  'json.batch_files':       { tier: 'free' },  // Phase X → 'pro', free_limit: 1
  'json.api_access':        { tier: 'free' },  // Phase X → 'pro_api'

  // ── Secret Scanner ───────────────────────────────────────────
  'scan.paste_single':      { tier: 'free' },
  'scan.file_upload':       { tier: 'free' },  // Phase X → 'pro'
  'scan.folder_scan':       { tier: 'free' },  // Phase X → 'pro'
  'scan.repo_scan':         { tier: 'free' },  // Phase X → 'team'
  'scan.custom_rulesets':   { tier: 'free' },  // Phase X → 'pro'
  'scan.team_rules':        { tier: 'free' },  // Phase X → 'team'
  'scan.api_access':        { tier: 'free' },  // Phase X → 'pro_api'

  // ── Base64 ───────────────────────────────────────────────────
  'base64.text_single':     { tier: 'free' },
  'base64.file':            { tier: 'free' },  // Phase X → 'pro'
  'base64.batch':           { tier: 'free' },  // Phase X → 'pro', free_limit: 1
  'base64.api_access':      { tier: 'free' },  // Phase X → 'pro_api'

  // ── URL Encode/Decode ────────────────────────────────────────
  'url.single':             { tier: 'free' },
  'url.batch':              { tier: 'free' },  // Phase X → 'pro', free_limit: 1
  'url.query_builder':      { tier: 'free' },  // Phase X → 'pro'
  'url.api_access':         { tier: 'free' },  // Phase X → 'pro_api'

  // ── UUID Generator ───────────────────────────────────────────
  'uuid.single_v4':         { tier: 'free' },
  'uuid.bulk':              { tier: 'free' },  // Phase X → 'pro', free_limit: 10
  'uuid.all_versions':      { tier: 'free' },  // Phase X → 'pro'
  'uuid.csv_export':        { tier: 'free' },  // Phase X → 'pro'
  'uuid.api_access':        { tier: 'free' },  // Phase X → 'pro_api'

  // ── Timestamp Converter ──────────────────────────────────────
  'ts.single_convert':      { tier: 'free' },
  'ts.batch':               { tier: 'free' },  // Phase X → 'pro', free_limit: 1
  'ts.timezone_matrix':     { tier: 'free' },  // Phase X → 'pro'
  'ts.api_access':          { tier: 'free' },  // Phase X → 'pro_api'

  // ── Regex Tester ─────────────────────────────────────────────
  'regex.basic_match':      { tier: 'free' },
  'regex.named_captures':   { tier: 'free' },  // Phase X → 'pro'
  'regex.replace_mode':     { tier: 'free' },  // Phase X → 'pro'
  'regex.saved_patterns':   { tier: 'free' },  // Phase X → 'pro'
  'regex.unit_test_mode':   { tier: 'free' },  // Phase X → 'pro'

  // ── Hash Generator ───────────────────────────────────────────
  'hash.text_single':       { tier: 'free' },
  'hash.file':              { tier: 'free' },  // Phase X → 'pro'
  'hash.bulk':              { tier: 'free' },  // Phase X → 'pro', free_limit: 1
  'hash.hmac':              { tier: 'free' },  // Phase X → 'pro'
  'hash.api_access':        { tier: 'free' },  // Phase X → 'pro_api'

  // ── Diff Viewer ──────────────────────────────────────────────
  'diff.basic_two_text':    { tier: 'free' },
  'diff.syntax_aware':      { tier: 'free' },  // Phase X → 'pro'
  'diff.patch_export':      { tier: 'free' },  // Phase X → 'pro'
  'diff.saved_diffs':       { tier: 'free' },  // Phase X → 'pro'
  'diff.three_way':         { tier: 'free' },  // Phase X → 'pro'

  // ── YAML ↔ JSON ──────────────────────────────────────────────
  'yj.basic_convert':       { tier: 'free' },
  'yj.schema_preserve':     { tier: 'free' },  // Phase X → 'pro'
  'yj.anchors':             { tier: 'free' },  // Phase X → 'pro'
  'yj.batch':               { tier: 'free' },  // Phase X → 'pro', free_limit: 1
  'yj.api_access':          { tier: 'free' },  // Phase X → 'pro_api'

  // ── SQL Formatter ────────────────────────────────────────────
  'sql.default_format':     { tier: 'free' },
  'sql.dialects':           { tier: 'free' },  // Phase X → 'pro'
  'sql.saved_style_guides': { tier: 'free' },  // Phase X → 'pro'

  // ── Cron Explainer ───────────────────────────────────────────
  'cron.vixie_parse':       { tier: 'free' },
  'cron.dialects':          { tier: 'free' },  // Phase X → 'pro'
  'cron.calendar_preview':  { tier: 'free' },  // Phase X → 'pro'
  'cron.saved_expressions': { tier: 'free' },  // Phase X → 'pro'

  // ── .env Validator ───────────────────────────────────────────
  'env.single_validate':    { tier: 'free' },
  'env.schema_defs':        { tier: 'free' },  // Phase X → 'pro'
  'env.repo_leak_check':    { tier: 'free' },  // Phase X → 'team'
  'env.api_access':         { tier: 'free' },  // Phase X → 'pro_api'

  // ── cURL Converter ───────────────────────────────────────────
  'curl.single_to_fetch':   { tier: 'free' },
  'curl.multi_target':      { tier: 'free' },  // Phase X → 'pro'
  'curl.batch':             { tier: 'free' },  // Phase X → 'pro', free_limit: 1
  'curl.history':           { tier: 'free' },  // Phase X → 'pro'
};

export const TIERS = ['free', 'pro', 'pro_api', 'team'];

export const TIER_PRICE = {
  free: 0,
  pro: 5,              // USD/mo (Phase X)
  pro_api: 10,         // USD/mo minimum (Phase X, usage-tiered above)
  team: 12,            // USD/user/mo (Phase X, 5-seat minimum)
};

export const TIER_LABEL = {
  free: 'Free',
  pro: 'ClipGate Pro',
  pro_api: 'ClipGate Pro + API',
  team: 'ClipGate Team',
};

// Catalog of all tools — used by the hub page and related-tools widgets.
// Keep in sync with TOOLS_STRATEGY.md §3.
export const TOOLS = [
  { slug: 'jwt-decoder',  name: 'JWT Decoder',          tagline: 'Decode, inspect, and verify JSON Web Tokens.',              status: 'live',    category: 'Security',   icon: '🔐' },
  { slug: 'json',         name: 'JSON Formatter',       tagline: 'Format, minify, validate, and explore JSON — no ads ever.', status: 'planned', category: 'Data',       icon: '{ }' },
  { slug: 'scan',         name: 'Secret Scanner',       tagline: 'Detect API keys, tokens, and passwords in pasted text.',    status: 'planned', category: 'Security',   icon: '🛡' },
  { slug: 'base64',       name: 'Base64 Encode/Decode', tagline: 'Convert between text, bytes, and Base64.',                  status: 'live',    category: 'Data',       icon: '64' },
  { slug: 'url',          name: 'URL Encode/Decode',    tagline: 'Encode and decode URL components.',                         status: 'live',    category: 'Web',        icon: '⇆' },
  { slug: 'uuid',         name: 'UUID Generator',       tagline: 'Generate v1, v4, and v7 UUIDs.',                            status: 'live',    category: 'Data',       icon: 'ID' },
  { slug: 'timestamp',    name: 'Timestamp Converter',  tagline: 'Convert between Unix, ISO, and human-readable timestamps.', status: 'live',    category: 'Data',       icon: '⏱' },
  { slug: 'regex',        name: 'Regex Tester',         tagline: 'Test, debug, and explain regular expressions.',             status: 'planned', category: 'Text',       icon: '.*' },
  { slug: 'hash',         name: 'Hash Generator',       tagline: 'MD5, SHA-1, SHA-256, HMAC — text or file.',                  status: 'planned', category: 'Security',   icon: '#' },
  { slug: 'diff',         name: 'Diff Viewer',          tagline: 'Side-by-side or unified diff of any two texts.',            status: 'planned', category: 'Text',       icon: '≠' },
  { slug: 'yaml-json',    name: 'YAML ↔ JSON',          tagline: 'Convert between YAML and JSON, preserving structure.',      status: 'planned', category: 'Data',       icon: '⇌' },
  { slug: 'sql',          name: 'SQL Formatter',        tagline: 'Format SQL for readability across dialects.',               status: 'planned', category: 'Data',       icon: 'SQL' },
  { slug: 'cron',         name: 'Cron Explainer',       tagline: 'Parse and explain cron expressions in plain English.',      status: 'planned', category: 'Devops',     icon: '⧗' },
  { slug: 'env',          name: '.env Validator',       tagline: 'Validate .env files and spot leaked secrets.',              status: 'planned', category: 'Devops',     icon: '=' },
  { slug: 'curl',         name: 'cURL → fetch',         tagline: 'Convert cURL commands to fetch, axios, requests, Go, Rust.', status: 'planned', category: 'Web',       icon: '↗' },
];
