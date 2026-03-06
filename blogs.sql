-- Create blogs table if not exists
create table if not exists public.blogs (
    id uuid default extensions.uuid_generate_v4() primary key,
    author_id uuid not null references auth.users(id) on delete cascade,
    title text not null,
    summary text,
    content text not null,
    category text,
    cover_image text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index if not exists blogs_author_id_idx on public.blogs(author_id);
create index if not exists blogs_created_at_idx on public.blogs(created_at desc);
create index if not exists blogs_category_idx on public.blogs(category);

-- Enable Row Level Security (RLS)
alter table public.blogs enable row level security;

-- RLS Policies for blogs table

-- Allow anyone to read published blogs
create policy "Anyone can read blogs"
    on public.blogs for select
    using (true);

-- Allow authenticated users to insert their own blogs
create policy "Authenticated users can create blogs"
    on public.blogs for insert
    to authenticated
    with check (auth.uid() = author_id);

-- Allow users to update their own blogs
create policy "Users can update their own blogs"
    on public.blogs for update
    to authenticated
    using (auth.uid() = author_id)
    with check (auth.uid() = author_id);

-- Allow users to delete their own blogs
create policy "Users can delete their own blogs"
    on public.blogs for delete
    to authenticated
    using (auth.uid() = author_id);

-- Create a function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
drop trigger if exists set_updated_at on public.blogs;
create trigger set_updated_at
    before update on public.blogs
    for each row
    execute function public.handle_updated_at();
