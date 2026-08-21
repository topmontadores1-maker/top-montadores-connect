import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { LegalPage, type LegalSection } from "@/components/site/LegalPage";
import { SanityLegalPage, type SanityLegalPageData } from "@/components/sanity/SanityLegalPage";
import { TERMS_OF_USE_PAGE_QUERY } from "@/lib/sanity-queries";

const sections: LegalSection[] = [
  {
    title: "Aceitação dos termos",
    body: [
      "Ao acessar ou usar a Top Montadores, você concorda com estes Termos de Uso e com as políticas relacionadas publicadas no site. Caso não concorde, não utilize a plataforma.",
      "A Top Montadores funciona como diretório e canal de descoberta entre clientes e profissionais. A contratação, escopo, preço, prazo, garantia e execução do serviço devem ser combinados diretamente entre cliente e montador.",
    ],
  },
  {
    title: "Uso da plataforma",
    body: [
      "Você se compromete a usar o site de forma lícita, respeitosa e compatível com sua finalidade. É proibido tentar acessar áreas restritas sem autorização, interferir na segurança, copiar bases de dados, enviar informações falsas ou usar a plataforma para fraude, spam ou assédio.",
      "Podemos alterar, suspender ou remover funcionalidades a qualquer momento para manutenção, melhoria, segurança ou adequação legal.",
    ],
  },
  {
    title: "Cadastro de profissionais",
    body: [
      "Profissionais que solicitam cadastro devem fornecer informações verdadeiras, atualizadas e compatíveis com os serviços oferecidos. A Top Montadores pode solicitar ajustes, ocultar, reprovar, pausar ou remover cadastros que violem estes termos ou prejudiquem a confiança da plataforma.",
      "O profissional é responsável pela qualidade do atendimento, pelo cumprimento de leis aplicáveis, pela veracidade de suas informações, por combinar valores com o cliente e por cumprir obrigações fiscais, trabalhistas ou regulatórias relacionadas à sua atividade.",
    ],
  },
  {
    title: "Contato entre clientes e montadores",
    body: [
      "Quando o cliente clica em um botão de WhatsApp, a conversa passa a acontecer fora da Top Montadores. O cliente deve avaliar orçamento, disponibilidade, condições, identidade do profissional e demais detalhes antes de contratar.",
      "A Top Montadores pode registrar cliques e buscas para melhorar o diretório, medir demanda e priorizar regiões ou serviços com maior interesse.",
    ],
  },
  {
    title: "Pagamentos, orçamentos e execução",
    body: [
      "Salvo quando informado expressamente em outro contrato ou fluxo específico, a Top Montadores não recebe pagamentos pelo serviço contratado entre cliente e montador, não define preço final e não executa montagem, desmontagem ou instalação.",
      "Qualquer pagamento, sinal, reembolso, visita técnica, garantia ou remarcação deve ser tratado diretamente entre as partes envolvidas.",
    ],
  },
  {
    title: "Conteúdo e propriedade intelectual",
    body: [
      "Textos, marcas, layouts, imagens, códigos, bancos de dados e demais elementos da Top Montadores pertencem à plataforma ou a seus licenciantes. O uso do site não concede licença para copiar, revender, explorar comercialmente ou reproduzir esses materiais sem autorização.",
      "Ao enviar informações, fotos ou materiais para cadastro, o profissional declara ter direito de uso e autoriza a Top Montadores a exibi-los na plataforma para divulgação de seu perfil e serviços.",
    ],
  },
  {
    title: "Responsabilidades e limitações",
    body: [
      "Trabalhamos para manter informações úteis e atualizadas, mas não garantimos disponibilidade contínua, ausência de erros, contratação efetiva, resultado específico ou disponibilidade de profissionais em todas as cidades e serviços pesquisados.",
      "Na extensão permitida pela lei, a Top Montadores não se responsabiliza por danos decorrentes de negociações diretas, execução do serviço, pagamentos externos, informações fornecidas por terceiros ou uso inadequado da plataforma.",
    ],
  },
  {
    title: "Alterações e encerramento",
    body: [
      "Podemos atualizar estes termos periodicamente. A continuidade de uso após a publicação da nova versão indica aceitação das alterações.",
      "Também poderemos restringir acesso, remover conteúdo ou encerrar cadastros quando houver violação destes termos, suspeita de fraude, risco à segurança, ordem legal ou prejuízo à experiência de usuários.",
    ],
  },
  {
    title: "Lei aplicável",
    body: [
      "Estes termos são regidos pelas leis brasileiras. Eventuais disputas deverão ser resolvidas conforme a legislação aplicável e os canais competentes no Brasil.",
    ],
  },
];

const getTermsOfUsePage = createServerFn({ method: "GET" }).handler(async () => {
  const { getSanityServerClient } = await import("@/lib/sanity.server");

  return getSanityServerClient().fetch<SanityLegalPageData | null>(TERMS_OF_USE_PAGE_QUERY);
});

export const Route = createFileRoute("/termos-de-uso")({
  loader: async () => {
    try {
      return await getTermsOfUsePage();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn("Failed to load termos-de-uso from Sanity", message);
      return null;
    }
  },
  head: () => ({
    meta: [
      { title: "Termos de Uso — Top Montadores" },
      {
        name: "description",
        content: "Condições de uso da plataforma Top Montadores para clientes e profissionais.",
      },
    ],
  }),
  component: TermsOfUse,
});

function TermsOfUse() {
  const sanityPage = Route.useLoaderData();

  if (sanityPage) {
    return (
      <SanityLegalPage
        fallbackDescription="Leia as condições para acessar a Top Montadores, buscar profissionais e manter cadastro na plataforma."
        fallbackUpdatedAt="22 de junho de 2026"
        page={sanityPage}
      />
    );
  }

  return (
    <LegalPage
      title="Termos de Uso"
      description="Leia as condições para acessar a Top Montadores, buscar profissionais e manter cadastro na plataforma."
      updatedAt="22 de junho de 2026"
      sections={sections}
    />
  );
}
