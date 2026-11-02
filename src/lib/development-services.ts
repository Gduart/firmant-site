export type BriefingField = { key: string; label: string; hint?: string; required?: boolean; options?: string[] };
export type ServiceTable = { title: string; columns: string[]; rows: string[][] };
export type DevelopmentService = {
  slug: string; title: string; shortTitle: string; summary: string; outcome: string;
  paragraphs: string[]; highlights: string[]; tables: ServiceTable[]; fields: BriefingField[];
};
const rows = (text: string) => text.trim().split("\n").map(line => line.split("|").map(cell => cell.trim()));
const nicheTable = (title: string, text: string): ServiceTable => ({ title, columns: ["Nicho", "Solução", "O que faz"], rows: rows(text) });

export const developmentServices: DevelopmentService[] = [
  {
    slug: "automacao-de-processos", title: "Automação de processos", shortTitle: "Rotinas que trabalham por você",
    summary: "Confirmações, lembretes, cobranças e documentos pelo WhatsApp, conectados à rotina da sua empresa.",
    outcome: "Menos tarefas repetitivas. Mais tempo para atender bem.",
    paragraphs: ["Automatizamos as tarefas repetitivas da sua empresa no WhatsApp: confirmações, lembretes, cobranças, avisos e coleta de documentos. As mensagens seguem os eventos e horários definidos para a sua operação, enquanto sua equipe fica livre para atender quem precisa.", "Cada fluxo é definido a partir do seu processo atual, com regras de envio, resposta, exceções e encaminhamento para a equipe. As integrações e os recursos contratados ficam descritos na proposta."],
    highlights: ["Confirmações e lista de espera", "Retornos e reativação", "Resposta e distribuição de leads", "Cobranças, status e documentos"],
    tables: [{ title: "Automações disponíveis", columns: ["Tipo de serviço", "Como ajuda sua empresa", "Exemplos por nicho"], rows: rows(`Confirmação de agendamento anti-falta | Aviso ao marcar, pedido de confirmação e lembrete antes do horário. O cliente confirma ou solicita remarcação. | Clínicas: consultas e estética. Imobiliárias: visitas ao imóvel e feedback posterior.
Lista de espera inteligente | Quando alguém cancela, o horário é oferecido às pessoas da fila, conforme as regras de prioridade. | Clínicas: encaixe de pacientes.
Lembretes de retorno e recorrência | Lembra o cliente de retornar no momento definido, sem depender de planilhas manuais. | Clínicas: limpeza a cada 6 meses, manutenção de aparelho e sessões. Oficinas: revisão por data ou quilometragem informada.
Reativação de clientes inativos | Aciona contatos que deixaram de utilizar o serviço, conforme o histórico disponível. | Academias: aluno sem check-in há 15 dias.
Pesquisa de satisfação e avaliações no Google | Coleta a avaliação do atendimento e convida clientes a registrar uma experiência genuína no Google, sem selecionar apenas notas altas. | Clínicas: pós-consulta. Oficinas e academias: experiência de atendimento.
Resposta e distribuição de leads | Responde ao contato e encaminha ao vendedor responsável, com regras de rodízio e repasse se não houver retorno. | Imobiliárias: contatos de ZAP, VivaReal e OLX, mediante integração disponível, distribuídos entre corretores.
Cobrança automática e envio de guias | Envia boletos, Pix e guias, com lembretes antes e depois do vencimento. | Contabilidade: DAS, guias e honorários. Academias: mensalidades em D-3, D0, D+3 e D+7.
Avisos de status e coleta de documentos | Informa etapas, solicita arquivos pelo WhatsApp e organiza os documentos no destino definido. | Contabilidade: checklist mensal. Advocacia: movimentação revisada pelo advogado. Oficinas: aprovação de orçamento e aviso de carro pronto.`) }],
    fields: [
      { key: "routines", label: "Quais rotinas você quer automatizar?", required: true, hint: "Ex.: confirmações, lista de espera, cobranças ou documentos." },
      { key: "currentProcess", label: "Como essas tarefas são feitas hoje?", required: true },
      { key: "tools", label: "Quais agendas, sistemas ou planilhas sua equipe utiliza?" },
      { key: "volume", label: "Qual o volume aproximado de contatos ou mensagens por mês?" },
      { key: "rules", label: "Quais regras, horários e exceções precisam ser respeitados?" },
    ],
  },
  {
    slug: "agente-ia-telegram", title: "Automação + 1 agente de IA no Telegram", shortTitle: "Atendimento com contexto",
    summary: "Um assistente com as informações do seu negócio para atender, qualificar, agendar e encaminhar contatos à equipe.",
    outcome: "Atendimento organizado, do primeiro contato ao próximo passo.",
    paragraphs: ["Seu atendente com IA no Telegram, preparado para atender de forma contínua, por texto ou áudio, usando os serviços, preços, políticas e perguntas frequentes do seu negócio. Quando não houver informação suficiente, o fluxo deve pedir esclarecimentos ou encaminhar à equipe.", "O agente faz perguntas para qualificar cada contato — interesse, orçamento e urgência — e registra as respostas no CRM ou na planilha, com a origem do lead. Pode consultar o Google Agenda, apresentar horários disponíveis, confirmar o agendamento e permitir remarcação ou cancelamento.", "Também pode receber fotos, PDFs, documentos e áudios, organizar os dados e enviar um link de pagamento por Pix ou cartão para sinal ou reserva. Quando a conversa exigir uma pessoa, encaminha o atendimento com um resumo do contexto.", "Confirmações, lembretes e follow-up dão continuidade ao atendimento. Os recursos, integrações, horários de transferência e regras do agente são definidos no escopo. O cliente precisa iniciar a conversa com o bot no Telegram para esse fluxo de atendimento."],
    highlights: ["Texto, áudio e base do negócio", "Agenda, remarcação e cancelamento", "Qualificação, arquivos e CRM", "Pagamentos, lembretes e equipe humana"],
    tables: [
      { title: "Recursos disponíveis", columns: ["Recurso", "Como funciona no Telegram"], rows: rows(`Agendamento | Consulta o Google Agenda, apresenta horários livres em botões e cria o evento após conferir a disponibilidade.
Remarcar e cancelar | Botões de Confirmar, Remarcar e Cancelar associados ao agendamento.
Base de conhecimento (RAG) | Usa a tabela de preços, os serviços e as políticas aprovadas pelo cliente como referência.
Leitura de arquivos | Recebe fotos, PDFs e áudios, com transcrição quando prevista no projeto.
Qualificação | Coleta campos estruturados e envia ao CRM ou à planilha com a origem do contato.
Transferência para humano | Encaminha o contexto e o resumo à equipe, por grupo interno ou Chatwoot integrado.
Régua automática | Lembretes D-1/H-2 e follow-up D+1/D+3 para quem não concluiu, conforme as regras acordadas.
Pagamento | Envia link de Pix ou cartão, integrado a Mercado Pago ou Asaas, para sinal ou reserva.`) },
      nicheTable("Saúde e bem-estar", `Clínicas médicas | Recepcionista IA | Informa especialidades, convênios e preparo aprovado de exames; apresenta horários e agenda consultas.
Odontologia | Recepcionista e retorno | Agenda avaliações, oferece horários liberados e lembra retornos, como limpeza a cada 6 meses.
Estética | Pré-venda de procedimentos | Qualifica procedimento, orçamento e urgência; informa a faixa aprovada e agenda avaliação com sinal via Pix.
Psicologia e terapias | Agendador de sessões | Agenda e remarca sessões, acompanha pacotes e envia o link da sessão online, com acesso adequado aos dados.
Veterinárias e pet shops | Atendente Pet | Agenda banho, tosa e consultas; lembra vacinas e vermífugos conforme orientações cadastradas.
Nutrição e personal | Assistente de acompanhamento | Agenda retornos, recebe check-ins e fotos e envia o plano definido pelo profissional.`),
      nicheTable("Vendas consultivas", `Imobiliárias | SDR imobiliário | Identifica compra ou aluguel, região, faixa de valor e financiamento; apresenta imóveis com fotos e agenda visitas.
Energia solar | Pré-orçamentista solar | Recebe a conta de luz, coleta dados para estimativa de sistema e economia e agenda visita técnica para validação.
Lojas de veículos | Consultor de estoque | Mostra veículos por faixa de preço, apresenta simulações autorizadas e agenda test drive.
Seguros e consórcios | Cotador inicial | Coleta dados para cotação, apresenta opções aprovadas e agenda conversa com o corretor.`),
      nicheTable("Serviços profissionais", `Advocacia | Triagem jurídica | Identifica área, coleta fatos e documentos e agenda consulta com resumo para o advogado; não emite parecer jurídico.
Contabilidade | Atendente de primeiro nível | Informa prazos e status, recebe notas e documentos e encaminha ao setor correto.
Consultorias e agências | Agendador de diagnóstico | Qualifica porte, necessidade e verba e agenda reunião de diagnóstico.`),
      nicheTable("Serviços locais", `Oficinas mecânicas | Orçamentista | Recebe fotos e descrição do problema, apresenta faixa preliminar cadastrada e agenda avaliação.
Assistência técnica | Triagem de reparo | Identifica o problema relatado, informa faixa cadastrada e responde sobre o andamento do conserto.
Salões e barbearias | Agendador por profissional | Apresenta horários por serviço e profissional e confirma a escolha.
Academias e studios | Consultor de matrícula | Apresenta planos e horários, agenda aula experimental e acompanha interessados.
Limpeza, dedetização e reformas | Orçamentista de visita | Coleta metragem e fotos, informa estimativa cadastrada e agenda visita da equipe.`),
      nicheTable("Hospitalidade e eventos", `Restaurantes | Assistente de reservas | Reserva mesa por horário e número de pessoas e confirma no dia.
Pousadas e hotéis | Concierge de reservas | Consulta disponibilidade, envia cotação e link de pagamento do sinal.
Buffets e eventos | Pré-venda de eventos | Qualifica data, convidados e pacote e agenda visita ou degustação.`),
      nicheTable("Educação e negócios digitais", `Cursos e infoprodutos | Suporte e vendas | Esclarece dúvidas, acompanha carrinhos abandonados e integra a liberação de acesso após confirmação do pagamento.
Mentorias | Agendador de aplicação | Qualifica candidatos e agenda a conversa de aplicação com o mentor.
Escolas e idiomas | Assistente de matrícula | Aplica questionário de nível, agenda aula experimental e acompanha rematrículas.
Comunidades e grupos VIP | Gestor de comunidade | Recebe membros, confere assinaturas e gerencia acesso conforme o pagamento e as regras do grupo.`),
    ],
    fields: [
      { key: "agentTasks", label: "O que o agente precisa resolver no atendimento?", required: true },
      { key: "knowledge", label: "Quais materiais sobre serviços, preços e políticas já estão disponíveis?", required: true },
      { key: "integrations", label: "Precisa de agenda, CRM, planilha ou pagamento? Quais ferramentas?" },
      { key: "handoff", label: "Quando e para quem o agente deve transferir o atendimento?" },
      { key: "volume", label: "Quantos contatos recebe por mês? Já possui um bot no Telegram?" },
    ],
  },
  {
    slug: "sistemas-web-sob-medida", title: "Sistemas e aplicações web sob medida", shortTitle: "Sua operação em um só lugar",
    summary: "Um sistema no navegador, com seus processos, acessos, integrações e indicadores, adaptado à sua empresa.",
    outcome: "Menos controles espalhados. Mais clareza para decidir.",
    paragraphs: ["Um sistema desenvolvido para os fluxos da sua empresa. Substitua planilhas espalhadas, cadernos e ferramentas que atendem apenas parte da operação por uma aplicação com suas regras de trabalho e seus relatórios.", "O acesso acontece pelo navegador, no computador e no celular, sem instalação obrigatória. Cada pessoa pode ter login próprio e permissões adequadas ao seu papel. As integrações podem conectar Google Agenda, WhatsApp ou Telegram, pagamentos, emissão fiscal e ERP, conforme a disponibilidade e o escopo.", "A solução também pode incorporar IA para apoiar a leitura de documentos, a geração de textos e resumos. Painéis organizam vendas, atendimentos, produtividade e inadimplência, com atualização conforme as fontes integradas.", "Propriedade do código e dos dados, hospedagem, controles de segurança, backup, requisitos de privacidade e suporte são definidos na proposta. O objetivo é reduzir retrabalho e erros manuais e apoiar decisões com informação organizada."],
    highlights: ["Fluxos e regras da sua empresa", "Logins e permissões por perfil", "Integrações e recursos de IA", "Painéis, relatórios e evolução"],
    tables: [
      nicheTable("Saúde e bem-estar", `Clínicas e consultórios | Gestão de clínica | Agenda por profissional, prontuário conforme requisitos do projeto, convênios e painel de faturamento.
Estética | Gestão de procedimentos e pacotes | Sessões de pacotes, fotos de evolução, termos assinados e comissões.
Academias e studios | Gestão de alunos | Matrículas, planos, cobrança recorrente, check-in e alertas de ausência.
Nutrição e personal | Portal do aluno ou paciente | Plano, evolução, check-ins e mensagens com o profissional.`),
      nicheTable("Imóveis e projetos", `Imobiliárias | Portal e CRM de imóveis | Busca de imóveis, funil por corretor e controle de visitas e propostas.
Construtoras e reformas | Gestão de obras | Cronograma, compras, custos, diário com fotos e área do cliente.
Condomínios e administradoras | Portal do condomínio | Reservas de áreas comuns, comunicados, ocorrências e boletos.
Energia solar | Gestão de projetos solares | Orçamentos, propostas em PDF, instalação e pós-venda.`),
      nicheTable("Serviços profissionais", `Advocacia | Gestão de processos | Casos, prazos com alertas, documentos e área de acompanhamento do cliente.
Contabilidade | Portal do cliente contábil | Documentos, guias, obrigações com prazo e chamados por setor.
Consultorias e agências | Gestão de projetos e clientes | Tarefas, horas por cliente, aprovações e relatórios de entrega.`),
      nicheTable("Operação e comércio", `Oficinas e assistências | Ordem de serviço digital | OS com fotos, orçamento aprovado online, status de reparo e histórico.
Serviços em domicílio | Gestão de equipes em campo | Rotas, agenda, checklist com fotos e assinatura pelo celular.
Salões e barbearias | Agenda e gestão | Agendamento online, comissões, estoque e fidelidade.
Distribuidoras e comércio | Pedidos e estoque | Catálogo para vendedores, pedidos pelo celular, estoque e painel de vendas.`),
      nicheTable("Hospitalidade e eventos", `Restaurantes | Cardápio digital e pedidos | Pedidos por mesa ou delivery próprio e painel da cozinha; custos de infraestrutura e pagamento definidos no projeto.
Pousadas | Reservas diretas | Reservas no próprio site, pagamento e calendário, sem depender de marketplace de hospedagem.
Buffets e eventos | Gestão de eventos | Contratos, pacotes, checklist, fornecedores e parcelas.`),
      nicheTable("Educação e produtos digitais", `Cursos e infoprodutos | Área de membros própria | Plataforma da marca com aulas, certificados e comunidade, com integrações definidas no escopo.
Escolas e idiomas | Gestão escolar | Matrículas, turmas, frequência, notas, mensalidades e portal dos pais.
Mentorias | Portal da mentoria | Trilhas, tarefas, gravações e acompanhamento da evolução dos mentorados.
SaaS e startups | MVP sob medida | Primeira versão de um produto para validar a ideia com clientes reais.`),
    ],
    fields: [
      { key: "workflow", label: "Qual processo o sistema deve organizar?", required: true },
      { key: "features", label: "Quais funcionalidades são essenciais na primeira entrega?", required: true },
      { key: "users", label: "Quem vai usar o sistema? Quantas pessoas e quais permissões?" },
      { key: "integrations", label: "Quais sistemas, pagamentos ou ferramentas precisam se conectar?" },
      { key: "dataReports", label: "Há dados para importar? Quais relatórios e indicadores são necessários?" },
    ],
  },
  {
    slug: "landing-page-ia-mini-crm", title: "Landing Page de Conversão + Assistente IA no Telegram + Mini CRM", shortTitle: "Da campanha ao acompanhamento",
    summary: "Página, atendimento e gestão de contatos conectados para dar um próximo passo a cada oportunidade.",
    outcome: "Sua oferta, o atendimento e os leads no mesmo fluxo.",
    paragraphs: ["Uma página para apresentar sua oferta, um assistente com IA para conduzir o atendimento e um Mini CRM para organizar os contatos. Criamos uma landing page com textos, identidade visual e provas reais disponibilizadas pela sua empresa, focada em um objetivo claro e preparada para uso no celular e em campanhas de Google Ads e Meta Ads.", "O visitante pode seguir para o assistente no Telegram e iniciar a conversa. O agente usa as informações do negócio, qualifica interesse, orçamento e urgência, agenda no Google Agenda e pode enviar link de pagamento por Pix ou cartão. Quando necessário, encaminha o contato à equipe com o resumo da conversa.", "O Mini CRM registra nome, contato, status e resumo do atendimento. Você acompanha quem é novo, qualificado, agendado ou pago, com próximos passos visíveis. Follow-ups seguem as regras definidas para os contatos que ainda não concluíram.", "O objetivo é conectar os cliques da campanha às conversas e ao acompanhamento comercial, sem depender de planilhas ou da memória da equipe. A campanha de anúncios, os custos das plataformas e os recursos incluídos no combo serão especificados na proposta."],
    highlights: ["Landing page com a identidade da marca", "Qualificação e agenda no Telegram", "Mini CRM com status e resumo", "Follow-up e passagem para a equipe"],
    tables: [
      { title: "Problemas que o combo ajuda a resolver", columns: ["Problema comum", "Como o combo atua"], rows: rows(`Contato aguardando retorno após preencher formulário | Atendimento pelo assistente após o visitante iniciar a conversa no Telegram.
Equipe gastando tempo sem contexto | Qualificação inicial e resumo antes do atendimento humano.
Interessado que vai pensar e não retorna | Follow-up automático conforme as regras da operação.
Contatos espalhados em planilhas e conversas | Registro dos leads no Mini CRM, com status e resumo.
Falta de clareza sobre em quem focar | Etapas comerciais e próximos passos visíveis.`) },
      { title: "Aplicações por nicho", columns: ["Nicho", "Landing page", "O assistente faz"], rows: rows(`Estética | Página de um procedimento | Qualifica, agenda avaliação e envia link para sinal via Pix.
Odontologia | Página de implante ou alinhador | Qualifica, agenda avaliação e acompanha interessados.
Clínicas | Página por especialidade | Esclarece dúvidas aprovadas e agenda consulta.
Academias e studios | Página de aula experimental | Agenda aula e acompanha o interesse até a matrícula.
Imobiliárias | Página do empreendimento | Qualifica orçamento e urgência e agenda visita.
Energia solar | Página de economia de energia | Qualifica o contato e agenda visita técnica.
Advocacia | Página por área de atuação | Faz triagem inicial e agenda consulta, com conteúdo sujeito à validação profissional e às regras aplicáveis.
Contabilidade | Página de abertura de empresa | Qualifica e agenda reunião.
Consultorias e agências | Página de diagnóstico | Qualifica porte e verba e agenda conversa.
Reformas e serviços locais | Página de orçamento | Qualifica o serviço e agenda visita.
Pousadas | Página de pacote | Esclarece dúvidas e envia link para o sinal.
Buffets e eventos | Página de festa ou casamento | Qualifica data e convidados e agenda degustação.
Infoprodutos | Página de venda | Responde dúvidas e objeções com a base aprovada, envia link de pagamento e faz follow-up.
Mentorias | Página de aplicação | Qualifica candidatos e agenda conversa.
Escolas e idiomas | Página de matrícula | Agenda aula experimental e faz acompanhamento.`) },
    ],
    fields: [
      { key: "offer", label: "Qual produto, serviço ou oferta a página vai apresentar?", required: true },
      { key: "audience", label: "Quem é o público e qual ação você quer que ele realize?", required: true },
      { key: "assets", label: "Já possui identidade visual, fotos, textos e provas reais da oferta?" },
      { key: "traffic", label: "De onde virão os visitantes? Já faz anúncios?" },
      { key: "salesFlow", label: "Quais etapas, agendamentos e pagamentos o atendimento precisa conduzir?" },
    ],
  },
];

export function getDevelopmentService(slug: string) {
  return developmentServices.find(service => service.slug === slug);
}
