import { isSupabaseConfigured, supabase } from './supabase';

export { isSupabaseConfigured, supabase };

/**
 * Ro'yxatdan o'tish yordamchi funksiyasi
 */
export async function registerUser({ fullName, phone, gradeLevel, track }) {
  if (!isSupabaseConfigured) {
    // Demo rejimida lokal xotiraga (localStorage) saqlash
    const mockUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      full_name: fullName,
      phone: phone,
      grade_level: gradeLevel,
      selected_track: track,
      xp: 50, // Birinchi ro'yxatdan o'tganlik uchun bonus XP
      streak_days: 1,
      status: 'active',
      subscription: {
        plan_type: 'trial',
        status: 'trial',
        days_left: 3
      }
    };
    localStorage.setItem('tarixiy_current_user', JSON.stringify(mockUser));
    return { data: { user: mockUser }, error: null };
  }

  // Supabase bilan haqiqiy integratsiya
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      phone: phone,
      options: {
        data: {
          full_name: fullName,
          grade_level: gradeLevel,
          selected_track: track
        }
      }
    });

    if (authError) throw authError;

    // Profil jadvaliga yozish
    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authData.user.id,
        full_name: fullName,
        phone: phone,
        grade_level: gradeLevel,
        selected_track: track,
        xp: 50,
        streak_days: 1
      });

      // 3 kunlik sinov obunasini ochish
      await supabase.from('subscriptions').insert({
        user_id: authData.user.id,
        plan_type: 'trial',
        status: 'trial'
      });

      if (profileError) throw profileError;
    }

    return { data: authData, error: null };
  } catch (error) {
    console.error('Supabase orqali ro\'yxatdan o\'tishda xatolik:', error);
    return { data: null, error };
  }
}
