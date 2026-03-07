-- Create or update ngo_activities table with image column for success stories

-- First, create the table if it doesn't exist
create table if not exists public.ngo_activities (
    id uuid default extensions.uuid_generate_v4() primary key,
    ngo_id uuid not null references auth.users(id) on delete cascade,
    title text not null,
    description text,
    location text not null,
    activity_date date,
    start_time time,
    end_time time,
    volunteer_capacity integer,
    volunteer_count integer default 0,
    status text default 'upcoming' check (status in ('upcoming', 'ongoing', 'completed', 'cancelled')),
    budget_estimate numeric(10,2),
    funds_received numeric(10,2) default 0,
    pollution_score integer,
    latitude decimal(10,8),
    longitude decimal(11,8),
    aqi integer,
    saplings_planted integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add image column if it doesn't exist (for NGOs to upload completion images)
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'ngo_activities' and column_name = 'image') then
        alter table public.ngo_activities add column image text;
    end if;
end $$;

-- Enable RLS
alter table public.ngo_activities enable row level security;

-- Drop existing policies if any
drop policy if exists "NGOs can view all activities" on public.ngo_activities;
drop policy if exists "NGOs can view own activities" on public.ngo_activities;
drop policy if exists "NGOs can insert own activities" on public.ngo_activities;
drop policy if exists "NGOs can update own activities" on public.ngo_activities;
drop policy if exists "NGOs can delete own activities" on public.ngo_activities;
drop policy if exists "Users can view completed activities" on public.ngo_activities;

-- Create new policies

-- Allow anyone to view completed activities (for success stories)
create policy "Anyone can view completed activities"
    on public.ngo_activities for select
    using (status = 'completed');

-- Allow NGOs to view all activities (for browsing/volunteering)
create policy "Anyone can view upcoming activities"
    on public.ngo_activities for select
    using (status in ('upcoming', 'ongoing'));

-- Allow NGOs to insert their own activities
create policy "NGOs can insert own activities"
    on public.ngo_activities for insert
    to authenticated
    with check (auth.uid() = ngo_id);

-- Allow NGOs to update their own activities
create policy "NGOs can update own activities"
    on public.ngo_activities for update
    to authenticated
    using (auth.uid() = ngo_id)
    with check (auth.uid() = ngo_id);

-- Allow NGOs to delete their own activities
create policy "NGOs can delete own activities"
    on public.ngo_activities for delete
    to authenticated
    using (auth.uid() = ngo_id);

-- Create indexes for performance
create index if not exists ngo_activities_ngo_id_idx on public.ngo_activities(ngo_id);
create index if not exists ngo_activities_status_idx on public.ngo_activities(status);
create index if not exists ngo_activities_activity_date_idx on public.ngo_activities(activity_date desc);
create index if not exists ngo_activities_location_idx on public.ngo_activities(location);
create index if not exists ngo_activities_completed_date_idx on public.ngo_activities(activity_date desc) where status = 'completed';

-- Update trigger for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;   
end;
$$ language plpgsql;

drop trigger if exists update_ngo_activities_updated_at on public.ngo_activities;
create trigger update_ngo_activities_updated_at
    before update on public.ngo_activities
    for each row
    execute function update_updated_at_column();