-- Extend flashcards for cloze deletion and typed cards
alter table public.flashcards
  add column if not exists card_type text not null default 'basic'
    check (card_type in ('basic', 'cloze', 'definition', 'compare_contrast', 'application')),
  add column if not exists cloze_text text,
  add column if not exists answer text,
  add column if not exists explanation text,
  add column if not exists tags text[],
  add column if not exists source_quote text;

create index if not exists flashcards_card_type_idx on public.flashcards (card_type);
