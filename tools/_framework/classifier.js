// ClipGate Tools — Lightweight Classifier (JS port)
// Mirrors the 13-type taxonomy used by the ClipGate CLI's native classifier.
// This is a deliberately conservative JS port for the on-page live demo —
// it is NOT bit-for-bit identical to the Rust implementation. Shannon-entropy,
// regex priority ordering, and confidence thresholds are tuned to produce the
// same type label on the dominant ~95% of common dev clipboard payloads.
//
// Source of truth for the production classifier: ClipGate CLI (Rust, private).
// See /Clip Gate Private/docs/TOOLS_STRATEGY.md §5.1 for the design notes.

export const TYPE_META = {
  secret:  { label: 'Secret (detected)',  detail: 'ClipGate would mark this as a secret and require explicit unlock before paste.' },
  error:   { label: 'Error / Stack',      detail: 'Exception or stack trace — ClipGate would auto-tag and keep it searchable by error class.' },
  sha:     { label: 'Git SHA',            detail: 'Commit hash — ClipGate would link it to its commit message on retrieval.' },
  diff:    { label: 'Diff / Patch',       detail: 'Unified diff — ClipGate would preserve +/- formatting and syntax highlight.' },
  path:    { label: 'File Path',          detail: 'Filesystem path — ClipGate would let you jump to the file directly.' },
  json:    { label: 'JSON',               detail: 'Structured JSON — ClipGate would pretty-print on paste and store raw.' },
  url:     { label: 'URL',                detail: 'Link — ClipGate would show a preview and let you copy just the domain or path.' },
  sql:     { label: 'SQL',                detail: 'SQL statement — ClipGate would format on paste and tag by statement type.' },
  ip:      { label: 'IP Address',         detail: 'IP address — ClipGate would tag it and let you copy just host or port.' },
  env:     { label: '.env Line',          detail: 'Environment variable — ClipGate would warn if the value looks like a secret.' },
  docker:  { label: 'Docker Command',     detail: 'Docker CLI command — ClipGate would tag and make it replayable.' },
  command: { label: 'Shell Command',      detail: 'Shell command — ClipGate would store it and let you paste-and-run.' },
  text:    { label: 'Plain Text',         detail: 'Free-form text — ClipGate would keep it searchable in your clipboard history.' },
};

// ─── Patterns (ordered by priority) ──────────────────────────
const SECRET_PATTERNS = [
  /\bAKIA[0-9A-Z]{16}\b/,                         // AWS access key
  /\bAIza[0-9A-Za-z\-_]{35}\b/,                   // Google API key
  /\bghp_[0-9A-Za-z]{36}\b/,                      // GitHub PAT (classic)
  /\bgho_[0-9A-Za-z]{36}\b/,                      // GitHub OAuth
  /\bghs_[0-9A-Za-z]{36}\b/,                      // GitHub server
  /\bghr_[0-9A-Za-z]{36}\b/,                      // GitHub refresh
  /\bgithub_pat_[0-9A-Za-z_]{82}\b/,              // GitHub fine-grained PAT
  /\bsk-[0-9A-Za-z]{20,}\b/,                      // OpenAI-style
  /\bxox[pbar]-[0-9A-Za-z\-]{10,}\b/,             // Slack token
  /\bsk_(live|test)_[0-9A-Za-z]{24,}\b/,          // Stripe
  /\brk_(live|test)_[0-9A-Za-z]{24,}\b/,          // Stripe restricted
  /-----BEGIN (RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----/,
  /\beyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\b/, // JWT
];

const ERROR_PATTERNS = [
  /^(Error|Exception|Traceback|Caused by|panic:)/m,
  /\b[A-Z][A-Za-z]*(Error|Exception):/,
  /^\s+at\s+[\w$.<>]+\s*\(?[^)]*:\d+/m,           // Java/JS stack frame
  /^\s+File\s+".+",\s+line\s+\d+/m,               // Python stack frame
  /^\s*\d+:\s+.*\n\s*\d+:\s+/m,                   // Rust backtrace
];

const SHA_PATTERN      = /^[0-9a-f]{7,40}$/i;
const DIFF_PATTERNS    = [/^diff --git /m, /^---\s+a\/.*\n\+\+\+\s+b\//m, /^@@ .* @@/m];
const PATH_PATTERNS    = [
  /^(\/[A-Za-z0-9_\-. ]+){2,}\/?$/,                  // unix path
  /^[A-Z]:\\(?:[^\\/:*?"<>|\r\n]+\\)+[^\\/:*?"<>|\r\n]*$/, // windows
  /^~\/[A-Za-z0-9_\-./]+$/,                        // home-relative
];
const URL_PATTERN      = /^(https?|ftp|ws|wss|file|git):\/\/[\w\-._~:/?#\[\]@!$&'()*+,;=%]+$/i;
const IP_PATTERN_V4    = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)(?::\d{1,5})?$/;
const IP_PATTERN_V6    = /^(([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}|::1|::)$/i;
const ENV_PATTERN      = /^[A-Z][A-Z0-9_]*=.+$/m;
const DOCKER_PATTERN   = /^docker(\s+(run|build|exec|pull|push|compose|ps|images|rm|rmi|logs|stop|start|restart|tag|network|volume|inspect))/;
const COMMAND_PATTERNS = [
  /^(sudo\s+)?(ls|cd|cat|grep|rg|find|sed|awk|curl|wget|git|npm|yarn|pnpm|pip|cargo|go|make|kubectl|ssh|scp|rsync|tar|gzip|chmod|chown|ps|top|htop|kill|mv|cp|rm|mkdir|touch|echo|export|source|bash|zsh|sh|python|node|ruby|java|rustc|gcc|clang|ffmpeg|jq|yq|brew|apt|apt-get|yum|pacman)\b/,
];
const SQL_PATTERN = /^(\s*(--[^\n]*\n)*)?\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TRUNCATE|WITH|EXPLAIN|GRANT|REVOKE)\b/i;

// ─── Shannon entropy (bits/char) ─────────────────────────────
function shannonEntropy(s) {
  if (!s) return 0;
  const freq = {};
  for (const c of s) freq[c] = (freq[c] || 0) + 1;
  const n = s.length;
  let H = 0;
  for (const k in freq) {
    const p = freq[k] / n;
    H -= p * Math.log2(p);
  }
  return H;
}

// High-entropy long alphanumeric blobs → probable secret.
function looksHighEntropySecret(s) {
  if (s.length < 32) return false;
  if (!/^[A-Za-z0-9_\-+/=]+$/.test(s)) return false;
  return shannonEntropy(s) > 4.2;
}

// ─── JSON quick check ───────────────────────────────────────
function isJson(s) {
  const t = s.trim();
  if (!((t.startsWith('{') && t.endsWith('}')) || (t.startsWith('[') && t.endsWith(']')))) {
    return false;
  }
  try { JSON.parse(t); return true; } catch { return false; }
}

// ─── Main classifier ────────────────────────────────────────
export function classifyContent(raw) {
  if (!raw) return { type: 'text', detail: '' };
  const text = String(raw);
  const trimmed = text.trim();
  if (!trimmed) return { type: 'text', detail: '' };

  // Priority 1: secrets (includes high-entropy)
  for (const re of SECRET_PATTERNS) {
    if (re.test(trimmed)) {
      return { type: 'secret', detail: 'Matched a known secret format. ClipGate would block paste by default.' };
    }
  }
  if (looksHighEntropySecret(trimmed)) {
    return { type: 'secret', detail: `High-entropy blob (${trimmed.length} chars). ClipGate would flag this as a possible secret.` };
  }

  // Priority 2: errors / stack traces
  for (const re of ERROR_PATTERNS) {
    if (re.test(text)) {
      return { type: 'error', detail: 'Detected stack-trace-like pattern. ClipGate would tag this as an error for easy retrieval.' };
    }
  }

  // Priority 3: diffs
  for (const re of DIFF_PATTERNS) {
    if (re.test(text)) return { type: 'diff', detail: 'Unified diff detected. ClipGate preserves hunk formatting on paste.' };
  }

  // Single-line checks (only apply to single-line payloads)
  const singleLine = !text.includes('\n');

  if (singleLine) {
    if (SHA_PATTERN.test(trimmed)) {
      return { type: 'sha', detail: `${trimmed.length}-char hex — ClipGate tags this as a git SHA.` };
    }
    if (URL_PATTERN.test(trimmed)) {
      return { type: 'url', detail: 'URL — ClipGate would let you copy just the host, path, or query.' };
    }
    if (IP_PATTERN_V4.test(trimmed) || IP_PATTERN_V6.test(trimmed)) {
      return { type: 'ip', detail: 'IP address — ClipGate tags these and lets you copy just the host or port.' };
    }
    for (const re of PATH_PATTERNS) {
      if (re.test(trimmed)) return { type: 'path', detail: 'Filesystem path — ClipGate would let you jump to the file directly.' };
    }
    if (DOCKER_PATTERN.test(trimmed)) {
      return { type: 'docker', detail: 'Docker command — ClipGate tags it and makes it replayable.' };
    }
    for (const re of COMMAND_PATTERNS) {
      if (re.test(trimmed)) return { type: 'command', detail: 'Shell command — ClipGate stores it and lets you paste-and-run.' };
    }
  }

  // JSON (multiline OK)
  if (isJson(trimmed)) {
    return { type: 'json', detail: 'Valid JSON — ClipGate pretty-prints on paste and keeps raw for re-copy.' };
  }

  // SQL (anywhere in first non-comment line)
  if (SQL_PATTERN.test(trimmed)) {
    return { type: 'sql', detail: 'SQL statement — ClipGate formats on paste and tags by statement type.' };
  }

  // .env
  if (ENV_PATTERN.test(text) && /^[A-Z][A-Z0-9_]*=/.test(trimmed.split('\n')[0])) {
    return { type: 'env', detail: 'Environment variable — ClipGate warns if the value looks like a secret.' };
  }

  return { type: 'text', detail: '' };
}
