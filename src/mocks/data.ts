export type Service = {
  slug: string;
  name: string;
  icon: string;
  description?: string;
};

export type Professional = {
  id: string;
  name: string;
  whatsapp: string;
  photoUrl: string;
  city: string;
  state: string;
  services: string[];
  hours: string;
  status: "ativo" | "inativo" | "pendente";
  linksCount: number;
  email?: string;
  doc?: string;
  notes?: string;
  neighborhoods?: string[];
};

export type CityCoverage = {
  city: string;
  state: string;
  slug: string;
  professionalId: string | null;
};

export type PublicLink = {
  id: string;
  serviceSlug: string;
  serviceName: string;
  city: string;
  state: string;
  citySlug: string;
  professionalId: string;
  url: string;
  status: "ativo" | "inativo";
  clicks: number;
};

export type AuditEvent = {
  id: string;
  at: string;
  who: string;
  what: string;
  target: string;
};

export type ImportRow = {
  line: number;
  name: string;
  whatsapp: string;
  city: string;
  state: string;
  service: string;
  status: "ok" | "warning" | "error";
  message?: string;
};

export const services: Service[] = [
  { slug: "instalacao-tv", name: "Instalação de TV", icon: "Tv" },
  { slug: "montagem-moveis", name: "Montagem de Móveis", icon: "Hammer" },
  { slug: "guarda-roupa", name: "Guarda-roupa", icon: "DoorClosed" },
  { slug: "cozinha-planejada", name: "Cozinha Planejada", icon: "ChefHat" },
  { slug: "persianas-cortinas", name: "Persianas e Cortinas", icon: "Blinds" },
  { slug: "suportes-prateleiras", name: "Suportes e Prateleiras", icon: "LayoutGrid" },
  { slug: "berco-quarto-bebe", name: "Berço e Quarto de Bebê", icon: "Baby" },
  { slug: "moveis-escritorio", name: "Móveis de Escritório", icon: "Briefcase" },
  { slug: "ar-condicionado", name: "Ar-Condicionado", icon: "Wind" },
  { slug: "home-office", name: "Home Office", icon: "Monitor" },
  { slug: "moveis-comerciais", name: "Móveis Comerciais", icon: "Store" },
  { slug: "desmontagem", name: "Desmontagem", icon: "Wrench" },
];

export const professionals: Professional[] = [
  {
    id: "1",
    name: "Carlos Henrique Silva",
    whatsapp: "5547999990001",
    photoUrl: "https://i.pravatar.cc/240?img=12",
    city: "Balneário Camboriú",
    state: "SC",
    services: ["instalacao-tv", "montagem-moveis", "suportes-prateleiras"],
    hours: "Seg a Sáb, 8h às 19h",
    status: "ativo",
    linksCount: 14,
    email: "carlos@topmontadores.com.br",
    doc: "123.456.789-00",
    notes: "Profissional responsável pela região litoral norte de SC.",
    neighborhoods: ["Centro", "Pioneiros", "Nações", "Barra"],
  },
  {
    id: "2",
    name: "Rafael Oliveira",
    whatsapp: "5511988880002",
    photoUrl: "https://i.pravatar.cc/240?img=33",
    city: "São Paulo",
    state: "SP",
    services: ["montagem-moveis", "cozinha-planejada", "guarda-roupa"],
    hours: "Seg a Sex, 9h às 18h",
    status: "ativo",
    linksCount: 32,
    email: "rafael@topmontadores.com.br",
  },
  {
    id: "3",
    name: "Juliana Martins",
    whatsapp: "5521977770003",
    photoUrl: "https://i.pravatar.cc/240?img=47",
    city: "Rio de Janeiro",
    state: "RJ",
    services: ["persianas-cortinas", "moveis-escritorio"],
    hours: "Seg a Sex, 8h às 17h",
    status: "ativo",
    linksCount: 9,
  },
  {
    id: "4",
    name: "Eduardo Pereira",
    whatsapp: "5531966660004",
    photoUrl: "https://i.pravatar.cc/240?img=15",
    city: "Belo Horizonte",
    state: "MG",
    services: ["instalacao-tv", "ar-condicionado"],
    hours: "Seg a Sáb, 9h às 19h",
    status: "pendente",
    linksCount: 4,
  },
  {
    id: "5",
    name: "Patrícia Lima",
    whatsapp: "5541955550005",
    photoUrl: "https://i.pravatar.cc/240?img=48",
    city: "Curitiba",
    state: "PR",
    services: ["guarda-roupa", "berco-quarto-bebe"],
    hours: "Seg a Sex, 9h às 18h",
    status: "ativo",
    linksCount: 11,
  },
  {
    id: "6",
    name: "Marcos Antônio",
    whatsapp: "5551944440006",
    photoUrl: "https://i.pravatar.cc/240?img=53",
    city: "Porto Alegre",
    state: "RS",
    services: ["montagem-moveis", "desmontagem"],
    hours: "Seg a Sáb, 8h às 18h",
    status: "inativo",
    linksCount: 0,
  },
];

export const cities: CityCoverage[] = [
  { city: "Balneário Camboriú", state: "SC", slug: "balneario-camboriu-sc", professionalId: "1" },
  { city: "Itajaí", state: "SC", slug: "itajai-sc", professionalId: "1" },
  { city: "São Paulo", state: "SP", slug: "sao-paulo-sp", professionalId: "2" },
  { city: "Rio de Janeiro", state: "RJ", slug: "rio-de-janeiro-rj", professionalId: "3" },
  { city: "Belo Horizonte", state: "MG", slug: "belo-horizonte-mg", professionalId: "4" },
  { city: "Curitiba", state: "PR", slug: "curitiba-pr", professionalId: "5" },
  { city: "Porto Alegre", state: "RS", slug: "porto-alegre-rs", professionalId: null },
  { city: "Florianópolis", state: "SC", slug: "florianopolis-sc", professionalId: null },
];

export const publicLinks: PublicLink[] = [
  { id: "l1", serviceSlug: "instalacao-tv", serviceName: "Instalação de TV", city: "Balneário Camboriú", state: "SC", citySlug: "balneario-camboriu-sc", professionalId: "1", url: "/s/instalacao-tv/balneario-camboriu-sc", status: "ativo", clicks: 342 },
  { id: "l2", serviceSlug: "montagem-moveis", serviceName: "Montagem de Móveis", city: "Balneário Camboriú", state: "SC", citySlug: "balneario-camboriu-sc", professionalId: "1", url: "/s/montagem-moveis/balneario-camboriu-sc", status: "ativo", clicks: 198 },
  { id: "l3", serviceSlug: "montagem-moveis", serviceName: "Montagem de Móveis", city: "São Paulo", state: "SP", citySlug: "sao-paulo-sp", professionalId: "2", url: "/s/montagem-moveis/sao-paulo-sp", status: "ativo", clicks: 1245 },
  { id: "l4", serviceSlug: "cozinha-planejada", serviceName: "Cozinha Planejada", city: "São Paulo", state: "SP", citySlug: "sao-paulo-sp", professionalId: "2", url: "/s/cozinha-planejada/sao-paulo-sp", status: "ativo", clicks: 510 },
  { id: "l5", serviceSlug: "persianas-cortinas", serviceName: "Persianas e Cortinas", city: "Rio de Janeiro", state: "RJ", citySlug: "rio-de-janeiro-rj", professionalId: "3", url: "/s/persianas-cortinas/rio-de-janeiro-rj", status: "ativo", clicks: 233 },
];

export const auditLog: AuditEvent[] = [
  { id: "a1", at: "2026-06-18 09:42", who: "admin@top", what: "Atualizou WhatsApp", target: "Carlos H. Silva" },
  { id: "a2", at: "2026-06-18 09:10", who: "admin@top", what: "Substituiu profissional em 3 links", target: "Itajaí, SC" },
  { id: "a3", at: "2026-06-17 18:20", who: "admin@top", what: "Importou planilha (124 linhas)", target: "import-2026-06-17.xlsx" },
  { id: "a4", at: "2026-06-17 14:05", who: "admin@top", what: "Criou serviço", target: "Home Office" },
  { id: "a5", at: "2026-06-16 11:32", who: "admin@top", what: "Desativou montador", target: "Marcos Antônio" },
];

export const dashboardStats = {
  totalProfessionals: 184,
  citiesCovered: 312,
  activeLinks: 1428,
  whatsappClicks7d: 5821,
  importsThisMonth: 7,
  pending: 12,
};

export const clicksSeries = [
  { day: "Qui", clicks: 620 },
  { day: "Sex", clicks: 780 },
  { day: "Sáb", clicks: 910 },
  { day: "Dom", clicks: 540 },
  { day: "Seg", clicks: 880 },
  { day: "Ter", clicks: 1020 },
  { day: "Qua", clicks: 1071 },
];

export const stateBars = [
  { state: "SP", total: 540 },
  { state: "RJ", total: 312 },
  { state: "MG", total: 245 },
  { state: "SC", total: 198 },
  { state: "PR", total: 156 },
  { state: "RS", total: 142 },
];

export const importPreview: ImportRow[] = [
  { line: 2, name: "João da Silva", whatsapp: "5547999991111", city: "Itajaí", state: "SC", service: "Instalação de TV", status: "ok" },
  { line: 3, name: "Maria Souza", whatsapp: "5511988882222", city: "São Paulo", state: "SP", service: "Cozinha Planejada", status: "ok" },
  { line: 4, name: "Pedro Lima", whatsapp: "47-99988-3333", city: "Balneário Camboriú", state: "SC", service: "Montagem de Móveis", status: "warning", message: "WhatsApp sem código do país; será normalizado." },
  { line: 5, name: "", whatsapp: "5521977774444", city: "Rio de Janeiro", state: "RJ", service: "Persianas", status: "error", message: "Nome é obrigatório." },
  { line: 6, name: "Ana Costa", whatsapp: "abc", city: "Curitiba", state: "PR", service: "Guarda-roupa", status: "error", message: "WhatsApp inválido." },
  { line: 7, name: "Lucas Mendes", whatsapp: "5531966665555", city: "Belo Horizonte", state: "XX", service: "Instalação de TV", status: "error", message: "UF inválida." },
];

export function findProfessional(id: string) {
  return professionals.find((p) => p.id === id);
}

export function findServiceBySlug(slug: string) {
  return services.find((s) => s.slug === slug);
}

export function findCityBySlug(slug: string) {
  return cities.find((c) => c.slug === slug);
}

export function getProfessionalForServiceCity(serviceSlug: string, citySlug: string) {
  const city = findCityBySlug(citySlug);
  if (!city || !city.professionalId) return null;
  const pro = findProfessional(city.professionalId);
  if (!pro) return null;
  if (!pro.services.includes(serviceSlug)) return null;
  return pro;
}
