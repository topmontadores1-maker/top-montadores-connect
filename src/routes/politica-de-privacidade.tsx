import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type LegalSection } from "@/components/site/LegalPage";

const sections: LegalSection[] = [
  {
    title: "Quais dados coletamos",
    body: [
      "Podemos coletar dados informados voluntariamente por clientes e montadores, como nome, telefone, WhatsApp, e-mail, cidade, estado, endereço profissional, serviços oferecidos, fotos, documentos de identificação quando necessários para análise cadastral e mensagens enviadas pelos formulários da plataforma.",
      "Também registramos dados técnicos de navegação, como páginas acessadas, data e horário de acesso, preferências de cookies, informações aproximadas do dispositivo e interações com botões de contato. Esses registros ajudam a manter a segurança, medir demanda por região e melhorar o funcionamento do site.",
    ],
  },
  {
    title: "Como usamos as informações",
    body: [
      "Usamos os dados para operar o diretório Top Montadores, exibir profissionais disponíveis por serviço e cidade, encaminhar contatos via WhatsApp, avaliar cadastros de montadores, prevenir fraude, responder solicitações e melhorar a cobertura de atendimento.",
      "Consultas feitas na busca podem ser armazenadas de forma operacional para gerar rankings internos de cidades mais pesquisadas por serviço. Esse uso ajuda a priorizar regiões com demanda, inclusive quando ainda não existem profissionais cadastrados para atender.",
    ],
  },
  {
    title: "Base legal e consentimento",
    body: [
      "Tratamos dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD), usando bases como execução de contrato, legítimo interesse, cumprimento de obrigação legal, prevenção a fraude e consentimento quando aplicável.",
      "Quando o tratamento depender de consentimento, você poderá revogá-lo pelos canais de contato informados nesta política. A revogação pode limitar alguns recursos, como manutenção de cadastro público ou uso de preferências salvas.",
    ],
  },
  {
    title: "Compartilhamento de dados",
    body: [
      "Dados de montadores aprovados podem ser exibidos publicamente no diretório, incluindo nome, foto, cidade, estado, bairros atendidos, serviços e contato profissional. Clientes que clicam no WhatsApp são direcionados para conversar diretamente com o profissional.",
      "Podemos compartilhar dados com provedores necessários para hospedagem, autenticação, banco de dados, análise, atendimento, segurança e cumprimento de obrigações legais. Não vendemos dados pessoais.",
    ],
  },
  {
    title: "Segurança e retenção",
    body: [
      "Adotamos controles técnicos e administrativos para reduzir riscos de acesso indevido, perda, alteração ou divulgação não autorizada. Nenhum ambiente digital é totalmente imune a incidentes, mas buscamos manter medidas proporcionais à natureza dos dados tratados.",
      "Mantemos os dados pelo tempo necessário para cumprir as finalidades descritas, resolver disputas, preservar registros operacionais, cumprir obrigações legais e proteger direitos da Top Montadores, de usuários e de profissionais.",
    ],
  },
  {
    title: "Seus direitos",
    body: [
      "Você pode solicitar confirmação de tratamento, acesso, correção, atualização, portabilidade, anonimização, bloqueio, eliminação, informação sobre compartilhamento e revisão de decisões automatizadas, quando aplicável.",
      "Para exercer seus direitos, envie uma solicitação pelos canais oficiais da Top Montadores. Poderemos pedir dados mínimos para confirmar sua identidade antes de atender ao pedido.",
    ],
  },
  {
    title: "Links externos e WhatsApp",
    body: [
      "O site pode direcionar para páginas externas, como WhatsApp, redes sociais, ferramentas de pagamento ou páginas de parceiros. Esses ambientes possuem políticas próprias, e a Top Montadores não controla suas práticas de privacidade.",
      "Ao iniciar uma conversa pelo WhatsApp, as informações enviadas ao profissional passam a ser compartilhadas diretamente entre você e esse profissional.",
    ],
  },
  {
    title: "Atualizações e contato",
    body: [
      "Esta política pode ser atualizada para refletir mudanças legais, técnicas ou operacionais. A versão vigente será sempre publicada nesta página.",
      "Em caso de dúvidas sobre privacidade ou proteção de dados, entre em contato pelos canais oficiais disponíveis no site da Top Montadores.",
    ],
  },
];

export const Route = createFileRoute("/politica-de-privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Top Montadores" },
      {
        name: "description",
        content: "Como a Top Montadores coleta, utiliza e protege dados pessoais.",
      },
    ],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <LegalPage
      title="Política de Privacidade"
      description="Esta política explica como tratamos dados de clientes, visitantes e profissionais cadastrados na Top Montadores."
      updatedAt="22 de junho de 2026"
      sections={sections}
    />
  );
}
