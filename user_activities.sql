-- Create user_activities table if not exists
create table if not exists public.user_activities (
    id uuid default extensions.uuid_generate_v4() primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    activity_id uuid not null references public.ngo_activities(id) on delete cascade,
    participated boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, activity_id)
);

-- Enable RLS
alter table public.user_activities enable row level security;

-- Drop existing policies if any
drop policy if exists "Users can view their own activities" on public.user_activities;
drop policy if exists "Users can insert their own activities" on public.user_activities;
drop policy if exists "Users can update their own activities" on public.user_activities;
drop policy if exists "Users can delete their own activities" on public.user_activities;

-- Create new policies
create policy "Users can view their own activities"
    on public.user_activities for select
    using (auth.uid() = user_id);

create policy "Users can insert their own activities"
    on public.user_activities for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own activities"
    on public.user_activities for update
    using (auth.uid() = user_id);

create policy "Users can delete their own activities"
    on public.user_activities for delete
    using (auth.uid() = user_id);

-- Create indexes for performance
create index if not exists user_activities_user_id_idx on public.user_activities(user_id);
create index if not exists user_activities_activity_id_idx on public.user_activities(activity_id);
create index if not exists user_activities_user_activity_idx on public.user_activities(user_id, activity_id);
