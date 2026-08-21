export type BrazilState = {
  uf: string;
  name: string;
};

export type BrazilCity = {
  ibgeCode: string;
  name: string;
  state: string;
  slug: string;
};

type IbgeCity = {
  id: number;
  nome: string;
};

export const BRAZIL_STATES: BrazilState[] = [
  { uf: "AC", name: "Acre" },
  { uf: "AL", name: "Alagoas" },
  { uf: "AP", name: "Amapá" },
  { uf: "AM", name: "Amazonas" },
  { uf: "BA", name: "Bahia" },
  { uf: "CE", name: "Ceará" },
  { uf: "DF", name: "Distrito Federal" },
  { uf: "ES", name: "Espírito Santo" },
  { uf: "GO", name: "Goiás" },
  { uf: "MA", name: "Maranhão" },
  { uf: "MT", name: "Mato Grosso" },
  { uf: "MS", name: "Mato Grosso do Sul" },
  { uf: "MG", name: "Minas Gerais" },
  { uf: "PA", name: "Pará" },
  { uf: "PB", name: "Paraíba" },
  { uf: "PR", name: "Paraná" },
  { uf: "PE", name: "Pernambuco" },
  { uf: "PI", name: "Piauí" },
  { uf: "RJ", name: "Rio de Janeiro" },
  { uf: "RN", name: "Rio Grande do Norte" },
  { uf: "RS", name: "Rio Grande do Sul" },
  { uf: "RO", name: "Rondônia" },
  { uf: "RR", name: "Roraima" },
  { uf: "SC", name: "Santa Catarina" },
  { uf: "SP", name: "São Paulo" },
  { uf: "SE", name: "Sergipe" },
  { uf: "TO", name: "Tocantins" },
];

const collator = new Intl.Collator("pt-BR");

export async function getCitiesByState(uf: string): Promise<BrazilCity[]> {
  const state = BRAZIL_STATES.find((item) => item.uf === uf);
  if (!state) throw new Error("Estado inválido.");

  const response = await fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state.uf}/municipios?orderBy=nome`,
  );
  if (!response.ok) throw new Error("Não foi possível carregar as cidades.");

  const data = (await response.json()) as IbgeCity[];
  return data
    .map((city) => ({
      ibgeCode: String(city.id),
      name: city.nome,
      state: state.uf,
      slug: slugifyLocality(`${city.nome}-${state.uf}`),
    }))
    .sort((a, b) => collator.compare(a.name, b.name));
}

function slugifyLocality(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
