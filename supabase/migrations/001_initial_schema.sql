-- StudyBuddy initial schema with RLS

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Study sets
create table if not exists public.study_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  subject text,
  source_text text,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists study_sets_user_id_idx on public.study_sets (user_id);

alter table public.study_sets enable row level security;

create policy "Users can view own study sets"
  on public.study_sets for select
  using (auth.uid() = user_id);

create policy "Users can insert own study sets"
  on public.study_sets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own study sets"
  on public.study_sets for update
  using (auth.uid() = user_id);

create policy "Users can delete own study sets"
  on public.study_sets for delete
  using (auth.uid() = user_id);

-- Flashcards
create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  study_set_id uuid not null references public.study_sets (id) on delete cascade,
  front text not null,
  back text not null,
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  created_at timestamptz not null default now()
);

create index if not exists flashcards_study_set_id_idx on public.flashcards (study_set_id);

alter table public.flashcards enable row level security;

create policy "Users can view flashcards for own study sets"
  on public.flashcards for select
  using (
    exists (
      select 1 from public.study_sets s
      where s.id = flashcards.study_set_id and s.user_id = auth.uid()
    )
  );

create policy "Users can insert flashcards for own study sets"
  on public.flashcards for insert
  with check (
    exists (
      select 1 from public.study_sets s
      where s.id = flashcards.study_set_id and s.user_id = auth.uid()
    )
  );

create policy "Users can delete flashcards for own study sets"
  on public.flashcards for delete
  using (
    exists (
      select 1 from public.study_sets s
      where s.id = flashcards.study_set_id and s.user_id = auth.uid()
    )
  );

-- Quizzes
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  study_set_id uuid not null references public.study_sets (id) on delete cascade,
  title text,
  created_at timestamptz not null default now()
);

create index if not exists quizzes_study_set_id_idx on public.quizzes (study_set_id);

alter table public.quizzes enable row level security;

create policy "Users can view quizzes for own study sets"
  on public.quizzes for select
  using (
    exists (
      select 1 from public.study_sets s
      where s.id = quizzes.study_set_id and s.user_id = auth.uid()
    )
  );

create policy "Users can insert quizzes for own study sets"
  on public.quizzes for insert
  with check (
    exists (
      select 1 from public.study_sets s
      where s.id = quizzes.study_set_id and s.user_id = auth.uid()
    )
  );

-- Quiz questions
create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  question text not null,
  choices jsonb not null,
  correct_answer text not null,
  explanation text,
  created_at timestamptz not null default now()
);

create index if not exists quiz_questions_quiz_id_idx on public.quiz_questions (quiz_id);

alter table public.quiz_questions enable row level security;

create policy "Users can view quiz questions for own study sets"
  on public.quiz_questions for select
  using (
    exists (
      select 1 from public.quizzes q
      join public.study_sets s on s.id = q.study_set_id
      where q.id = quiz_questions.quiz_id and s.user_id = auth.uid()
    )
  );

create policy "Users can insert quiz questions for own study sets"
  on public.quiz_questions for insert
  with check (
    exists (
      select 1 from public.quizzes q
      join public.study_sets s on s.id = q.study_set_id
      where q.id = quiz_questions.quiz_id and s.user_id = auth.uid()
    )
  );

-- Chat messages
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  study_set_id uuid not null references public.study_sets (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_study_set_id_idx on public.chat_messages (study_set_id);

alter table public.chat_messages enable row level security;

create policy "Users can view own chat messages"
  on public.chat_messages for select
  using (auth.uid() = user_id);

create policy "Users can insert own chat messages"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

-- Storage bucket for study material uploads
insert into storage.buckets (id, name, public)
values ('study-materials', 'study-materials', false)
on conflict (id) do nothing;

create policy "Users can upload own study materials"
  on storage.objects for insert
  with check (
    bucket_id = 'study-materials'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read own study materials"
  on storage.objects for select
  using (
    bucket_id = 'study-materials'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own study materials"
  on storage.objects for delete
  using (
    bucket_id = 'study-materials'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
