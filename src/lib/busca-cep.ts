export type BuscaCepResult = {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  complement: string;
};

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

export async function buscaCep(value: string): Promise<BuscaCepResult> {
  const cep = value.replace(/\D/g, "");
  if (!/^\d{8}$/.test(cep)) throw new Error("CEP deve conter 8 dígitos.");

  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  if (!response.ok) throw new Error("Não foi possível consultar o CEP.");

  const data = await response.json() as ViaCepResponse;
  if (data.erro) throw new Error("CEP não encontrado.");

  return {
    cep,
    street: data.logradouro || "",
    neighborhood: data.bairro || "",
    city: data.localidade || "",
    state: data.uf || "",
    complement: data.complemento || "",
  };
}
