// ClipGate Tools — Gate
// Tools call requireTier() and enforceLimit(); they never inspect tiers directly.
//
// Phase 1 state: currentTier() always returns 'free', so every gate allows.
// Phase X state: currentTier() reads license via license.js (signed Ed25519 JWT).
//
// See /Clip Gate Private/docs/TOOLS_STRATEGY.md §5.3.

import { FEATURES } from './entitlements.js';

const TIER_RANK = { free: 0, pro: 1, pro_api: 2, team: 3 };

// Phase 1 stub. Phase X swaps for license.js verification.
async function currentTier() {
  return 'free';
}

export async function requireTier(featureKey) {
  const feature = FEATURES[featureKey];
  if (!feature) return true;                 // unknown feature → allow
  if (feature.tier === 'free') return true;
  const userTier = await currentTier();
  return (TIER_RANK[userTier] ?? 0) >= (TIER_RANK[feature.tier] ?? 0);
}

export async function enforceLimit(featureKey, currentCount) {
  const feature = FEATURES[featureKey];
  if (!feature) return { allowed: true };
  const userTier = await currentTier();
  if ((TIER_RANK[userTier] ?? 0) >= (TIER_RANK[feature.tier] ?? 0)) {
    return { allowed: true };
  }
  if (currentCount < (feature.free_limit ?? 1)) {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: 'free_limit_exceeded',
    feature: featureKey,
    upgrade_url: '/pro/',
  };
}

export async function isPro() {
  const t = await currentTier();
  return t === 'pro' || t === 'pro_api' || t === 'team';
}
