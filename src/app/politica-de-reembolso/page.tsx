import type { Metadata } from "next";
import Link from "next/link";

const ultimaAtualizacaoPoliticaReembolso = "Abril de 2026";

const title = "Política de Reembolso | FIRMANT";
const description =
  "Consulte a Política de Reembolso da FIRMANT e entenda as regras para cancelamentos, desistências, créditos, serviços digitais personalizados e pagamentos via Asaas.";
const url = "https://firmant.com.br/politica-de-reembolso";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: url,
  },
  openGraph: {
    title,
    description,
    url,
    siteName: "FIRMANT",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const refundSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Política de Reembolso | FIRMANT",
  url,
  description,
  publisher: {
    "@type": "Organization",
    name: "FIRMANT",
    url: "https://firmant.com.br",
    email: "ag.firmant@gmail.com",
    telephone: "+55 11 91491-2488",
    identifier: "63.867.205/0001-99",
  },
};

type RefundSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  subsections?: Array<{
    title: string;
    text?: string;
    bullets?: string[];
  }>;
};

const institutionalData = [
  ["Nome comercial", "FIRMANT"],
  ["CNPJ", "63.867.205/0001-99"],
  ["Atendimento", "100% online para todo o Brasil"],
  ["E-mail", "ag.firmant@gmail.com"],
  ["WhatsApp", "+55 11 91491-2488"],
  ["Instagram", "https://www.instagram.com/ag.firmant/"],
];

const sections: RefundSection[] = [
  {
    title: "1. Quem Somos",
    paragraphs: [
      "A FIRMANT é uma agência digital que atua com estratégia, conteúdo, tecnologia, inteligência artificial e soluções online para empresas, marcas, profissionais e empreendedores.",
      "A FIRMANT presta serviços digitais personalizados e, por isso, cada solicitação de cancelamento ou reembolso será analisada considerando o serviço contratado, o andamento do projeto e as condições comerciais acordadas.",
    ],
  },
  {
    title: "2. Natureza dos Serviços da FIRMANT",
    paragraphs: [
      "Os serviços da FIRMANT possuem natureza digital, criativa, estratégica, técnica e personalizada.",
      "Por se tratar de serviços que envolvem análise, planejamento, tempo técnico, criatividade, uso de ferramentas, produção intelectual e execução personalizada, nem sempre será possível realizar reembolso integral após o início da execução.",
    ],
    bullets: [
      "Gestão de redes sociais com IA;",
      "Planejamento de conteúdo;",
      "Criação de posts;",
      "Criação de legendas, textos e copies;",
      "Produção e edição de vídeos curtos;",
      "Reels, Shorts e Stories;",
      "UGC com inteligência artificial;",
      "Avatares e conteúdos sintéticos;",
      "Desenvolvimento de sites;",
      "Landing pages;",
      "Sistemas e aplicações web/mobile;",
      "Automações digitais;",
      "GEO - otimização para mecanismos de resposta com IA;",
      "Consultorias em IA, automação, estratégia e governança;",
      "Pacotes mensais;",
      "Serviços avulsos;",
      "Projetos personalizados.",
    ],
  },
  {
    title: "3. Pagamentos via Asaas",
    paragraphs: [
      "A FIRMANT poderá utilizar a plataforma Asaas para emissão de cobranças, links de pagamento, boletos, Pix, cartão de crédito ou outros meios disponibilizados pela plataforma.",
      "O pagamento poderá ocorrer por meio de ambiente externo ou link de pagamento gerado pela FIRMANT.",
      "O processamento financeiro, confirmação, compensação, chargeback, estorno ou contestação poderá seguir também as regras, prazos, políticas e procedimentos da plataforma Asaas e das instituições financeiras envolvidas.",
      "A FIRMANT não armazena dados completos de cartão de crédito em seus próprios sistemas.",
      "Eventuais taxas, prazos bancários, custos de processamento, parcelamentos ou tarifas de intermediação poderão impactar o prazo ou o valor final de eventual reembolso, conforme o caso e conforme regras da plataforma de pagamento.",
    ],
  },
  {
    title: "4. Quando o Reembolso Pode ser Solicitado",
    paragraphs: [
      "O cliente poderá solicitar análise de reembolso em situações específicas. Toda solicitação será analisada individualmente.",
      "O envio da solicitação de reembolso não garante aprovação automática.",
    ],
    bullets: [
      "Pagamento em duplicidade;",
      "Pagamento incorreto;",
      "Desistência antes do início da execução do serviço;",
      "Impossibilidade técnica da FIRMANT em executar o serviço contratado;",
      "Cancelamento do projeto antes de qualquer produção efetiva;",
      "Serviço contratado que não puder ser iniciado por motivo atribuível à FIRMANT;",
      "Acordo comercial específico prevendo reembolso;",
      "Falha operacional reconhecida pela FIRMANT.",
    ],
  },
  {
    title: "5. Prazo para Solicitar Reembolso",
    paragraphs: [
      "O cliente poderá solicitar análise de reembolso em até 7 dias corridos após a confirmação do pagamento, desde que o serviço ainda não tenha sido iniciado ou que não tenha havido execução relevante.",
      "Após esse estágio, eventual reembolso poderá ser parcial, convertido em crédito ou recusado, conforme análise do caso concreto.",
    ],
    subsections: [
      {
        title: "Após o início da execução, a FIRMANT poderá já ter realizado atividades como:",
        bullets: [
          "Análise inicial;",
          "Planejamento estratégico;",
          "Reuniões ou alinhamentos;",
          "Pesquisa;",
          "Criação de briefing;",
          "Organização de informações;",
          "Produção de textos;",
          "Criação de artes;",
          "Edição de vídeos;",
          "Configuração de ferramentas;",
          "Desenvolvimento técnico;",
          "Uso de plataformas pagas;",
          "Geração de conteúdos com IA;",
          "Horas técnicas ou criativas;",
          "Preparação de entregáveis.",
        ],
      },
    ],
  },
  {
    title: "6. Cancelamento Antes do Início do Serviço",
    paragraphs: [
      "Caso o cliente solicite cancelamento antes do início efetivo da execução do serviço, a FIRMANT poderá realizar o reembolso integral ou parcial, conforme as condições do pagamento e eventuais taxas já incidentes.",
      "A análise será feita de forma transparente e proporcional ao estágio da solicitação.",
    ],
    bullets: [
      "Taxas de plataforma de pagamento;",
      "Custos de transação;",
      "Tarifas bancárias;",
      "Custos administrativos já comprovadamente iniciados;",
      "Valores referentes a reuniões, diagnósticos, planejamentos ou análises já realizadas, quando aplicável.",
    ],
  },
  {
    title: "7. Cancelamento Após o Início do Serviço",
    paragraphs: [
      "Após o início da execução do serviço, o reembolso integral normalmente não será aplicável.",
      "Isso ocorre porque a FIRMANT já poderá ter dedicado tempo, ferramentas, análise, produção intelectual, estratégia, criação, configuração técnica ou recursos operacionais ao projeto.",
      "A decisão dependerá do serviço contratado, do estágio de execução, dos custos envolvidos e do volume de trabalho já realizado.",
    ],
    bullets: [
      "Negar o reembolso integral;",
      "Oferecer reembolso parcial;",
      "Converter parte do valor em crédito para uso futuro;",
      "Entregar o material já produzido até o momento;",
      "Ajustar o escopo para aproveitar o valor pago;",
      "Propor uma solução intermediária.",
    ],
  },
  {
    title: "8. Serviços Digitais Personalizados",
    paragraphs: [
      "Serviços personalizados, criativos, técnicos ou sob demanda podem não ser elegíveis a reembolso integral após o início da execução.",
      "Quando o serviço envolve produção sob medida para o cliente, a simples desistência após início da execução não garante reembolso integral.",
    ],
    bullets: [
      "Criação de posts;",
      "Criação de copies;",
      "Criação de legendas;",
      "Planejamento de conteúdo;",
      "Diagnóstico de redes sociais;",
      "Estratégias de marketing;",
      "Edição de vídeos;",
      "Criação de Reels, Shorts e Stories;",
      "Produção de UGC com IA;",
      "Criação de avatares;",
      "Desenvolvimento de sites;",
      "Landing pages;",
      "Sistemas e aplicações;",
      "Automações;",
      "Consultorias;",
      "Análises personalizadas;",
      "Pesquisas;",
      "Roteiros;",
      "Briefings;",
      "Arquivos, templates ou materiais personalizados.",
    ],
  },
  {
    title: "9. Pacotes Mensais",
    paragraphs: [
      "Pacotes mensais contratados com a FIRMANT podem envolver recorrência, planejamento, reserva de agenda, organização de demandas e produção contínua.",
      "Em pacotes mensais, o cancelamento deverá observar as condições acordadas na contratação.",
      "Valores proporcionais poderão ser analisados, mas o reembolso integral de mensalidade já iniciada não será garantido.",
      "Quando houver pacote recorrente, o cliente deverá solicitar cancelamento antes da renovação ou nova cobrança, respeitando o prazo eventualmente informado em proposta, contrato ou comunicação comercial.",
    ],
    bullets: [
      "Serviços já prestados;",
      "Conteúdos já planejados;",
      "Conteúdos já produzidos;",
      "Materiais já entregues;",
      "Horas já utilizadas;",
      "Custos de ferramentas;",
      "Reserva de agenda;",
      "Etapas já iniciadas.",
    ],
  },
  {
    title: "10. Serviços Avulsos",
    paragraphs: [
      "Serviços avulsos, como criação de peça, vídeo, análise, consultoria, página, automação ou entrega pontual, serão analisados conforme o estágio de execução.",
    ],
    subsections: [
      {
        title: "Antes do início",
        text: "Poderá haver reembolso integral ou parcial, conforme taxas e custos já incidentes.",
      },
      {
        title: "Após início",
        text: "Poderá haver reembolso parcial, crédito ou entrega proporcional do que já foi produzido.",
      },
      {
        title: "Após conclusão ou entrega",
        text: "Não haverá reembolso, salvo em caso de falha reconhecida pela FIRMANT ou acordo específico entre as partes.",
      },
    ],
  },
  {
    title: "11. Consultorias e Diagnósticos",
    paragraphs: [
      "Consultorias, diagnósticos, reuniões estratégicas, análises e orientações personalizadas possuem natureza intelectual e são consumidas no momento da execução.",
      "Por isso, após a realização da consultoria, reunião, diagnóstico ou entrega da análise, não haverá reembolso, salvo em caso de falha comprovada atribuível à FIRMANT.",
      "Caso o cliente cancele antes da realização da consultoria ou reunião, a FIRMANT poderá oferecer reagendamento, crédito ou reembolso, conforme o prazo de aviso e as condições acordadas.",
    ],
  },
  {
    title: "12. Desenvolvimento Web, Landing Pages, Sistemas e Aplicações",
    paragraphs: [
      "Projetos de desenvolvimento web/mobile, landing pages, sites, sistemas, integrações ou aplicações envolvem planejamento, arquitetura, design, código, configuração, testes e horas técnicas.",
      "Após o início do desenvolvimento, o reembolso integral não será aplicável.",
      "Arquivos-fonte, códigos, componentes, estruturas internas ou materiais técnicos somente serão entregues se estiverem previstos na proposta ou se houver acordo específico.",
    ],
    bullets: [
      "Entregar parcialmente o que já foi desenvolvido, se tecnicamente viável;",
      "Reter valor proporcional ao trabalho realizado;",
      "Oferecer crédito para uso futuro;",
      "Apresentar relatório ou resumo do estágio do projeto;",
      "Avaliar eventual reembolso parcial, se houver saldo não utilizado.",
    ],
  },
  {
    title: "13. Vídeos, UGC com IA e Conteúdos Sintéticos",
    paragraphs: [
      "Serviços de vídeos, Reels, Shorts, Stories, UGC com IA, avatares, vozes, conteúdos sintéticos ou materiais audiovisuais envolvem criação, edição, roteirização, geração, curadoria, ferramentas e tempo técnico.",
      "Após o início da criação, edição ou geração dos materiais, o reembolso integral não será garantido.",
      "Após entrega do material final ou versão preliminar substancial, não haverá reembolso integral, salvo falha reconhecida pela FIRMANT.",
    ],
    bullets: [
      "Criação de roteiro;",
      "Pesquisa de referência;",
      "Planejamento criativo;",
      "Geração de avatar;",
      "Geração de imagem;",
      "Geração de voz;",
      "Edição de vídeo;",
      "Tratamento de áudio;",
      "Legendas;",
      "Ajustes visuais;",
      "Renderização;",
      "Uso de ferramenta paga;",
      "Exportação de arquivos.",
    ],
  },
  {
    title: "14. Gestão de Redes Sociais",
    paragraphs: [
      "Serviços de gestão de redes sociais podem envolver planejamento, calendário editorial, pesquisa, criação de conteúdo, copies, artes, vídeos, agendamento, análise e relatórios.",
      "Após o início do mês contratado ou da produção dos conteúdos, o reembolso integral não será garantido.",
      "Poderá ser oferecido crédito ou reembolso proporcional somente se houver saldo não executado e se a análise do caso permitir.",
    ],
    bullets: [
      "Quantidade de conteúdos já planejados;",
      "Quantidade de conteúdos já criados;",
      "Quantidade de conteúdos já entregues;",
      "Horas de planejamento já realizadas;",
      "Reuniões ou alinhamentos já feitos;",
      "Custos operacionais;",
      "Reserva de agenda;",
      "Uso de ferramentas.",
    ],
  },
  {
    title: "15. Serviços de GEO, SEO, Automação e IA",
    paragraphs: [
      "Serviços relacionados a GEO, SEO, automação, inteligência artificial, análise, estruturação técnica, estratégia ou implementação digital possuem natureza consultiva, técnica e personalizada.",
      "Após o início dessas atividades, o reembolso integral não será garantido.",
      "A FIRMANT poderá avaliar reembolso parcial, crédito ou entrega proporcional conforme o estágio do serviço.",
    ],
    bullets: [
      "Pesquisa;",
      "Diagnóstico;",
      "Planejamento;",
      "Estruturação técnica;",
      "Criação de fluxos;",
      "Configuração de ferramentas;",
      "Desenvolvimento de prompts;",
      "Análise de conteúdo;",
      "Recomendações estratégicas;",
      "Documentação;",
      "Testes;",
      "Ajustes;",
      "Integrações.",
    ],
  },
  {
    title: "16. Revisões não são Reembolso",
    paragraphs: [
      "Solicitações de ajuste, revisão ou melhoria não significam automaticamente direito a reembolso.",
      "Quando o serviço contratado incluir revisões, a FIRMANT poderá realizar ajustes dentro do escopo combinado.",
      "A revisão serve para aperfeiçoar a entrega, corrigir pontos alinhados ao briefing ou ajustar detalhes do material.",
      "Mudanças fora do escopo poderão gerar cobrança adicional.",
    ],
    bullets: [
      "Mudança completa de direção criativa;",
      "Novo briefing após início do projeto;",
      "Inclusão de novo serviço;",
      "Alteração estrutural não prevista;",
      "Solicitação fora do escopo;",
      "Pedido de refazer material aprovado;",
      "Solicitação de quantidade adicional de entregas;",
      "Ajustes decorrentes de informação incorreta enviada pelo cliente.",
    ],
  },
  {
    title: "17. Casos em que o Reembolso Pode ser Negado",
    paragraphs: [
      "A FIRMANT poderá negar reembolso quando houver execução, entrega, uso de materiais, descumprimento de condições acordadas ou indícios de uso indevido dos serviços.",
      "Cada caso será avaliado individualmente.",
    ],
    bullets: [
      "O serviço já tiver sido iniciado;",
      "O serviço já tiver sido entregue;",
      "O cliente desistir após início da execução;",
      "O cliente não enviar informações necessárias;",
      "O cliente atrasar aprovações ou retornos;",
      "O cliente mudar o briefing após início;",
      "O cliente não gostar subjetivamente da direção criativa, mas o material seguir o briefing aprovado;",
      "O cliente utilizar materiais já entregues;",
      "O cliente solicitar cancelamento após consumo de consultoria, diagnóstico ou reunião;",
      "O cliente descumprir condições acordadas;",
      "O cliente solicitar algo fora do escopo contratado;",
      "O pagamento tiver sido contestado indevidamente;",
      "A solicitação estiver fora do prazo previsto;",
      "Houver indícios de má-fé, fraude ou uso indevido dos serviços.",
    ],
  },
  {
    title: "18. Créditos para Uso Futuro",
    paragraphs: [
      "Em alguns casos, a FIRMANT poderá oferecer crédito para uso futuro em vez de reembolso financeiro.",
      "As condições de uso do crédito, validade e aplicação serão definidas caso a caso pela FIRMANT.",
      "O crédito não será obrigatoriamente conversível em dinheiro, salvo acordo específico.",
    ],
    bullets: [
      "Contratar outro serviço;",
      "Complementar pacote existente;",
      "Solicitar nova entrega;",
      "Reagendar consultoria;",
      "Ajustar escopo;",
      "Aproveitar valor pago em projeto futuro.",
    ],
  },
  {
    title: "19. Prazo para Processamento do Reembolso",
    paragraphs: [
      "Quando um reembolso for aprovado, a FIRMANT informará o prazo estimado para processamento.",
      "Em pagamentos por cartão de crédito, o estorno poderá aparecer em faturas futuras, conforme regras da administradora do cartão.",
      "Em pagamentos via Pix ou boleto, a FIRMANT poderá solicitar dados bancários do titular responsável pelo pagamento para efetivação do reembolso.",
    ],
    bullets: [
      "Meio de pagamento utilizado;",
      "Regras da plataforma Asaas;",
      "Forma de pagamento;",
      "Instituição financeira;",
      "Cartão de crédito;",
      "Pix;",
      "Boleto;",
      "Procedimentos internos;",
      "Dados bancários fornecidos pelo cliente.",
    ],
  },
  {
    title: "20. Chargeback, Contestações e Disputas",
    paragraphs: [
      "Caso o cliente realize chargeback, contestação ou disputa de pagamento sem antes buscar contato com a FIRMANT, a prestação do serviço poderá ser suspensa até a resolução da situação.",
      "A FIRMANT poderá apresentar documentos, mensagens, comprovantes, entregas, registros de atendimento, propostas e evidências à plataforma de pagamento, instituição financeira ou autoridade competente para comprovar a legitimidade da cobrança.",
      "A abertura de contestação indevida poderá impactar a continuidade do relacionamento comercial.",
      "A FIRMANT recomenda que qualquer dúvida, insatisfação ou pedido de cancelamento seja comunicado diretamente pelos canais oficiais antes de qualquer medida junto à instituição financeira.",
    ],
  },
  {
    title: "21. Como Solicitar Reembolso",
    paragraphs: [
      "Para solicitar análise de reembolso, o cliente deverá entrar em contato pelos canais oficiais da FIRMANT.",
      "A FIRMANT poderá solicitar informações adicionais para validar a solicitação e analisar o caso.",
    ],
    bullets: [
      "Nome completo;",
      "E-mail utilizado na contratação;",
      "WhatsApp;",
      "Serviço contratado;",
      "Data do pagamento;",
      "Comprovante de pagamento;",
      "Motivo da solicitação;",
      "Descrição do ocorrido;",
      "Dados bancários, se necessário e se solicitado.",
    ],
    subsections: [
      {
        title: "Canais oficiais",
        bullets: [
          "E-mail: ag.firmant@gmail.com;",
          "WhatsApp: +55 11 91491-2488.",
        ],
      },
    ],
  },
  {
    title: "22. Análise Individual do Caso",
    paragraphs: [
      "Cada solicitação de cancelamento ou reembolso será analisada individualmente.",
      "A decisão será comunicada ao cliente pelos canais oficiais.",
    ],
    bullets: [
      "Tipo de serviço contratado;",
      "Valor pago;",
      "Data do pagamento;",
      "Forma de pagamento;",
      "Início ou não da execução;",
      "Horas já dedicadas;",
      "Materiais já produzidos;",
      "Custos já assumidos;",
      "Ferramentas utilizadas;",
      "Entregas já realizadas;",
      "Condições acordadas;",
      "Comunicação entre as partes;",
      "Existência de falha atribuível à FIRMANT;",
      "Boa-fé das partes.",
    ],
  },
  {
    title: "23. Relação com Termos de Uso e Política de Privacidade",
    paragraphs: [
      "Esta Política de Reembolso deve ser interpretada em conjunto com os Termos de Uso e a Política de Privacidade da FIRMANT.",
      "Ao contratar ou solicitar serviços da FIRMANT, o cliente declara estar ciente dessas condições.",
    ],
  },
  {
    title: "24. Alterações nesta Política",
    paragraphs: [
      "A FIRMANT poderá atualizar esta Política de Reembolso periodicamente para refletir mudanças em seus serviços, processos comerciais, plataformas de pagamento, legislação aplicável ou práticas operacionais.",
      "A data de atualização estará indicada no início da página.",
      "Recomenda-se que o usuário consulte esta política sempre que for contratar um serviço, realizar pagamento ou solicitar cancelamento.",
    ],
  },
  {
    title: "25. Canais de Contato",
    paragraphs: [
      "Em caso de dúvidas sobre cancelamentos, créditos, desistências ou reembolsos, entre em contato com a FIRMANT pelos canais oficiais.",
    ],
    bullets: [
      "E-mail: ag.firmant@gmail.com;",
      "WhatsApp: +55 11 91491-2488;",
      "Instagram: https://www.instagram.com/ag.firmant/;",
      "Atendimento: 100% online para todo o Brasil, de segunda a sexta-feira, com retorno em até 1 dia útil.",
    ],
  },
];

const shortTexts = [
  {
    title: "Resumo da política",
    text: "A Política de Reembolso da FIRMANT define as condições para cancelamentos, desistências, créditos e reembolsos relacionados a serviços digitais personalizados.",
  },
  {
    title: "Texto para configurador de pacotes",
    text: "Declaro que li e concordo com os Termos de Uso, a Política de Privacidade e a Política de Reembolso da FIRMANT, estando ciente de que serviços digitais personalizados podem ter regras específicas de cancelamento e reembolso conforme o estágio de execução.",
  },
  {
    title: "Texto para pagamento",
    text: "Antes de concluir o pagamento, recomendamos a leitura dos Termos de Uso, da Política de Privacidade e da Política de Reembolso da FIRMANT. Serviços digitais personalizados podem não ser elegíveis a reembolso integral após o início da execução.",
  },
];

export default function PoliticaDeReembolsoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(refundSchema).replace(/</g, "\\u003c"),
        }}
      />
      <section className="legal-hero">
        <div className="legal-shell">
          <span className="legal-kicker">Cancelamentos e créditos</span>
          <h1>Política de Reembolso</h1>
          <div className="legal-hero-copy">
            <p>
              Esta Política de Reembolso estabelece as condições aplicáveis a cancelamentos, desistências, créditos, interrupções de serviço e solicitações de reembolso relacionadas aos serviços digitais oferecidos pela FIRMANT.
            </p>
            <p>
              A FIRMANT atua com serviços personalizados, estratégicos e digitais, incluindo gestão de redes sociais com IA, criação de vídeos curtos, UGC com inteligência artificial, desenvolvimento web/mobile, GEO, automações, consultorias e soluções sob medida.
            </p>
            <p>
              Por se tratar de serviços intelectuais, criativos, técnicos e personalizados, as regras de reembolso podem variar conforme o tipo de serviço contratado, o estágio de execução, os materiais já produzidos, as horas de trabalho realizadas, os custos envolvidos e as condições acordadas no momento da contratação.
            </p>
            <p>
              Ao contratar, solicitar ou pagar por qualquer serviço da FIRMANT, o cliente declara estar ciente e de acordo com esta Política de Reembolso, bem como com os <Link href="/termos-de-uso">Termos de Uso</Link> e a <Link href="/politica-privacidade">Política de Privacidade</Link> da FIRMANT.
            </p>
          </div>
          <div className="legal-update-card">
            <span>Última atualização</span>
            <strong>{ultimaAtualizacaoPoliticaReembolso}</strong>
          </div>
        </div>
      </section>

      <section className="legal-main">
        <div className="legal-shell legal-layout">
          <aside className="legal-toc" aria-label="Resumo da política de reembolso">
            <span className="legal-kicker">Nesta página</span>
            {sections.slice(0, 8).map((section) => (
              <a key={section.title} href={`#${slugify(section.title)}`}>
                {section.title}
              </a>
            ))}
            <a href="#declaracao-final">Declaração final</a>
          </aside>

          <div className="legal-content">
            <article className="legal-card">
              <h2>Dados institucionais</h2>
              <dl className="legal-data-grid">
                {institutionalData.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </article>

            {sections.map((section) => (
              <article key={section.title} id={slugify(section.title)} className="legal-card">
                <h2>{section.title}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{renderParagraph(paragraph)}</p>
                ))}
                {section.bullets && <BulletList items={section.bullets} />}
                {section.subsections?.map((subsection) => (
                  <div key={subsection.title} className="legal-subsection">
                    <h3>{subsection.title}</h3>
                    {subsection.text && <p>{renderParagraph(subsection.text)}</p>}
                    {subsection.bullets && <BulletList items={subsection.bullets} />}
                  </div>
                ))}
              </article>
            ))}

            <article id="declaracao-final" className="legal-card legal-final-card">
              <h2>Declaração Final</h2>
              <p>
                A FIRMANT busca conduzir cada solicitação com transparência, proporcionalidade e boa-fé.
              </p>
              <p>
                Nosso objetivo é estabelecer uma relação clara com o cliente, evitando dúvidas sobre cancelamentos, desistências e reembolsos em serviços digitais personalizados.
              </p>
              <p>
                Como a maior parte dos serviços envolve análise, planejamento, criação, produção intelectual, uso de ferramentas e execução sob demanda, cada solicitação será avaliada conforme o estágio do trabalho e as condições comerciais aplicáveis.
              </p>
            </article>

            <section className="legal-short-grid" aria-label="Textos curtos da política de reembolso">
              {shortTexts.map((item) => (
                <article key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </section>
          </div>
        </div>
      </section>
    </>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="legal-list">
      {items.map((item) => (
        <li key={item}>{renderParagraph(item)}</li>
      ))}
    </ul>
  );
}

function renderParagraph(value: string) {
  if (value.includes("Termos de Uso") && value.includes("Política de Privacidade")) {
    const [beforeTerms, afterTerms] = value.split("Termos de Uso");
    const [between, afterPrivacy] = afterTerms.split("Política de Privacidade");

    return (
      <>
        {beforeTerms}
        <Link href="/termos-de-uso">Termos de Uso</Link>
        {between}
        <Link href="/politica-privacidade">Política de Privacidade</Link>
        {afterPrivacy}
      </>
    );
  }

  if (value.includes("Termos de Uso")) {
    const [before, after] = value.split("Termos de Uso");
    return (
      <>
        {before}
        <Link href="/termos-de-uso">Termos de Uso</Link>
        {after}
      </>
    );
  }

  if (value.includes("Política de Privacidade")) {
    const [before, after] = value.split("Política de Privacidade");
    return (
      <>
        {before}
        <Link href="/politica-privacidade">Política de Privacidade</Link>
        {after}
      </>
    );
  }

  return value;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
