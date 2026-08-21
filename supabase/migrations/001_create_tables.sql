-- Create tables for Top Montadores application

-- Services table (static reference data)
CREATE TABLE IF NOT EXISTS services (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cities table (static reference data)
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  slug TEXT NOT NULL,
  professional_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(city, state, slug)
);

-- Professionals table (montadores)
CREATE TABLE IF NOT EXISTS professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  photo_url TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  email TEXT,
  doc TEXT UNIQUE,
  notes TEXT,
  neighborhoods TEXT[] DEFAULT '{}',
  hours TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('ativo', 'pausado', 'pendente')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Professional services junction table
CREATE TABLE IF NOT EXISTS professional_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  service_slug TEXT NOT NULL REFERENCES services(slug) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(professional_id, service_slug)
);

-- Public links table
CREATE TABLE IF NOT EXISTS public_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_slug TEXT NOT NULL REFERENCES services(slug) ON DELETE CASCADE,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  city_slug TEXT NOT NULL,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  clicks INT DEFAULT 0,
  photo_override TEXT,
  whatsapp_override TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  user_id UUID,
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_professionals_city_state ON professionals(city, state);
CREATE INDEX IF NOT EXISTS idx_professionals_status ON professionals(status);
CREATE INDEX IF NOT EXISTS idx_professional_services_professional_id ON professional_services(professional_id);
CREATE INDEX IF NOT EXISTS idx_professional_services_service_slug ON professional_services(service_slug);
CREATE INDEX IF NOT EXISTS idx_public_links_professional_id ON public_links(professional_id);
CREATE INDEX IF NOT EXISTS idx_public_links_service_slug ON public_links(service_slug);
CREATE INDEX IF NOT EXISTS idx_public_links_city ON public_links(city, state);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cities_professional_id ON cities(professional_id);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for services (public read)
CREATE POLICY "Services are readable by everyone" ON services
  FOR SELECT USING (true);

-- RLS Policies for cities (public read)
CREATE POLICY "Cities are readable by everyone" ON cities
  FOR SELECT USING (true);

CREATE POLICY "Only admin can modify cities" ON cities
  FOR ALL USING (auth.uid() = '070251e6-bb99-4805-9bd9-2166b0193e63');

-- RLS Policies for professionals (public read, admin modify)
CREATE POLICY "Professionals are readable by everyone" ON professionals
  FOR SELECT USING (true);

CREATE POLICY "Only admin can modify professionals" ON professionals
  FOR ALL USING (auth.uid() = '070251e6-bb99-4805-9bd9-2166b0193e63');

-- RLS Policies for professional_services (public read, admin modify)
CREATE POLICY "Professional services are readable by everyone" ON professional_services
  FOR SELECT USING (true);

CREATE POLICY "Only admin can modify professional_services" ON professional_services
  FOR ALL USING (auth.uid() = '070251e6-bb99-4805-9bd9-2166b0193e63');

-- RLS Policies for public_links (public read, admin modify)
CREATE POLICY "Public links are readable by everyone" ON public_links
  FOR SELECT USING (true);

CREATE POLICY "Only admin can modify public_links" ON public_links
  FOR ALL USING (auth.uid() = '070251e6-bb99-4805-9bd9-2166b0193e63');

-- RLS Policies for audit_logs (admin only)
CREATE POLICY "Only admin can view audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = '070251e6-bb99-4805-9bd9-2166b0193e63');

CREATE POLICY "Only admin can create audit logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.uid() = '070251e6-bb99-4805-9bd9-2166b0193e63');

-- Grant permissions
GRANT ALL ON services TO authenticated;
GRANT ALL ON cities TO authenticated;
GRANT ALL ON professionals TO authenticated;
GRANT ALL ON professional_services TO authenticated;
GRANT ALL ON public_links TO authenticated;
GRANT ALL ON audit_logs TO authenticated;
