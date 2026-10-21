-- ============================================================
-- BookBridge Platform - Supabase PostgreSQL Schema
-- ============================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    password_hash TEXT,
    is_edu_verified BOOLEAN DEFAULT FALSE,
    institution TEXT DEFAULT 'Campus Community',
    location TEXT DEFAULT 'Main Campus',
    academic_interests TEXT[] DEFAULT '{}',
    avatar_url TEXT,
    bio TEXT,
    trust_score NUMERIC(3,1) DEFAULT 5.0,
    total_exchanges INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Resources Table
CREATE TABLE IF NOT EXISTS public.resources (
    id TEXT PRIMARY KEY,
    provider_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    provider_name TEXT,
    provider_trust_score NUMERIC(3,1) DEFAULT 5.0,
    provider_institution TEXT,
    is_edu_verified BOOLEAN DEFAULT FALSE,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT,
    subject TEXT DEFAULT 'General',
    format TEXT DEFAULT 'textbook',
    condition TEXT DEFAULT 'good',
    listing_type TEXT DEFAULT 'lend',
    status TEXT DEFAULT 'available',
    description TEXT,
    cover_image_url TEXT,
    pickup_location TEXT DEFAULT 'Campus Library',
    max_borrow_days INTEGER DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Requests Table
CREATE TABLE IF NOT EXISTS public.requests (
    id TEXT PRIMARY KEY,
    resource_id TEXT REFERENCES public.resources(id) ON DELETE CASCADE,
    resource_title TEXT,
    resource_author TEXT,
    resource_cover TEXT,
    provider_id TEXT,
    provider_name TEXT,
    borrower_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    borrower_name TEXT,
    borrower_trust_score NUMERIC(3,1) DEFAULT 5.0,
    borrower_institution TEXT,
    status TEXT DEFAULT 'pending',
    request_type TEXT DEFAULT 'lend',
    needed_duration_days INTEGER DEFAULT 14,
    purpose_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Schedules Table
CREATE TABLE IF NOT EXISTS public.schedules (
    id TEXT PRIMARY KEY,
    request_id TEXT REFERENCES public.requests(id) ON DELETE CASCADE,
    resource_id TEXT,
    resource_title TEXT,
    provider_id TEXT,
    provider_name TEXT,
    borrower_id TEXT,
    borrower_name TEXT,
    meetup_time TIMESTAMPTZ NOT NULL,
    meetup_location TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'proposed',
    confirmed_by_provider BOOLEAN DEFAULT FALSE,
    confirmed_by_borrower BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Lending History Table
CREATE TABLE IF NOT EXISTS public.lending_history (
    id TEXT PRIMARY KEY,
    request_id TEXT,
    resource_id TEXT,
    resource_title TEXT,
    resource_author TEXT,
    provider_id TEXT,
    provider_name TEXT,
    borrower_id TEXT,
    borrower_name TEXT,
    action_type TEXT DEFAULT 'borrowed_and_returned',
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    rating_for_borrower INTEGER,
    review_for_borrower TEXT,
    rating_for_provider INTEGER,
    review_for_provider TEXT
);

-- Enable Row Level Security (RLS) & Allow Public Read/Write for Anon
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lending_history ENABLE ROW LEVEL SECURITY;

-- Permissive policies for development
CREATE POLICY "Allow all on users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on resources" ON public.resources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on requests" ON public.requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on schedules" ON public.schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on lending_history" ON public.lending_history FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- Initial Seed Data
-- ============================================================

INSERT INTO public.users (id, email, full_name, password_hash, is_edu_verified, institution, location, academic_interests, avatar_url, bio, trust_score, total_exchanges)
VALUES 
(
    'user_alice_001',
    'alice@campus.edu',
    'Alice Johnson',
    '$2b$12$K1H1aV.O7QvTzE3e6h0/z.l8JqE6h0/z.l8JqE6h0/z.l8JqE6h0/',
    TRUE,
    'Stanford University',
    'Engineering Quad',
    ARRAY['Computer Science', 'AI', 'Algorithms'],
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'CS senior passionate about peer study groups and resource sharing.',
    4.9,
    14
),
(
    'user_bob_002',
    'bob@campus.edu',
    'Bob Martinez',
    '$2b$12$K1H1aV.O7QvTzE3e6h0/z.l8JqE6h0/z.l8JqE6h0/z.l8JqE6h0/',
    TRUE,
    'Stanford University',
    'Science & Medicine Library',
    ARRAY['Physics', 'Mathematics', 'Chemistry'],
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'Graduate researcher in applied physics. Happy to lend textbooks to undergrads!',
    4.8,
    9
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.resources (id, provider_id, provider_name, provider_trust_score, provider_institution, is_edu_verified, title, author, isbn, subject, format, condition, listing_type, status, description, cover_image_url, pickup_location, max_borrow_days)
VALUES 
(
    'res_clrs_01',
    'user_alice_001',
    'Alice Johnson',
    4.9,
    'Stanford University',
    TRUE,
    'Introduction to Algorithms (4th Edition)',
    'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
    '9780262046305',
    'Computer Science',
    'hardcover',
    'like_new',
    'lend',
    'available',
    'Comprehensive reference covering data structures, dynamic programming, and graph algorithms. Clean pages, no highlighting.',
    'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=400',
    'Engineering Library - Floor 2',
    30
),
(
    'res_cleancode_02',
    'user_alice_001',
    'Alice Johnson',
    4.9,
    'Stanford University',
    TRUE,
    'Clean Code: A Handbook of Agile Software Craftsmanship',
    'Robert C. Martin',
    '9780132350884',
    'Computer Science',
    'paperback',
    'good',
    'lend',
    'available',
    'Must-read for software engineering best practices, refactoring, and code hygiene.',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
    'Tressider Student Union',
    21
),
(
    'res_calculus_03',
    'user_bob_002',
    'Bob Martinez',
    4.8,
    'Stanford University',
    TRUE,
    'Calculus: Early Transcendentals (8th Edition)',
    'James Stewart',
    '9781285741550',
    'Mathematics',
    'hardcover',
    'good',
    'donate',
    'available',
    'Standard textbook for Math 1A/1B & Multivariable Calculus. Giving away to any student who needs it for the upcoming quarter!',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
    'Math Building Courtyard',
    60
),
(
    'res_biology_04',
    'user_bob_002',
    'Bob Martinez',
    4.8,
    'Stanford University',
    TRUE,
    'Campbell Biology (12th Edition)',
    'Lisa A. Urry, Michael L. Cain, Steven A. Wasserman',
    '9780135188743',
    'Biology',
    'hardcover',
    'like_new',
    'lend',
    'available',
    'Full-color illustrations and study guides for general biology and pre-med courses.',
    'https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?w=400',
    'Biology Sciences Courtyard',
    45
),
(
    'res_physics_05',
    'user_bob_002',
    'Bob Martinez',
    4.8,
    'Stanford University',
    TRUE,
    'University Physics with Modern Physics',
    'Hugh D. Young, Roger A. Freedman',
    '9780135159552',
    'Physics',
    'hardcover',
    'fair',
    'lend',
    'available',
    'Calculus-based physics textbook with problem sets. Minor wear on spine, interior intact.',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
    'Physics Hall Lobby',
    30
),
(
    'res_microecon_06',
    'user_alice_001',
    'Alice Johnson',
    4.9,
    'Stanford University',
    TRUE,
    'Principles of Microeconomics',
    'N. Gregory Mankiw',
    '9781305971493',
    'Economics',
    'paperback',
    'new',
    'donate',
    'available',
    'Clear presentation of supply and demand, markets, and policy analysis. Extra copy received as gift.',
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400',
    'Green Library Cafe',
    90
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.lending_history (id, resource_id, resource_title, resource_author, provider_id, provider_name, borrower_id, borrower_name, action_type, rating_for_borrower, review_for_borrower, rating_for_provider, review_for_provider)
VALUES (
    'hist_sample_01',
    'res_cleancode_02',
    'Clean Code: A Handbook of Agile Software Craftsmanship',
    'Robert C. Martin',
    'user_alice_001',
    'Alice Johnson',
    'user_bob_002',
    'Bob Martinez',
    'borrowed_and_returned',
    5,
    'Bob returned the book ahead of time in mint condition. Great communicator!',
    5,
    'Alice was very prompt and kind when handing over the textbook.'
)
ON CONFLICT (id) DO NOTHING;

