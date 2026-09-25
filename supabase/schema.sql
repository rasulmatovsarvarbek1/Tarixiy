-- ================================================================
-- TARIXIY PLATFORMASI — SUPABASE DATABASE SXEMASI (PostgreSQL)
-- ================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. FOYDALANUVCHI PROFILLARI (auth.users bilan uzviy bog'liq)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone text unique not null,
  grade_level int not null check (grade_level between 5 and 12), -- 5-11: maktab sinflari, 12: abituriyent/litsey
  selected_track text not null default 'full_history' check (selected_track in ('full_history', 'national_certificate')),
  xp int default 0,
  streak_days int default 0,
  last_active_at timestamptz default now(),
  status text default 'active' check (status in ('active', 'blocked', 'frozen')),
  role text default 'student' check (role in ('student', 'teacher', 'admin')),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. TARIF VA OBUNA TIZIMI
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan_type text not null default 'trial' check (plan_type in ('trial', 'monthly', 'quarterly', 'yearly')),
  status text default 'trial' check (status in ('trial', 'active', 'expired', 'pending_approval')),
  starts_at timestamptz default now(),
  trial_ends_at timestamptz default (now() + interval '3 days'), -- 3 kun bepul sinov
  expires_at timestamptz,
  receipt_image_url text, -- to'lov chek screenshot URL
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- 4. KURSLAR VA YO'NALISHLAR
create table if not exists public.courses (
  id text primary key, -- 'full_history', 'national_certificate'
  title text not null,
  description text,
  icon_name text default 'BookOpen',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 5. HAFTALIK TIKL (Haftalar)
create table if not exists public.weeks (
  id uuid default gen_random_uuid() primary key,
  course_id text references public.courses(id) on delete cascade not null,
  week_number int not null,
  title text not null,
  description text,
  created_at timestamptz default now(),
  unique (course_id, week_number)
);

-- 6. KUNLIK DARSLAR (Dushanba-Shanba: 1-6)
create table if not exists public.lessons (
  id uuid default gen_random_uuid() primary key,
  week_id uuid references public.weeks(id) on delete cascade not null,
  day_of_week int not null check (day_of_week between 1 and 6), -- 1: Dushanba, 6: Shanba
  title text not null,
  subtitle text,
  video_url text, -- Masalan: YouTube embed video kodi
  audio_url text, -- Matnning audio yozuvi
  content_markdown text not null,
  key_takeaways jsonb default '[]'::jsonb, -- Muhim sanalar va atamalar
  estimated_minutes int default 15,
  created_at timestamptz default now(),
  unique (week_id, day_of_week)
);

-- 7. DUOLINGO USLUBIDAGI SAVOLLAR (Mashqlar va Yakuniy Imtihon uchun)
create table if not exists public.questions (
  id uuid default gen_random_uuid() primary key,
  lesson_id uuid references public.lessons(id) on delete cascade,
  week_id uuid references public.weeks(id) on delete cascade,
  is_weekly_exam boolean default false, -- true bo'lsa yakshanbalik imtihonga tegishli
  question_type text not null check (question_type in ('multiple_choice', 'matching', 'timeline_order', 'fill_blank')),
  question_text text not null,
  options jsonb not null, -- savol variantlari yoki juftliklar
  correct_answer jsonb not null,
  explanation text, -- javob izohi
  difficulty_level int default 1 check (difficulty_level between 1 and 3), -- 1: oson, 2: o'rta, 3: qiyin
  time_limit_sec int default 20,
  created_at timestamptz default now()
);

-- 8. O'QUVCHINING DARSLAR BO'YICHA PROGRESSI
create table if not exists public.user_lesson_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  score_percent int not null default 0,
  xp_earned int default 0,
  completed_at timestamptz default now(),
  unique (user_id, lesson_id)
);

-- 9. YAKSHANBA YAKUNIY IMTIHON NATIJALARI (Anti-Cheat himoyasi bilan)
create table if not exists public.weekly_exam_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  week_id uuid references public.weeks(id) on delete cascade not null,
  score_percent numeric(5,2) not null,
  passed boolean default false, -- ball >= 95% bo'lsa true
  terminated_reason text check (terminated_reason in ('completed', 'tab_switch', 'timeout', 'blur_violation')),
  answers_log jsonb default '[]'::jsonb,
  duration_seconds int default 0,
  created_at timestamptz default now()
);

-- 10. FAOLIK LOGLARI VA BLOCK NAZORATI (24s push, 39s bloklash)
create table if not exists public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  action_type text not null, -- 'login', 'lesson_complete', 'exam_start', 'exam_finish'
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

-- 11. ROW LEVEL SECURITY (RLS) SOZLAMALARI
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.courses enable row level security;
alter table public.weeks enable row level security;
alter table public.lessons enable row level security;
alter table public.questions enable row level security;
alter table public.user_lesson_progress enable row level security;
alter table public.weekly_exam_attempts enable row level security;

-- Ommaviy ko'rish qoidalari (kurslar va ochiq darslar):
create policy "Kurslar barchaga ochiq" on public.courses for select using (true);
create policy "Haftalar barchaga ochiq" on public.weeks for select using (true);
create policy "Darslarni o'quvchilar ko'ra oladi" on public.lessons for select using (auth.role() = 'authenticated');

-- Foydalanuvchi faqat o'z profilini ko'rish va yangilashi mumkin:
create policy "Foydalanuvchilar o'z profilini ko'ra oladi" on public.profiles 
  for select using (auth.uid() = id);

create policy "Foydalanuvchilar o'z profilini yangilashi mumkin" on public.profiles 
  for update using (auth.uid() = id);

-- Foydalanuvchilar o'z obunalarini ko'ra oladi:
create policy "Foydalanuvchilar o'z obunasini ko'ra oladi" on public.subscriptions 
  for select using (auth.uid() = user_id);

-- Dars yechish progressi:
create policy "Foydalanuvchilar o'z progressini ko'ra oladi va saqlaydi" on public.user_lesson_progress
  for all using (auth.uid() = user_id);

-- ================================================================
-- BOSHLANG'ICH TEST MA'LUMOTLARI (SEED DATA)
-- ================================================================
insert into public.courses (id, title, description) values
  ('full_history', 'Full Tarix (O''zbekiston va Jahon tarixi)', '5-11 sinf dasturi bo''yicha qadimdan bugungi kungacha to''liq kurs'),
  ('national_certificate', 'Milliy Sertifikatga Tayyorlov', 'Tarix fani bo''yicha milliy sertifikat va DTM imtihonlariga intensiv dastur')
on conflict (id) do nothing;
