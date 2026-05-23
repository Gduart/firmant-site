import type { Metadata } from "next";
import Link from "next/link";

const ultimaAtualizacaoTermosUso = "Abril de 2026";

const title = "Termos de Uso | FIRMANT";
const description =
  "Consulte os Termos de Uso da FIRMANT e entenda as condições de acesso ao site, solicitação de serviços, uso do configurador de pacotes, pagamentos, responsabilidades e regras gerais.";
const url = "https://firmant.com.br/termos-de-uso";

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

const termsSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Termos de Uso | FIRMANT",
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

type TermsSection = {
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
  ["Facebook", "https://web.facebook.com/profile.php?id=61590072505709&locale=pt_BR"],
];

const sections: TermsSection[] = [
  {
    title: "1. Quem Somos",
    paragraphs: [
      "A FIRMANT é uma agência digital que atua com soluções online, estratégia, tecnologia, conteúdo e inteligência artificial aplicada a negócios.",
      "A FIRMANT oferece serviços relacionados a gestão de redes sociais com IA, criação de vídeos curtos, UGC com inteligência artificial e avatares, desenvolvimento web/mobile, GEO, automação, consultoria em IA e demais soluções digitais compatíveis com sua atuação.",
    ],
  },
  {
    title: "2. Aceitação dos Termos",
    paragraphs: [
      "Ao utilizar o site da FIRMANT, o usuário concorda com estes Termos de Uso e com a Política de Privacidade da FIRMANT.",
      "O uso contínuo do site após eventuais atualizações destes Termos de Uso representa concordância com a versão mais recente publicada.",
    ],
    bullets: [
      "Acessa o site;",
      "Navega pelas páginas;",
      "Clica em botões de contato;",
      "Utiliza o configurador de pacotes;",
      "Envia informações pelo site;",
      "Entra em contato via WhatsApp, e-mail, Instagram ou Facebook;",
      "Solicita orçamento, proposta ou atendimento;",
      "Contrata serviços;",
      "Realiza pagamento por meio de plataforma indicada pela FIRMANT;",
      "Envia arquivos, briefings, imagens, vídeos, documentos ou materiais para análise ou execução de serviços.",
    ],
  },
  {
    title: "3. Uso do Site",
    paragraphs: [
      "O site da FIRMANT tem finalidade institucional, comercial, informativa e operacional.",
      "O usuário se compromete a utilizar o site de forma lícita, ética, responsável e compatível com estes Termos de Uso.",
    ],
    bullets: [
      "Conhecer a FIRMANT;",
      "Entender os serviços oferecidos;",
      "Acessar páginas institucionais;",
      "Criar ou simular pacotes de serviços;",
      "Solicitar atendimento;",
      "Enviar informações para análise;",
      "Entrar em contato pelos canais oficiais;",
      "Acessar conteúdos, materiais e informações disponibilizados pela FIRMANT;",
      "Futuramente, assinar newsletter ou receber comunicações autorizadas.",
    ],
    subsections: [
      {
        title: "É proibido utilizar o site para:",
        bullets: [
          "Praticar atos ilícitos;",
          "Enviar informações falsas;",
          "Tentar acessar áreas restritas sem autorização;",
          "Interferir no funcionamento do site;",
          "Copiar, explorar ou reproduzir indevidamente conteúdos da FIRMANT;",
          "Enviar vírus, códigos maliciosos ou arquivos prejudiciais;",
          "Utilizar automações, robôs ou scripts abusivos;",
          "Simular identidade de terceiros;",
          "Violar direitos de propriedade intelectual;",
          "Prejudicar a FIRMANT, seus clientes, parceiros ou terceiros.",
        ],
      },
    ],
  },
  {
    title: "4. Configurador de Pacotes",
    paragraphs: [
      "O site da FIRMANT poderá disponibilizar um configurador de pacotes para que o usuário selecione serviços, combine soluções, visualize possibilidades e solicite atendimento ou contratação.",
      "Ao utilizar o configurador, o usuário poderá informar dados como nome, e-mail, WhatsApp, nome do Instagram, serviço escolhido, orçamento, mensagem e dados do pacote montado.",
      "As informações inseridas no configurador serão utilizadas para análise comercial, atendimento, elaboração de proposta, continuidade do contato e eventual contratação.",
      "Os valores, combinações, prazos ou condições exibidos no configurador podem ter caráter estimativo, salvo quando expressamente indicado como proposta final e formalizada pela FIRMANT.",
      "A FIRMANT poderá revisar manualmente o pacote montado antes de confirmar a contratação, especialmente quando houver necessidade de análise técnica, escopo personalizado, disponibilidade operacional, complexidade do serviço ou condições específicas do projeto.",
    ],
    bullets: [
      "Gestão de redes sociais com IA;",
      "Criação de Reels, Shorts e vídeos curtos;",
      "UGC com IA e avatares;",
      "Desenvolvimento de sites, landing pages, sistemas e aplicações;",
      "GEO;",
      "Consultoria em IA, automação e governança;",
      "Serviços adicionais ou personalizados.",
    ],
  },
  {
    title: "5. Solicitação de Proposta e Atendimento",
    paragraphs: [
      "O envio de informações pelo site, WhatsApp, e-mail, Instagram ou configurador não garante aprovação automática, contratação imediata ou obrigação de prestação de serviço pela FIRMANT.",
      "A contratação somente será considerada efetiva após confirmação expressa da FIRMANT, aceite da proposta, alinhamento do escopo e, quando aplicável, confirmação de pagamento ou condições comerciais acordadas.",
    ],
    bullets: [
      "Confirmar informações;",
      "Solicitar detalhes adicionais;",
      "Validar escopo;",
      "Esclarecer dúvidas;",
      "Ajustar valores;",
      "Definir prazos;",
      "Avaliar viabilidade técnica;",
      "Formalizar proposta;",
      "Orientar o melhor serviço ou pacote.",
    ],
  },
  {
    title: "6. Serviços Oferecidos",
    paragraphs: [
      "A FIRMANT poderá oferecer serviços digitais compatíveis com sua atuação.",
      "A descrição específica, prazo, valor, entregáveis, revisões, forma de execução e condições de cada serviço deverão ser definidos em proposta, contrato, orçamento, página comercial ou comunicação formal entre as partes.",
    ],
    bullets: [
      "Gestão de redes sociais com IA;",
      "Planejamento de conteúdo;",
      "Criação de posts;",
      "Criação de legendas e copies;",
      "Produção e edição de vídeos curtos;",
      "Reels, Shorts e Stories;",
      "UGC com inteligência artificial;",
      "Avatares e conteúdos sintéticos;",
      "Desenvolvimento de sites;",
      "Landing pages;",
      "Sistemas e aplicações web/mobile;",
      "Automação de processos;",
      "GEO - otimização para mecanismos de resposta com IA;",
      "Consultoria em inteligência artificial;",
      "Consultoria em automação;",
      "Consultoria em governança e uso responsável de IA;",
      "Serviços personalizados conforme necessidade do cliente.",
    ],
  },
  {
    title: "7. Pagamentos",
    paragraphs: [
      "A FIRMANT poderá utilizar a plataforma Asaas para emissão de cobranças, links de pagamento, boletos, Pix, cartão de crédito ou outros meios de pagamento disponibilizados pela plataforma.",
      "O usuário reconhece que o processamento do pagamento poderá ocorrer em ambiente externo, próprio da plataforma Asaas, sujeito também aos termos, políticas e regras dessa plataforma.",
      "A FIRMANT não armazena dados completos de cartão de crédito em seus próprios sistemas.",
      "A contratação, liberação ou início de determinados serviços poderá depender da confirmação do pagamento, sinal, entrada, mensalidade, parcela inicial ou outro formato comercial acordado.",
      "A ausência de pagamento, atraso, contestação, chargeback ou falha no processamento poderá resultar em suspensão do atendimento, interrupção temporária do serviço, bloqueio de entregas ou cancelamento da contratação, conforme o caso e mediante análise da FIRMANT.",
    ],
  },
  {
    title: "8. Prazos e Entregas",
    paragraphs: [
      "Os prazos de entrega informados pela FIRMANT poderão variar conforme o escopo, a complexidade e as dependências de cada projeto.",
      "Prazos somente serão considerados definitivos quando formalmente confirmados pela FIRMANT.",
      "Atrasos no envio de informações, materiais, acessos, aprovações ou respostas por parte do cliente poderão impactar diretamente o prazo de execução.",
      "A FIRMANT não se responsabiliza por atrasos causados por ausência de retorno do cliente, indisponibilidade de plataformas externas, erros de terceiros, alterações de escopo ou eventos fora de seu controle razoável.",
    ],
    bullets: [
      "Complexidade do projeto;",
      "Escopo contratado;",
      "Volume de entregas;",
      "Envio de materiais pelo cliente;",
      "Aprovações necessárias;",
      "Revisões solicitadas;",
      "Disponibilidade técnica;",
      "Dependência de terceiros;",
      "Plataformas externas;",
      "Alterações solicitadas durante o projeto.",
    ],
  },
  {
    title: "9. Obrigações do Usuário ou Cliente",
    paragraphs: [
      "O cliente é responsável pela veracidade, legalidade e autorização de uso dos materiais e informações enviados à FIRMANT.",
    ],
    bullets: [
      "Fornecer informações verdadeiras, completas e atualizadas;",
      "Utilizar o site e os canais da FIRMANT de forma ética e legal;",
      "Informar corretamente seus dados de contato;",
      "Enviar materiais necessários para execução dos serviços;",
      "Garantir que possui direitos de uso sobre arquivos, imagens, vídeos, marcas, textos e documentos enviados;",
      "Responder solicitações da FIRMANT dentro de prazo razoável;",
      "Revisar e aprovar materiais quando solicitado;",
      "Realizar pagamentos conforme combinado;",
      "Não enviar conteúdos ilegais, ofensivos, discriminatórios ou que violem direitos de terceiros;",
      "Não solicitar serviços que envolvam fraude, engano, violação de leis ou práticas abusivas;",
      "Respeitar os direitos autorais, comerciais e intelectuais da FIRMANT.",
    ],
  },
  {
    title: "10. Envio de Arquivos e Materiais",
    paragraphs: [
      "O usuário ou cliente poderá enviar arquivos e materiais para análise, criação, edição, diagnóstico, execução de serviço ou elaboração de proposta.",
      "Ao enviar arquivos à FIRMANT, o usuário declara que possui autorização para uso, compartilhamento e tratamento desses materiais.",
      "A FIRMANT poderá utilizar os arquivos enviados exclusivamente para fins relacionados ao atendimento, proposta, execução do serviço, criação de conteúdo, análise estratégica, desenvolvimento do projeto ou continuidade da relação comercial.",
      "A FIRMANT não se responsabiliza por violações de direitos autorais, uso indevido de imagem, marca, som, voz, textos, documentos ou materiais enviados pelo próprio cliente sem a devida autorização.",
    ],
    bullets: [
      "Imagens;",
      "Vídeos;",
      "Logotipos;",
      "Identidade visual;",
      "Briefings;",
      "Documentos;",
      "Textos;",
      "Dados de redes sociais;",
      "Materiais de campanha;",
      "Referências criativas;",
      "Informações sobre produtos ou serviços.",
    ],
  },
  {
    title: "11. Uso de Inteligência Artificial",
    paragraphs: [
      "A FIRMANT utiliza inteligência artificial como apoio estratégico, criativo, técnico, analítico e operacional.",
      "O uso de IA não elimina a curadoria, análise e responsabilidade humana da FIRMANT.",
      "A FIRMANT busca utilizar IA de forma responsável, transparente e adequada ao contexto do serviço contratado.",
      "O cliente reconhece que ferramentas de IA podem apresentar limitações, imprecisões ou variações de resultado, sendo necessária revisão humana, validação estratégica e aprovação final quando aplicável.",
      "Quando o serviço envolver avatares, conteúdos sintéticos, UGC com IA, imagens geradas por IA, vozes, personagens, vídeos ou peças digitais criadas com apoio de IA, as condições de uso, limitações, direitos, restrições e licenças poderão depender das ferramentas utilizadas e deverão ser observadas conforme cada caso.",
    ],
    bullets: [
      "Analisar briefings;",
      "Organizar informações;",
      "Criar ideias;",
      "Apoiar produção de textos;",
      "Desenvolver roteiros;",
      "Apoiar criação de conteúdos visuais;",
      "Ajudar em análises de redes sociais;",
      "Apoiar desenvolvimento web/mobile;",
      "Gerar diagnósticos e recomendações;",
      "Melhorar produtividade e eficiência;",
      "Apoiar automações e processos internos.",
    ],
  },
  {
    title: "12. Propriedade Intelectual da FIRMANT",
    paragraphs: [
      "Todo o conteúdo disponibilizado no site da FIRMANT, incluindo textos, estrutura, identidade, layout, design, imagens, ícones, elementos gráficos, marcas, conceitos, descrições, páginas, códigos, componentes, estratégias, organização visual e materiais institucionais, pertence à FIRMANT ou é utilizado mediante autorização/licença.",
      "É proibido copiar, reproduzir, modificar, distribuir, vender, explorar comercialmente ou utilizar indevidamente qualquer conteúdo da FIRMANT sem autorização prévia e expressa.",
      "O acesso ao site não concede ao usuário qualquer direito de propriedade intelectual sobre os conteúdos, marcas, materiais ou elementos da FIRMANT.",
    ],
  },
  {
    title: "13. Propriedade Intelectual dos Serviços Entregues",
    paragraphs: [
      "Os direitos de uso sobre materiais entregues ao cliente dependerão do serviço contratado, das condições comerciais acordadas, das ferramentas utilizadas e das licenças envolvidas.",
      "Em geral, após pagamento integral e conclusão do serviço, o cliente poderá utilizar os materiais finais aprovados conforme a finalidade contratada.",
      "Arquivos abertos, editáveis, fontes, projetos brutos, códigos-fonte, prompts, estruturas internas, automações ou documentos operacionais somente serão entregues se estiverem expressamente previstos na proposta, contrato ou escopo acordado.",
    ],
    bullets: [
      "Metodologias;",
      "Processos internos;",
      "Prompts;",
      "Estruturas estratégicas;",
      "Modelos de trabalho;",
      "Templates;",
      "Códigos reutilizáveis;",
      "Componentes técnicos;",
      "Sistemas internos;",
      "Estudos;",
      "Rascunhos;",
      "Materiais não aprovados;",
      "Arquivos editáveis, quando não incluídos expressamente na contratação.",
    ],
  },
  {
    title: "14. Revisões, Alterações e Escopo",
    paragraphs: [
      "Cada serviço poderá incluir ou não revisões, conforme definido em proposta, página comercial, orçamento ou contrato.",
      "Solicitações que ultrapassem o escopo contratado poderão ser consideradas alterações adicionais e poderão gerar novo orçamento.",
      "A FIRMANT poderá recusar alterações que sejam inviáveis, ilegais, antiéticas, abusivas ou incompatíveis com a qualidade e o objetivo do projeto.",
    ],
    bullets: [
      "Mudança completa de direção criativa após aprovação;",
      "Solicitação de novas peças não previstas;",
      "Alteração de briefing após início do projeto;",
      "Recriação integral de conteúdo aprovado;",
      "Inclusão de novos serviços;",
      "Aumento de volume contratado;",
      "Ajustes técnicos complexos não previstos;",
      "Integrações adicionais;",
      "Demandas urgentes não acordadas previamente.",
    ],
  },
  {
    title: "15. Limitação de Responsabilidade",
    paragraphs: [
      "A FIRMANT se compromete a prestar seus serviços com profissionalismo, estratégia, cuidado e boa-fé.",
      "Resultados em marketing, redes sociais, tecnologia, SEO, GEO, anúncios, conteúdo e presença digital podem variar conforme diversos fatores externos, incluindo mercado, oferta, concorrência, verba, frequência, qualidade do produto/serviço, reputação da marca, algoritmo das plataformas, comportamento do público e decisões do próprio cliente.",
    ],
    subsections: [
      {
        title: "A FIRMANT não garante resultados absolutos como:",
        bullets: [
          "Aumento garantido de vendas;",
          "Crescimento garantido de seguidores;",
          "Viralização de conteúdo;",
          "Aprovação por plataformas externas;",
          "Posição garantida em buscadores;",
          "Performance exata em anúncios;",
          "Retorno financeiro específico;",
          "Aceitação pública de campanhas;",
          "Resultados imediatos em redes sociais;",
          "Ausência total de erros em plataformas de terceiros.",
        ],
      },
      {
        title: "A FIRMANT também não se responsabiliza por:",
        bullets: [
          "Instabilidades em plataformas de terceiros;",
          "Falhas em redes sociais;",
          "Mudanças em algoritmos;",
          "Bloqueios ou restrições aplicados por plataformas externas;",
          "Problemas em serviços de pagamento;",
          "Indisponibilidade de hospedagem, APIs, provedores ou ferramentas de terceiros;",
          "Perda de acesso por culpa do cliente;",
          "Informações incorretas fornecidas pelo usuário;",
          "Uso indevido dos materiais entregues;",
          "Decisões comerciais tomadas exclusivamente pelo cliente.",
        ],
      },
    ],
  },
  {
    title: "16. Plataformas de Terceiros",
    paragraphs: [
      "A execução de determinados serviços pode depender de plataformas externas, como redes sociais, ferramentas de IA, hospedagem, plataformas de pagamento, ferramentas de e-mail, automação, bancos de dados, serviços de análise e outros sistemas de terceiros.",
      "A FIRMANT não controla integralmente essas plataformas e não se responsabiliza por mudanças de regras, instabilidades, falhas, limitações, bloqueios, indisponibilidades, cobranças, alterações de preço ou políticas dessas ferramentas.",
      "O usuário ou cliente reconhece que o uso dessas plataformas também estará sujeito aos termos de uso, políticas de privacidade e regras próprias de cada fornecedor.",
    ],
  },
  {
    title: "17. Comunicação com o Usuário",
    paragraphs: [
      "A FIRMANT poderá entrar em contato com o usuário por meio dos canais informados, incluindo WhatsApp, e-mail, Instagram ou outros canais autorizados pelo usuário.",
      "O usuário é responsável por fornecer canais de contato corretos e atualizados.",
    ],
    bullets: [
      "Resposta a dúvidas;",
      "Envio de proposta;",
      "Continuidade de atendimento;",
      "Confirmação de dados;",
      "Informações sobre pacote montado;",
      "Alinhamento de projeto;",
      "Cobrança ou pagamento;",
      "Atualizações sobre serviços;",
      "Comunicações comerciais;",
      "Newsletter, quando houver autorização ou base legal aplicável.",
    ],
  },
  {
    title: "18. Privacidade e Proteção de Dados",
    paragraphs: [
      "O tratamento de dados pessoais realizado pela FIRMANT é regulado pela Política de Privacidade.",
      "Ao utilizar o site, enviar dados, montar pacotes, solicitar atendimento ou contratar serviços, o usuário declara estar ciente de que seus dados poderão ser tratados conforme descrito na Política de Privacidade da FIRMANT.",
    ],
  },
  {
    title: "19. Suspensão ou Encerramento de Acesso",
    paragraphs: [
      "A FIRMANT poderá suspender, limitar ou encerrar o acesso de usuários que violem estes Termos de Uso, pratiquem atos ilícitos, enviem informações falsas, tentem comprometer a segurança do site ou utilizem os canais da FIRMANT de forma abusiva.",
    ],
    bullets: [
      "Solicitação ilegal;",
      "Conteúdo ofensivo ou discriminatório;",
      "Tentativa de fraude;",
      "Risco jurídico;",
      "Incompatibilidade com a proposta da agência;",
      "Desrespeito aos canais de atendimento;",
      "Falta de informações mínimas para execução do serviço;",
      "Histórico de inadimplência, abuso ou má-fé.",
    ],
  },
  {
    title: "20. Cancelamentos e Reembolsos",
    paragraphs: [
      "As condições de cancelamento, reembolso, desistência, interrupção de serviço ou créditos poderão variar conforme o tipo de contratação, estágio do projeto, serviço contratado, início da execução, custos envolvidos e condições comerciais acordadas.",
      "A FIRMANT poderá manter uma página específica de Política de Reembolso em /politica-de-reembolso.",
      "Em caso de conflito entre estes Termos de Uso e a Política de Reembolso, prevalecerão as regras mais específicas aplicáveis ao caso concreto, especialmente aquelas descritas em proposta, contrato ou política própria.",
    ],
  },
  {
    title: "21. Alterações nos Termos",
    paragraphs: [
      "A FIRMANT poderá alterar estes Termos de Uso periodicamente para refletir mudanças no site, nos serviços, nos processos comerciais, nas ferramentas utilizadas, nas exigências legais ou nas práticas operacionais.",
      "A data de atualização estará indicada no início da página.",
      "Recomenda-se que o usuário consulte estes Termos de Uso regularmente.",
      "O uso contínuo do site após a publicação de alterações representa concordância com a versão atualizada dos termos.",
    ],
  },
  {
    title: "22. Lei Aplicável",
    paragraphs: [
      "Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil.",
      "Eventuais controvérsias deverão ser resolvidas preferencialmente por meio de contato direto, diálogo e tentativa de solução amigável entre as partes.",
      "Não sendo possível a solução amigável, poderão ser utilizados os meios legais aplicáveis conforme a legislação brasileira.",
    ],
  },
  {
    title: "23. Canais de Contato",
    paragraphs: [
      "Em caso de dúvidas sobre estes Termos de Uso, o usuário poderá entrar em contato com a FIRMANT pelos canais oficiais.",
    ],
    bullets: [
      "E-mail: ag.firmant@gmail.com;",
      "WhatsApp: +55 11 91491-2488;",
      "Instagram: https://www.instagram.com/ag.firmant/;",
      "Facebook: https://web.facebook.com/profile.php?id=61590072505709&locale=pt_BR;",
      "Atendimento: 100% online para todo o Brasil, de segunda a sexta-feira, com retorno em até 1 dia útil.",
    ],
  },
];

const shortTexts = [
  {
    title: "Resumo dos termos",
    text: "Os Termos de Uso da FIRMANT definem as regras de acesso ao site, utilização do configurador de pacotes, solicitação de serviços, envio de informações, atendimento, contratação, pagamentos via Asaas, uso de IA, envio de arquivos, propriedade intelectual, responsabilidades do usuário e limites de responsabilidade da FIRMANT.",
  },
  {
    title: "Texto para configurador de pacotes",
    text: "Declaro que li e concordo com os Termos de Uso, a Política de Privacidade e a Política de Reembolso da FIRMANT, autorizando o uso das informações enviadas para análise da solicitação, atendimento, proposta e continuidade do contato.",
  },
];

export default function TermosDeUsoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(termsSchema).replace(/</g, "\\u003c"),
        }}
      />
      <section className="legal-hero">
        <div className="legal-shell">
          <span className="legal-kicker">Condições de uso</span>
          <h1>Termos de Uso</h1>
          <div className="legal-hero-copy">
            <p>
              Estes Termos de Uso regulam o acesso e a utilização do site da FIRMANT, bem como o relacionamento inicial entre a FIRMANT e usuários, visitantes, leads e clientes que acessam nossas páginas, utilizam o configurador de pacotes, enviam informações, entram em contato ou solicitam serviços digitais.
            </p>
            <p>
              Ao acessar o site da FIRMANT, navegar pelas páginas, utilizar recursos disponíveis, montar pacotes de serviços, enviar dados ou solicitar atendimento, o usuário declara estar ciente e de acordo com estes Termos de Uso.
            </p>
            <p>
              Caso não concorde com alguma condição aqui descrita, recomendamos que o usuário não utilize o site ou entre em contato conosco para esclarecimentos antes de prosseguir.
            </p>
          </div>
          <div className="legal-update-card">
            <span>Última atualização</span>
            <strong>{ultimaAtualizacaoTermosUso}</strong>
          </div>
        </div>
      </section>

      <section className="legal-main">
        <div className="legal-shell legal-layout">
          <aside className="legal-toc" aria-label="Resumo dos termos">
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
                A FIRMANT acredita em uma relação clara, segura e transparente com seus usuários e clientes.
              </p>
              <p>
                Estes Termos de Uso existem para organizar a utilização do site, proteger ambas as partes e estabelecer uma base objetiva para o relacionamento digital entre a FIRMANT e quem acessa, solicita, contrata ou interage com seus serviços.
              </p>
              <p>
                Ao continuar utilizando o site, o usuário declara estar ciente e de acordo com as condições aqui descritas.
              </p>
            </article>

            <section className="legal-short-grid" aria-label="Textos curtos dos termos de uso">
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
  if (value.includes("Termos de Uso") && value.includes("Política de Privacidade") && value.includes("Política de Reembolso")) {
    const [beforeTerms, afterTerms] = value.split("Termos de Uso");
    const [betweenTermsPrivacy, afterPrivacyPhrase] = afterTerms.split("Política de Privacidade");
    const [betweenPrivacyRefund, afterRefund] = afterPrivacyPhrase.split("Política de Reembolso");

    return (
      <>
        {beforeTerms}
        <Link href="/termos-de-uso">Termos de Uso</Link>
        {betweenTermsPrivacy}
        <Link href="/politica-privacidade">Política de Privacidade</Link>
        {betweenPrivacyRefund}
        <Link href="/politica-de-reembolso">Política de Reembolso</Link>
        {afterRefund}
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

  if (value.includes("Política de Reembolso")) {
    const [before, after] = value.split("Política de Reembolso");
    return (
      <>
        {before}
        <Link href="/politica-de-reembolso">Política de Reembolso</Link>
        {after}
      </>
    );
  }

  if (value.includes("/politica-de-reembolso")) {
    const [before, after] = value.split("/politica-de-reembolso");
    return (
      <>
        {before}
        <Link href="/politica-de-reembolso">/politica-de-reembolso</Link>
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
