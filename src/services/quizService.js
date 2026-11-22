import { requireSupabase } from '../lib/supabase';

const SESSION_KEY = 'tarixiy:quiz-session';

export function getStoredQuizSession() {
  try {
    return window.sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function storeQuizSession(sessionId) {
  if (!sessionId) return;
  window.sessionStorage.setItem(SESSION_KEY, String(sessionId));
}

export function clearQuizSession() {
  window.sessionStorage.removeItem(SESSION_KEY);
}

async function rpc(name, args) {
  const client = requireSupabase();
  const { data, error } = await client.rpc(name, args);
  if (error) throw error;
  return data;
}

export function testBoshlash({ tur, darsId = null, levelId = null }) {
  return rpc('test_boshlash', {
    p_tur: tur,
    p_dars_id: darsId,
    p_level_id: levelId,
  });
}

export function testHolat(sessiyaId) {
  return rpc('test_holat', { p_sessiya_id: sessiyaId });
}

export function testJavob({ sessiyaId, savolId, variant }) {
  return rpc('test_javob', {
    p_sessiya_id: sessiyaId,
    p_savol_id: savolId,
    p_variant: variant,
  });
}

export function testTugat(sessiyaId) {
  return rpc('test_tugat', { p_sessiya_id: sessiyaId });
}

export function imtihonHolati(levelId) {
  return rpc('imtihon_holati', { p_level_id: levelId });
}

export function kunlikTestHolati() {
  return rpc('kunlik_test_holati');
}
