-- プロジェクトテーブルの作成
create table
  public.projects (
    id uuid not null default gen_random_uuid (),
    title text not null,
    category text not null,
    price numeric not null,
    hours numeric not null,
    delivery_date date null,
    status text not null,
    created_at timestamp with time zone not null default now(),
    constraint projects_pkey primary key (id)
  ) tablespace pg_default;

-- 全てのユーザーに読み書きを許可する簡易的なポリシー（開発用）
-- 本番環境ではRow Level Security (RLS)を有効にし、適切な認証ポリシーを設定してください
alter table public.projects enable row level security;

drop policy if exists "Enable all access for anonymous users" on public.projects;
create policy "Enable all access for anonymous users"
  on public.projects
  for all
  using (true)
  with check (true);
