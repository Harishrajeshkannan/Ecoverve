-- Create ngo_details table if not exists
create table if not exists public.ngo_details (
    id uuid primary key references auth.users(id) on delete cascade,
    name text,
    description text,
    address text,
    email text,
    phone text, 
    website text,
    sector text,
    founded_year integer,
    registration_number text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.ngo_details enable row level security;

-- Drop existing policies if any
drop policy if exists "Users can view all ngo details" on public.ngo_details;
drop policy if exists "NGOs can view own details" on public.ngo_details;
drop policy if exists "NGOs can insert own details" on public.ngo_details;
drop policy if exists "NGOs can update own details" on public.ngo_details;

-- Create new policies

-- Allow anyone to view NGO details (for public display)
create policy "Anyone can view ngo details"
    on public.ngo_details for select
    using (true);

-- Allow NGOs to insert their own details
create policy "NGOs can insert own details"
    on public.ngo_details for insert
    to authenticated
    with check (auth.uid() = id);

-- Allow NGOs to update their own details
create policy "NGOs can update own details" 
    on public.ngo_details for update
    to authenticated
    using (auth.uid() = id)
    with check (auth.uid() = id);

-- Allow NGOs to delete their own details
create policy "NGOs can delete own details"
    on public.ngo_details for delete
    to authenticated
    using (auth.uid() = id);

-- Create indexes
create index if not exists ngo_details_name_idx on public.ngo_details(name);
create index if not exists ngo_details_sector_idx on public.ngo_details(sector);

-- Update trigger for updated_at
drop trigger if exists update_ngo_details_updated_at on public.ngo_details;
create trigger update_ngo_details_updated_at
    before update on public.ngo_details
    for each row
    execute function update_updated_at_column();