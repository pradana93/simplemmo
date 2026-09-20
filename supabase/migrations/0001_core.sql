-- SimpleMMO core schema. Idempotent: safe to run repeatedly.
-- Run with: supabase db push

-- Enums
DO $$ BEGIN CREATE TYPE item_rarity AS ENUM ('common','uncommon','rare','epic','legendary'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE listing_currency AS ENUM ('gold','shard'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE listing_type AS ENUM ('buyout','auction'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- players
CREATE TABLE IF NOT EXISTS public.players (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  level int NOT NULL DEFAULT 1 CHECK (level >= 1),
  xp bigint NOT NULL DEFAULT 0 CHECK (xp >= 0),
  gold_pocket bigint NOT NULL DEFAULT 100 CHECK (gold_pocket >= 0),
  gold_bank bigint NOT NULL DEFAULT 0 CHECK (gold_bank >= 0),
  shard_balance bigint NOT NULL DEFAULT 0 CHECK (shard_balance >= 0),
  notoriety int NOT NULL DEFAULT 0,
  reputation int NOT NULL DEFAULT 0,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  idle_earned_today bigint NOT NULL DEFAULT 0,
  idle_day date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- skills
CREATE TABLE IF NOT EXISTS public.skills (
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  skill_type text NOT NULL,
  level int NOT NULL DEFAULT 1 CHECK (level >= 1),
  xp bigint NOT NULL DEFAULT 0 CHECK (xp >= 0),
  active_zone text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (player_id, skill_type)
);

-- items (public reference data, read-only for clients)
CREATE TABLE IF NOT EXISTS public.items (
  id text PRIMARY KEY,
  name text NOT NULL,
  rarity item_rarity NOT NULL DEFAULT 'common',
  stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  craftable boolean NOT NULL DEFAULT false,
  base_value bigint NOT NULL DEFAULT 0,
  recipe jsonb
);

-- inventory
CREATE TABLE IF NOT EXISTS public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  item_id text NOT NULL REFERENCES public.items(id),
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  equipped boolean NOT NULL DEFAULT false,
  UNIQUE (player_id, item_id, equipped)
);

-- market_listings
CREATE TABLE IF NOT EXISTS public.market_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  item_id text NOT NULL REFERENCES public.items(id),
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price bigint NOT NULL CHECK (price > 0),
  currency listing_currency NOT NULL DEFAULT 'gold',
  listing_type listing_type NOT NULL DEFAULT 'buyout',
  premium boolean NOT NULL DEFAULT false,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '3 days'),
  sold boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- market_bids
CREATE TABLE IF NOT EXISTS public.market_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.market_listings(id) ON DELETE CASCADE,
  bidder_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  amount bigint NOT NULL CHECK (amount > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- pvp_logs
CREATE TABLE IF NOT EXISTS public.pvp_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attacker_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  defender_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  result text NOT NULL,
  gold_stolen bigint NOT NULL DEFAULT 0,
  item_dropped text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- guilds
CREATE TABLE IF NOT EXISTS public.guilds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  leader_id uuid NOT NULL REFERENCES public.players(id),
  treasury_gold bigint NOT NULL DEFAULT 0,
  treasury_shard bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- guild_members
CREATE TABLE IF NOT EXISTS public.guild_members (
  guild_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (guild_id, player_id)
);

-- territories
CREATE TABLE IF NOT EXISTS public.territories (
  id text PRIMARY KEY,
  name text NOT NULL,
  resource_type text NOT NULL,
  controlling_guild_id uuid REFERENCES public.guilds(id),
  capture_cooldown_until timestamptz
);

-- quests
CREATE TABLE IF NOT EXISTS public.quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  quest_type text NOT NULL,
  progress int NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  expires_at timestamptz
);

-- jobs
CREATE TABLE IF NOT EXISTS public.jobs (
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  job_type text NOT NULL,
  level int NOT NULL DEFAULT 1,
  xp bigint NOT NULL DEFAULT 0,
  last_collected_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (player_id, job_type)
);

-- cheat audit (service-role only, no client policies)
CREATE TABLE IF NOT EXISTS public.cheat_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid,
  kind text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seed reference items + territories (idempotent)
INSERT INTO public.items (id, name, rarity, base_value, craftable) VALUES
  ('iron-sword','Iron Sword','common',150,false),
  ('mithril-pick','Mithril Pickaxe','rare',2400,false),
  ('shadow-dagger','Shadow Dagger','legendary',5000,true),
  ('dragonplate','Dragonplate','legendary',9000,true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.territories (id, name, resource_type) VALUES
  ('ember-mine','Ember Mine','ore'),
  ('whisper-docks','Whisper Docks','fish'),
  ('thornwood','Thornwood','logs')
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pvp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cheat_attempts ENABLE ROW LEVEL SECURITY;

-- Policies (drop-if-exists then create for idempotency)
DROP POLICY IF EXISTS "own player row select" ON public.players;
CREATE POLICY "own player row select" ON public.players FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "own player row update" ON public.players;
CREATE POLICY "own player row update" ON public.players FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "own player insert" ON public.players;
CREATE POLICY "own player insert" ON public.players FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "own skills all" ON public.skills;
CREATE POLICY "own skills all" ON public.skills FOR ALL USING (auth.uid() = player_id) WITH CHECK (auth.uid() = player_id);

DROP POLICY IF EXISTS "items readable" ON public.items;
CREATE POLICY "items readable" ON public.items FOR SELECT USING (true);

DROP POLICY IF EXISTS "own inventory all" ON public.inventory;
CREATE POLICY "own inventory all" ON public.inventory FOR ALL USING (auth.uid() = player_id) WITH CHECK (auth.uid() = player_id);

DROP POLICY IF EXISTS "listings readable" ON public.market_listings;
CREATE POLICY "listings readable" ON public.market_listings FOR SELECT USING (true);
DROP POLICY IF EXISTS "seller manages listings" ON public.market_listings;
CREATE POLICY "seller manages listings" ON public.market_listings FOR ALL USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "bids readable" ON public.market_bids;
CREATE POLICY "bids readable" ON public.market_bids FOR SELECT USING (true);
DROP POLICY IF EXISTS "bidder inserts" ON public.market_bids;
CREATE POLICY "bidder inserts" ON public.market_bids FOR INSERT WITH CHECK (auth.uid() = bidder_id);

DROP POLICY IF EXISTS "pvp involved read" ON public.pvp_logs;
CREATE POLICY "pvp involved read" ON public.pvp_logs FOR SELECT USING (auth.uid() = attacker_id OR auth.uid() = defender_id);

DROP POLICY IF EXISTS "guilds readable" ON public.guilds;
CREATE POLICY "guilds readable" ON public.guilds FOR SELECT USING (true);
DROP POLICY IF EXISTS "leader manages guild" ON public.guilds;
CREATE POLICY "leader manages guild" ON public.guilds FOR ALL USING (auth.uid() = leader_id) WITH CHECK (auth.uid() = leader_id);

DROP POLICY IF EXISTS "members readable" ON public.guild_members;
CREATE POLICY "members readable" ON public.guild_members FOR SELECT USING (true);
DROP POLICY IF EXISTS "member self join" ON public.guild_members;
CREATE POLICY "member self join" ON public.guild_members FOR INSERT WITH CHECK (auth.uid() = player_id);

DROP POLICY IF EXISTS "territories readable" ON public.territories;
CREATE POLICY "territories readable" ON public.territories FOR SELECT USING (true);

DROP POLICY IF EXISTS "own quests all" ON public.quests;
CREATE POLICY "own quests all" ON public.quests FOR ALL USING (auth.uid() = player_id) WITH CHECK (auth.uid() = player_id);

DROP POLICY IF EXISTS "own jobs all" ON public.jobs;
CREATE POLICY "own jobs all" ON public.jobs FOR ALL USING (auth.uid() = player_id) WITH CHECK (auth.uid() = player_id);

-- cheat_attempts: NO client policies (service-role only). Ensure none exist.
DO $$ DECLARE r record; BEGIN FOR r IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='cheat_attempts' LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.cheat_attempts', r.policyname); END LOOP; END $$;
