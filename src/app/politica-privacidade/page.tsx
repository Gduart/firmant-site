import type { Metadata } from "next";

const ultimaAtualizacaoPoliticaPrivacidade = "Abril de 2026";

const title = "Política de Privacidade | FIRMANT";
const description =
  "Conheça a Política de Privacidade da FIRMANT e entenda como coletamos, usamos, armazenamos e protegemos dados pessoais em conformidade com a LGPD.";
const url = "https://firmant.com.br/politica-privacidade";

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

const privacySchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Política de Privacidade | FIRMANT",
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

type PrivacySection = {
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

const sections: PrivacySection[] = [
  {
    title: "1. Quem Somos",
    paragraphs: [
      "A FIRMANT é uma agência digital que atua com estratégia, tecnologia, conteúdo, inteligência artificial e soluções online para marcas, empresas e profissionais em crescimento.",
      "Para fins desta Política de Privacidade, a FIRMANT é considerada a controladora dos dados pessoais coletados por meio do site, canais de contato, formulários, configurador de pacotes e demais interações digitais diretamente relacionadas aos seus serviços.",
    ],
  },
  {
    title: "2. Quais Dados Podemos Coletar",
    paragraphs: [
      "A FIRMANT poderá coletar dados pessoais fornecidos diretamente pelo usuário durante o uso do site, envio de mensagens, criação de pacote, solicitação de orçamento, inscrição em newsletter ou contratação de serviços.",
    ],
    bullets: [
      "Nome;",
      "E-mail;",
      "WhatsApp;",
      "Nome do Instagram;",
      "Serviço escolhido;",
      "Orçamento informado ou faixa de investimento desejada;",
      "Mensagem enviada pelo usuário;",
      "Dados do pacote montado no site;",
      "Informações relacionadas ao projeto, briefing ou necessidade comercial;",
      "Arquivos enviados pelo usuário, quando aplicável;",
      "Dados técnicos de navegação, como endereço IP, tipo de dispositivo, navegador, páginas acessadas, origem do acesso e interações realizadas no site.",
    ],
    subsections: [
      {
        title: "A coleta poderá ocorrer quando o usuário:",
        bullets: [
          "Acessa o site da FIRMANT;",
          "Clica em botões de contato;",
          "Entra em contato pelo WhatsApp;",
          "Envia e-mail;",
          "Monta um pacote de serviços;",
          "Solicita proposta, orçamento ou atendimento;",
          "Informa dados para contratação;",
          "Assina ou demonstra interesse em newsletter;",
          "Envia arquivos, briefings, imagens, vídeos, documentos ou materiais de campanha;",
          "Interage com páginas, conteúdos, anúncios ou ferramentas integradas ao site.",
        ],
      },
    ],
  },
  {
    title: "3. Dados do Configurador de Pacotes",
    paragraphs: [
      "O site da FIRMANT poderá disponibilizar um configurador de pacotes, permitindo que o usuário selecione serviços, combine soluções, informe dados de contato e solicite atendimento ou contratação com base nas escolhas feitas.",
      "Essas informações são utilizadas para entender a necessidade do usuário, registrar o interesse, estruturar o atendimento, gerar uma proposta mais adequada e dar continuidade ao relacionamento comercial.",
    ],
    bullets: [
      "Nome;",
      "E-mail;",
      "WhatsApp;",
      "Nome do Instagram;",
      "Serviços selecionados;",
      "Itens adicionados ao pacote;",
      "Valores estimados;",
      "Orçamento informado;",
      "Mensagem complementar;",
      "Preferências ou observações sobre o projeto;",
      "Dados necessários para análise comercial e continuidade do atendimento.",
    ],
  },
  {
    title: "4. Finalidades do Uso dos Dados",
    paragraphs: [
      "Os dados coletados pela FIRMANT poderão ser utilizados para finalidades legítimas, necessárias e relacionadas à experiência, atendimento, contratação e execução dos serviços.",
      "A FIRMANT não utiliza dados pessoais para finalidades incompatíveis com aquelas informadas nesta Política de Privacidade.",
    ],
    bullets: [
      "Entrar em contato com o usuário;",
      "Responder dúvidas, solicitações e mensagens;",
      "Analisar pedidos de orçamento ou proposta;",
      "Montar, revisar ou validar pacotes de serviços;",
      "Prestar atendimento comercial;",
      "Dar continuidade a uma solicitação feita pelo usuário;",
      "Elaborar propostas personalizadas;",
      "Executar serviços contratados;",
      "Organizar demandas internas;",
      "Registrar histórico de atendimento;",
      "Melhorar a experiência do usuário no site;",
      "Medir desempenho de páginas e campanhas;",
      "Realizar análises por meio do Google Analytics 4;",
      "Enviar comunicações, novidades ou conteúdos, quando houver autorização ou base legal aplicável;",
      "Gerenciar inscrições em newsletter;",
      "Processar pagamentos por meio do Asaas, quando aplicável;",
      "Cumprir obrigações legais, regulatórias, fiscais ou contratuais;",
      "Proteger direitos da FIRMANT, de seus clientes e de terceiros;",
      "Prevenir fraudes, abusos ou usos indevidos do site e dos canais de contato.",
    ],
  },
  {
    title: "5. Uso de Inteligência Artificial",
    paragraphs: [
      "A FIRMANT utiliza inteligência artificial como apoio estratégico, criativo, analítico e operacional em seus processos internos e na prestação de determinados serviços.",
      "Quando o usuário envia informações, briefings, mensagens, conteúdos, arquivos, imagens, vídeos, materiais de campanha ou dados relacionados ao seu projeto, essas informações poderão ser analisadas com apoio de ferramentas de IA.",
      "A FIRMANT se compromete a utilizar ferramentas de IA de forma responsável, buscando preservar a confidencialidade das informações recebidas e evitando exposição indevida de dados pessoais ou materiais sensíveis.",
      "Sempre que possível, as informações utilizadas em ferramentas de IA serão limitadas ao necessário para a execução da finalidade pretendida.",
      "O uso de IA não substitui a análise humana. As decisões, orientações, entregas e validações permanecem sob responsabilidade da FIRMANT e/ou de seus responsáveis operacionais.",
    ],
    bullets: [
      "Entendimento da necessidade do cliente;",
      "Organização de briefing;",
      "Criação de ideias, textos, roteiros, estratégias e campanhas;",
      "Apoio em análise de presença digital;",
      "Desenvolvimento de soluções web, mobile ou automações;",
      "Otimização de processos;",
      "Geração de relatórios, recomendações ou direcionamentos;",
      "Produção de materiais relacionados aos serviços contratados.",
    ],
  },
  {
    title: "6. Envio de Arquivos pelo Cliente",
    paragraphs: [
      "Em determinados momentos, o usuário ou cliente poderá enviar arquivos para análise, criação, edição ou execução de serviços contratados.",
      "Os arquivos enviados serão utilizados exclusivamente para a finalidade relacionada ao atendimento, proposta, análise, execução do serviço ou continuidade do projeto.",
      "A FIRMANT recomenda que o usuário não envie dados pessoais sensíveis, documentos confidenciais de terceiros ou informações que não sejam necessárias para a execução do serviço solicitado.",
      "Caso seja necessário o envio de informações mais sensíveis, a FIRMANT poderá orientar o cliente sobre o melhor canal ou forma de compartilhamento.",
    ],
    bullets: [
      "Imagens;",
      "Vídeos;",
      "Logotipos;",
      "Identidade visual;",
      "Briefings;",
      "Documentos;",
      "Materiais de campanha;",
      "Arquivos de referência;",
      "Dados de redes sociais;",
      "Informações de produtos, serviços ou marca.",
    ],
  },
  {
    title: "7. Bases Legais para o Tratamento dos Dados",
    paragraphs: [
      "A FIRMANT poderá tratar dados pessoais com fundamento nas bases legais previstas na LGPD.",
    ],
    bullets: [
      "Execução de contrato ou procedimentos preliminares relacionados a contrato;",
      "Cumprimento de obrigação legal ou regulatória;",
      "Legítimo interesse da FIRMANT, respeitados os direitos e liberdades fundamentais do titular;",
      "Consentimento do titular, quando necessário;",
      "Exercício regular de direitos em processos administrativos, judiciais ou arbitrais;",
      "Proteção contra fraudes e segurança do titular, da FIRMANT e de terceiros.",
    ],
    subsections: [
      {
        title: "Exemplos práticos",
        bullets: [
          "Quando o usuário solicita uma proposta, tratamos dados para responder à solicitação.",
          "Quando o usuário monta um pacote, tratamos dados para registrar e analisar sua escolha.",
          "Quando há contratação, tratamos dados para executar o serviço contratado.",
          "Quando o usuário aceita cookies analíticos, podemos usar dados de navegação para melhoria do site.",
          "Quando o usuário assina a newsletter, usamos seus dados para envio de comunicações autorizadas.",
        ],
      },
    ],
  },
  {
    title: "8. Compartilhamento de Dados",
    paragraphs: [
      "A FIRMANT poderá compartilhar dados pessoais apenas quando necessário para execução de suas atividades, prestação de serviços, operação do site, atendimento ao usuário ou cumprimento de obrigações legais.",
      "A FIRMANT não vende dados pessoais.",
      "O compartilhamento, quando ocorrer, será limitado ao necessário para a finalidade pretendida e buscará respeitar os princípios de segurança, necessidade, transparência e adequação previstos na LGPD.",
    ],
    bullets: [
      "Plataformas de hospedagem e infraestrutura do site;",
      "Banco de dados utilizado para armazenamento das informações;",
      "Ferramentas de análise, como Google Analytics 4;",
      "Ferramentas de envio de e-mails e comunicações;",
      "Plataforma de newsletter, como Brevo;",
      "Plataforma de pagamento, como Asaas;",
      "Ferramentas de automação, quando aplicável;",
      "Prestadores de serviços técnicos, operacionais ou administrativos;",
      "Autoridades públicas, quando houver obrigação legal;",
      "Plataformas de anúncios e mensuração, caso sejam utilizadas futuramente, como Meta Pixel, TikTok Pixel, Google Ads Tag ou tecnologias semelhantes.",
    ],
  },
  {
    title: "9. Pagamentos via Asaas",
    paragraphs: [
      "A FIRMANT poderá utilizar o Asaas como plataforma de pagamento para emissão de cobranças, links de pagamento, boletos, Pix, cartão de crédito ou outros meios disponibilizados pela plataforma.",
      "Ao realizar pagamentos por meio do Asaas, o usuário poderá ser direcionado para ambiente próprio da plataforma ou ter seus dados tratados conforme os fluxos técnicos necessários para processamento da cobrança.",
      "A FIRMANT poderá compartilhar com o Asaas dados necessários para viabilizar a cobrança, como nome, e-mail, telefone, valor do serviço, identificação da contratação e demais informações exigidas para processamento do pagamento.",
      "O tratamento de dados realizado diretamente pelo Asaas seguirá também as políticas, termos e práticas de privacidade da própria plataforma.",
      "A FIRMANT não armazena dados completos de cartão de crédito em seus próprios sistemas, salvo se futuramente houver integração técnica específica e segura que justifique tal tratamento, sempre observando as normas aplicáveis.",
    ],
  },
  {
    title: "10. Cookies e Tecnologias de Rastreamento",
    paragraphs: [
      "O site da FIRMANT poderá utilizar cookies e tecnologias semelhantes para melhorar a experiência do usuário, medir desempenho, entender a navegação e apoiar estratégias de comunicação e marketing.",
      "Cookies são pequenos arquivos armazenados no dispositivo do usuário quando ele acessa um site.",
      "O usuário poderá gerenciar ou bloquear cookies diretamente nas configurações do navegador. No entanto, a desativação de determinados cookies poderá afetar a experiência de navegação ou limitar funcionalidades do site.",
      "Quando necessário, a FIRMANT poderá exibir banner de cookies ou mecanismo de consentimento para permitir que o usuário gerencie suas preferências.",
    ],
    subsections: [
      {
        title: "Cookies necessários",
        text: "Essenciais para funcionamento básico do site, navegação, segurança e recursos técnicos.",
      },
      {
        title: "Cookies de análise",
        text: "Utilizados para entender como os visitantes interagem com o site, quais páginas acessam, origem do tráfego, tempo de permanência e comportamento geral de navegação. Para isso, a FIRMANT poderá utilizar Google Analytics 4.",
      },
      {
        title: "Cookies de marketing",
        text: "Poderão ser utilizados futuramente para mensuração de campanhas, remarketing, anúncios e análise de performance em plataformas como Google Ads, Meta, TikTok ou outras ferramentas semelhantes.",
      },
      {
        title: "Cookies de preferência",
        text: "Podem ser utilizados para lembrar escolhas do usuário, como preferências de navegação ou configurações de experiência.",
      },
    ],
  },
  {
    title: "11. Google Analytics 4 e Métricas de Navegação",
    paragraphs: [
      "A FIRMANT utiliza ou poderá utilizar Google Analytics 4 para compreender melhor o desempenho do site, comportamento dos visitantes, origem dos acessos, páginas mais visualizadas e interações realizadas.",
      "Essas informações são utilizadas para melhorar o site, avaliar campanhas, aprimorar conteúdos, identificar problemas técnicos e tornar a experiência do usuário mais eficiente.",
      "Sempre que possível, a análise será realizada de forma agregada ou estatística, sem o objetivo de identificar individualmente o usuário.",
    ],
    bullets: [
      "Páginas acessadas;",
      "Tempo de permanência;",
      "Cliques e interações;",
      "Tipo de dispositivo;",
      "Navegador utilizado;",
      "Localização aproximada;",
      "Origem do tráfego;",
      "Eventos de navegação;",
      "Dados técnicos agregados.",
    ],
  },
  {
    title: "12. Newsletter e Comunicações",
    paragraphs: [
      "A FIRMANT poderá disponibilizar newsletter, lista de e-mails ou comunicações periódicas com conteúdos sobre inteligência artificial, marketing digital, redes sociais, vídeos curtos, automação, GEO, tecnologia, estratégias digitais e novidades da marca.",
      "Para isso, poderemos coletar dados como nome e e-mail.",
      "A plataforma Brevo poderá ser utilizada para gerenciamento e envio dessas comunicações.",
      "O usuário poderá cancelar o recebimento de e-mails a qualquer momento, utilizando o link de descadastro disponível nas mensagens ou entrando em contato com a FIRMANT pelos canais oficiais.",
      "A FIRMANT se compromete a não enviar comunicações excessivas, enganosas ou incompatíveis com o interesse manifestado pelo usuário.",
    ],
  },
  {
    title: "13. Ferramentas de Marketing e Pixels",
    paragraphs: [
      "A FIRMANT poderá utilizar, atualmente ou futuramente, ferramentas de mensuração, anúncios, remarketing e análise de campanhas.",
      "Essas tecnologias podem coletar dados de navegação, eventos, páginas visitadas, cliques e interações para medir campanhas, melhorar anúncios, criar públicos personalizados ou entender a efetividade das ações de marketing.",
      "Caso essas ferramentas sejam ativadas, seu uso deverá respeitar a legislação aplicável, as configurações de consentimento quando necessárias e as políticas das respectivas plataformas.",
    ],
    bullets: [
      "Google Ads Tag;",
      "Meta Pixel;",
      "TikTok Pixel;",
      "Google Tag Manager;",
      "Outras plataformas de mídia, anúncios ou análise de performance.",
    ],
  },
  {
    title: "14. Armazenamento dos Dados",
    paragraphs: [
      "Os dados coletados pelo site da FIRMANT poderão ser armazenados em banco de dados próprio ou contratado, ferramentas de infraestrutura, sistemas de atendimento, plataformas de e-mail, ferramentas de automação e demais soluções necessárias à operação.",
      "A FIRMANT adotará medidas razoáveis de segurança para proteger os dados contra acessos não autorizados, perda, alteração, uso indevido, divulgação indevida ou destruição.",
      "Quando os dados deixarem de ser necessários, poderão ser excluídos, anonimizados ou mantidos apenas quando houver base legal adequada para conservação.",
    ],
    bullets: [
      "Atendimento a solicitações;",
      "Execução de serviços;",
      "Cumprimento de contratos;",
      "Obrigações legais, fiscais ou regulatórias;",
      "Histórico de relacionamento;",
      "Segurança e prevenção de fraudes;",
      "Exercício regular de direitos.",
    ],
  },
  {
    title: "15. Segurança dos Dados",
    paragraphs: [
      "A FIRMANT se compromete a adotar medidas técnicas, administrativas e organizacionais razoáveis para proteger os dados pessoais tratados em suas operações.",
      "Apesar dos esforços de segurança, nenhum sistema é totalmente imune a riscos. Por isso, o usuário também deve adotar boas práticas, como não compartilhar dados desnecessários, evitar envio de informações sensíveis sem necessidade e utilizar canais oficiais de atendimento.",
    ],
    bullets: [
      "Uso de sistemas protegidos;",
      "Controle de acesso;",
      "Armazenamento em banco de dados;",
      "Boas práticas de segurança digital;",
      "Restrição de acesso apenas a pessoas autorizadas;",
      "Monitoramento de recursos técnicos quando aplicável;",
      "Uso de plataformas reconhecidas no mercado;",
      "Cuidados no compartilhamento de arquivos e informações.",
    ],
  },
  {
    title: "16. Retenção e Exclusão de Dados",
    paragraphs: [
      "Os dados pessoais serão mantidos pelo tempo necessário para cumprir as finalidades descritas nesta Política de Privacidade, respeitando prazos legais, contratuais, fiscais, regulatórios ou de legítimo interesse.",
      "O usuário poderá solicitar a exclusão de seus dados pessoais, observadas as hipóteses em que a FIRMANT poderá manter determinadas informações para finalidades legítimas ou obrigações aplicáveis.",
      "Quando aplicável, os dados poderão ser anonimizados em vez de excluídos, especialmente para fins estatísticos, históricos ou de melhoria de processos.",
    ],
    bullets: [
      "Cumprimento de obrigação legal ou regulatória;",
      "Execução de contrato;",
      "Prestação de contas;",
      "Exercício regular de direitos;",
      "Prevenção de fraude;",
      "Proteção da FIRMANT, do usuário ou de terceiros;",
      "Guarda de registros exigidos por lei.",
    ],
  },
  {
    title: "17. Direitos do Titular dos Dados",
    paragraphs: [
      "Nos termos da LGPD, o titular dos dados pessoais poderá solicitar à FIRMANT o exercício de seus direitos.",
      "Para exercer seus direitos, o titular poderá entrar em contato pelo e-mail ag.firmant@gmail.com.",
      "A FIRMANT poderá solicitar informações adicionais para confirmar a identidade do solicitante e garantir a segurança do processo.",
    ],
    bullets: [
      "Confirmação da existência de tratamento de dados;",
      "Acesso aos dados pessoais tratados;",
      "Correção de dados incompletos, inexatos ou desatualizados;",
      "Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD;",
      "Portabilidade dos dados, quando aplicável;",
      "Informação sobre compartilhamento de dados;",
      "Revogação do consentimento, quando o tratamento for baseado em consentimento;",
      "Eliminação dos dados tratados com base no consentimento, observadas as exceções legais;",
      "Revisão de decisões automatizadas, quando aplicável;",
      "Oposição ao tratamento, quando houver fundamento legal para isso.",
    ],
  },
  {
    title: "18. Dados de Crianças e Adolescentes",
    paragraphs: [
      "Os serviços da FIRMANT são direcionados a empresas, marcas, profissionais, empreendedores e pessoas capazes de contratar ou solicitar serviços digitais.",
      "A FIRMANT não tem como objetivo coletar intencionalmente dados de crianças ou adolescentes.",
      "Caso seja identificado o envio indevido de dados de menores de idade, a FIRMANT poderá excluir tais informações, salvo quando houver base legal adequada, autorização dos responsáveis legais ou necessidade justificada para execução de alguma finalidade legítima.",
    ],
  },
  {
    title: "19. Links Externos",
    paragraphs: [
      "O site da FIRMANT poderá conter links para plataformas externas, como WhatsApp, Instagram, Asaas, ferramentas de pagamento, ferramentas de newsletter, redes sociais ou outros sites de terceiros.",
      "A FIRMANT não se responsabiliza pelas práticas de privacidade, segurança ou conteúdo de sites e plataformas de terceiros.",
      "Ao acessar ambientes externos, o usuário deverá consultar as respectivas políticas de privacidade e termos de uso dessas plataformas.",
    ],
  },
  {
    title: "20. Transferência Internacional de Dados",
    paragraphs: [
      "Algumas ferramentas utilizadas pela FIRMANT ou por seus prestadores de serviços podem armazenar ou processar dados em servidores localizados fora do Brasil.",
      "Isso pode ocorrer, por exemplo, com ferramentas de análise, hospedagem, e-mail, automação, inteligência artificial, newsletter, armazenamento, métricas e marketing.",
      "Quando houver transferência internacional de dados, a FIRMANT buscará utilizar plataformas que adotem padrões adequados de segurança e proteção de dados, observando os requisitos previstos na legislação aplicável.",
    ],
  },
  {
    title: "21. Alterações nesta Política",
    paragraphs: [
      "A FIRMANT poderá atualizar esta Política de Privacidade periodicamente para refletir mudanças legais, técnicas, operacionais, comerciais ou de funcionamento do site.",
      "A data de atualização estará indicada no início desta página.",
      "Recomenda-se que o usuário consulte esta política regularmente para se manter informado sobre como seus dados são tratados.",
      "Caso alterações relevantes sejam realizadas, a FIRMANT poderá adotar medidas razoáveis para comunicar os usuários, quando necessário.",
    ],
  },
  {
    title: "22. Canal de Contato sobre Privacidade",
    paragraphs: [
      "Caso tenha dúvidas sobre esta Política de Privacidade, tratamento de dados pessoais ou queira exercer seus direitos como titular, entre em contato com a FIRMANT pelos canais oficiais.",
    ],
    bullets: [
      "E-mail: ag.firmant@gmail.com;",
      "WhatsApp: +55 11 91491-2488;",
      "Instagram: https://www.instagram.com/ag.firmant/;",
      "Facebook: https://web.facebook.com/profile.php?id=61590072505709&locale=pt_BR;",
      "Atendimento: online para todo o Brasil, de segunda a sexta-feira, com retorno em até 1 dia útil.",
    ],
  },
];

const shortTexts = [
  {
    title: "Resumo da política",
    text: "A FIRMANT respeita a privacidade dos usuários e trata dados pessoais conforme a LGPD. Podemos coletar informações como nome, e-mail, WhatsApp, nome do Instagram, serviço escolhido, orçamento, mensagem, dados do pacote montado e arquivos enviados pelo cliente para atendimento, análise, execução de serviços e melhoria da experiência.",
  },
  {
    title: "Texto para configurador de pacotes",
    text: "Ao enviar meus dados, declaro que li e concordo com a Política de Privacidade da FIRMANT e autorizo o uso das informações fornecidas para análise da solicitação, atendimento, elaboração de proposta e continuidade do contato.",
  },
  {
    title: "Texto para newsletter",
    text: "Ao se cadastrar, você concorda em receber comunicações da FIRMANT sobre IA, marketing digital, redes sociais, automação, tecnologia e estratégias digitais. Você poderá cancelar o recebimento a qualquer momento.",
  },
  {
    title: "Texto para cookies",
    text: "Utilizamos cookies para melhorar sua experiência, analisar o tráfego do site e, futuramente, apoiar ações de marketing. Você pode gerenciar suas preferências ou consultar nossa Política de Privacidade para saber mais.",
  },
];

export default function PoliticaPrivacidadePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(privacySchema).replace(/</g, "\\u003c"),
        }}
      />
      <section className="legal-hero">
        <div className="legal-shell">
          <span className="legal-kicker">LGPD e transparência</span>
          <h1>Política de Privacidade</h1>
          <div className="legal-hero-copy">
            <p>A sua privacidade é importante para a FIRMANT.</p>
            <p>
              Esta Política de Privacidade explica como coletamos, utilizamos, armazenamos, protegemos e tratamos os dados pessoais de visitantes, leads, clientes e usuários que acessam o site da FIRMANT, entram em contato conosco, montam pacotes de serviços, solicitam propostas, assinam comunicações ou contratam soluções digitais oferecidas pela marca.
            </p>
            <p>
              A FIRMANT atua com soluções digitais, gestão de redes sociais com IA, produção de vídeos, UGC com inteligência artificial, desenvolvimento web/mobile, GEO, automação, consultoria em IA e serviços relacionados. Por isso, prezamos por uma relação transparente, segura e responsável com os dados pessoais recebidos.
            </p>
            <p>
              Esta política foi elaborada com base nos princípios da Lei Geral de Proteção de Dados Pessoais - LGPD, Lei nº 13.709/2018.
            </p>
          </div>
          <div className="legal-update-card">
            <span>Última atualização</span>
            <strong>{ultimaAtualizacaoPoliticaPrivacidade}</strong>
          </div>
        </div>
      </section>

      <section className="legal-main">
        <div className="legal-shell legal-layout">
          <aside className="legal-toc" aria-label="Resumo da política">
            <span className="legal-kicker">Nesta página</span>
            {sections.slice(0, 8).map((section) => (
              <a key={section.title} href={`#${slugify(section.title)}`}>
                {section.title}
              </a>
            ))}
            <a href="#contato-privacidade">Contato sobre privacidade</a>
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
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets && <BulletList items={section.bullets} />}
                {section.subsections?.map((subsection) => (
                  <div key={subsection.title} className="legal-subsection">
                    <h3>{subsection.title}</h3>
                    {subsection.text && <p>{subsection.text}</p>}
                    {subsection.bullets && <BulletList items={subsection.bullets} />}
                  </div>
                ))}
              </article>
            ))}

            <article id="contato-privacidade" className="legal-card legal-final-card">
              <h2>Declaração de Transparência</h2>
              <p>
                A FIRMANT acredita que tecnologia, inteligência artificial e estratégia digital devem caminhar com responsabilidade, transparência e respeito aos dados pessoais.
              </p>
              <p>
                Nosso compromisso é utilizar as informações recebidas apenas para finalidades legítimas, necessárias e relacionadas ao atendimento, prestação de serviços, melhoria da experiência e relacionamento com nossos clientes e usuários.
              </p>
              <p>
                A confiança é parte central da relação entre a FIRMANT e seus clientes. Por isso, buscamos tratar dados pessoais de forma cuidadosa, segura e coerente com os princípios da LGPD.
              </p>
            </article>

            <section className="legal-short-grid" aria-label="Textos curtos de privacidade">
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
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
