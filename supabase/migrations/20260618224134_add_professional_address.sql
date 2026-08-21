ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS street TEXT,
  ADD COLUMN IF NOT EXISTS address_number TEXT,
  ADD COLUMN IF NOT EXISTS address_complement TEXT,
  ADD COLUMN IF NOT EXISTS neighborhood TEXT;

COMMENT ON COLUMN public.professionals.postal_code IS 'CEP com oito dígitos';
COMMENT ON COLUMN public.professionals.street IS 'Logradouro retornado pelo serviço de CEP ou informado manualmente';
COMMENT ON COLUMN public.professionals.address_number IS 'Número do imóvel informado pelo usuário';
COMMENT ON COLUMN public.professionals.address_complement IS 'Complemento, prédio, bloco ou apartamento informado pelo usuário';
COMMENT ON COLUMN public.professionals.neighborhood IS 'Bairro retornado pelo serviço de CEP ou informado manualmente';
