-- Insert initial data

-- Insert services
INSERT INTO services (slug, name, icon, description) VALUES
  ('instalacao-tv', 'Instalação de TV', 'Tv', 'Instalação de televisores e home theater'),
  ('montagem-moveis', 'Montagem de Móveis', 'Hammer', 'Montagem de móveis em geral'),
  ('guarda-roupa', 'Guarda-roupa', 'DoorClosed', 'Instalação e montagem de guarda-roupas'),
  ('cozinha-planejada', 'Cozinha Planejada', 'ChefHat', 'Montagem de cozinhas planejadas'),
  ('persianas-cortinas', 'Persianas e Cortinas', 'Blinds', 'Instalação de persianas e cortinas'),
  ('suportes-prateleiras', 'Suportes e Prateleiras', 'LayoutGrid', 'Instalação de suportes e prateleiras'),
  ('berco-quarto-bebe', 'Berço e Quarto de Bebê', 'Baby', 'Montagem de móveis para quarto de bebê'),
  ('moveis-escritorio', 'Móveis de Escritório', 'Briefcase', 'Montagem de móveis de escritório'),
  ('ar-condicionado', 'Ar-Condicionado', 'Wind', 'Instalação de ar-condicionado'),
  ('home-office', 'Home Office', 'Monitor', 'Montagem de móveis para home office'),
  ('moveis-comerciais', 'Móveis Comerciais', 'Store', 'Montagem de móveis comerciais'),
  ('desmontagem', 'Desmontagem', 'Wrench', 'Serviço de desmontagem de móveis')
ON CONFLICT (slug) DO NOTHING;
