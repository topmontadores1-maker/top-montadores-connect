import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type LegalSection } from "@/components/site/LegalPage";

const sections: LegalSection[] = [
  {
    title: "O que são cookies",
    body: [
      "Cookies são pequenos arquivos ou identificadores salvos no navegador para permitir que um site reconheça uma visita, mantenha uma sessão, lembre preferências ou entenda como suas páginas são usadas.",
      "Tecnologias semelhantes, como localStorage e sessionStorage, podem cumprir funções parecidas. Nesta política, usamos o termo cookies para cobrir essas tecnologias quando aplicável.",
    ],
  },
  {
    title: "Cookies de sessão e segurança",
    body: [
      "A Top Montadores pode usar cookies e armazenamento local necessários para manter sessões, autenticar usuários administrativos, proteger áreas restritas, evitar falhas de navegação e preservar preferências essenciais, como o aceite desta política.",
      "Esses recursos são necessários para que o site funcione corretamente. Se forem bloqueados pelo navegador, algumas áreas podem não carregar, a sessão pode ser encerrada ou recursos de segurança podem ser afetados.",
    ],
  },
  {
    title: "Cookies de funcionalidade",
    body: [
      "Podemos salvar preferências de interface, aceite do banner de cookies, estado de componentes e escolhas feitas durante a navegação para reduzir repetição de mensagens e melhorar a experiência.",
      "Essas preferências ajudam o site a lembrar que você já visualizou avisos e a manter fluxos mais consistentes entre páginas.",
    ],
  },
  {
    title: "Medição e melhoria do serviço",
    body: [
      "Podemos registrar eventos de uso, como buscas por serviço e cidade, cliques em WhatsApp e páginas acessadas, para entender demanda, corrigir problemas, medir cobertura e melhorar o diretório.",
      "Quando ferramentas de análise forem usadas, elas poderão coletar dados técnicos como dispositivo, navegador, localização aproximada e origem de acesso, sempre conforme suas próprias políticas e configurações aplicáveis.",
    ],
  },
  {
    title: "Cookies de terceiros",
    body: [
      "Algumas funcionalidades podem depender de terceiros, como provedores de banco de dados, autenticação, hospedagem, mapas, WhatsApp, meios de pagamento ou ferramentas de análise. Esses terceiros podem usar seus próprios cookies quando você interage com seus serviços.",
      "A Top Montadores não controla cookies definidos diretamente por sites externos. Recomendamos consultar as políticas desses serviços quando você for direcionado para fora da nossa plataforma.",
    ],
  },
  {
    title: "Como gerenciar cookies",
    body: [
      "Você pode configurar seu navegador para bloquear, apagar ou avisar sobre cookies. Também pode limpar o armazenamento local do site pelas configurações do navegador.",
      "Ao bloquear cookies necessários, alguns recursos podem deixar de funcionar. Para rever o aviso de cookies da Top Montadores, apague os dados locais do site no navegador e acesse a plataforma novamente.",
    ],
  },
  {
    title: "Atualizações",
    body: [
      "Esta política pode ser alterada para refletir mudanças em ferramentas, cookies, recursos do site ou exigências legais. A versão vigente será publicada nesta página.",
    ],
  },
];

export const Route = createFileRoute("/politicas-de-cookies")({
  head: () => ({
    meta: [
      { title: "Política de Cookies — Top Montadores" },
      {
        name: "description",
        content: "Como a Top Montadores usa cookies de sessão, segurança e funcionalidade.",
      },
    ],
  }),
  component: CookiePolicy,
});

function CookiePolicy() {
  return (
    <LegalPage
      title="Política de Cookies"
      description="Entenda como usamos cookies e tecnologias semelhantes para manter sessões, segurança e preferências no site."
      updatedAt="22 de junho de 2026"
      sections={sections}
    />
  );
}
