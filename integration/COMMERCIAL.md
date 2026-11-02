# Orçamento no detalhe do lead

Publicado em produção em 2026-11-02. O orçamento é operado na tela `Diagnóstico → Admin → Leads → Abrir`, sem exigir acesso ao Admin comercial do site.

Atualização de homologação local: em 2026-11-01 a chave foi inserida pelo usuário em `.env.local`, validada com HTTP 200 para o modelo e usada em uma geração real de orçamento para o lead fictício. O rascunho foi persistido no D1 local e recuperado após recarregar o detalhe do lead. A prévia real do Diagnóstico está em `http://127.0.0.1:3001/admin/leads`; operação local documentada em `scripts/local-leads/README.md`. Banco de produção, envios de e-mail e cobranças reais continuam sem ativação nesta etapa.

## Uso

1. No lead, abra a seção **Orçamento deste cliente**. Informe valor de referência da hora, capacidade em horas por dia útil, validade e, se houver, início previsto.
2. Clique em **Gerar orçamento com IA**. O modelo é exatamente `gpt-6-luna`, via Responses API. A pesquisa técnica é opcional. O agente recebe apenas serviço e briefing preenchidos; campos sem resposta são descartados. Não recebe histórico interno, conversas ou dados de contato. A busca web recebe somente uma categoria genérica do serviço.
3. Revise os campos: resumo, objetivo, escopo/entregas, exclusões, premissas, dependências, stack/integrações, segurança, privacidade, hospedagem/backups/custos recorrentes, testes/aceite, suporte/garantia, propriedade/licenças, revisões e condições comerciais. Confira as pendências e referências técnicas propostas.
4. Ajuste cronograma, início/fim, quantidades e preços de cada entrega. O total é calculado no servidor em centavos. O valor-hora informado serve de referência inicial; o agente estima horas, sem inventar uma tabela de preços da FIRMANT. Datas são previsões em dias úteis, sem feriados, condicionadas a aceite, disponibilidade, materiais e aprovações. Use **Atualizar dias e término pelas etapas** depois de mudar as etapas.
5. **Salvar rascunho / nova versão** preserva a versão anterior. **Aprovar versão revisada** libera PDF, envio e pagamentos. Campos essenciais, preço positivo, datas coerentes e soma dos dias das etapas são verificados no servidor. Editar novamente exige salvar e aprovar a nova versão.
6. **Gerar e baixar PDF** baixa o arquivo autenticado. **Enviar PDF por e-mail** envia o PDF como anexo ao e-mail do lead, pelo serviço Gmail já existente no site. Não abre apenas um `mailto:`. O envio é uma ação explícita do administrador, nunca da IA.
7. Para pagamento, selecione entrada ou saldo na entrega; o valor corresponde aos 50% calculados sobre o total aprovado. O saldo exige entrada recebida e confirmação da entrega. Selecione Pix, cartão ou ambos e até 12 parcelas. Não há acréscimo automático de taxas. O pagador fornece documento e cartão diretamente no Asaas.
8. O link criado pode ser enviado por e-mail ou levado ao WhatsApp com mensagem preenchida. O envio no WhatsApp é concluído pelo administrador. Links expirados, de versão anterior, pagos ou cancelados não são oferecidos para compartilhamento. O pagamento depende da confirmação por webhook, não do retorno do cliente à página.

Se um envio de e-mail tiver resultado incerto, confira o Gmail e o histórico antes de tentar novamente. A mesma requisição não é reenviada automaticamente. Após conferência, recarregar a seção permite uma nova solicitação manual de envio.

## Arquitetura e persistência

- **Diagnóstico / PostgreSQL:** continua sendo a origem dos leads. Sua sessão administrativa protege o novo endpoint `/api/admin/leads/[reference]/commercial`. O servidor carrega identidade e contexto do banco, ignorando qualquer tentativa de substituir esses dados pelo navegador.
- **Conexão privada:** o Diagnóstico assina cada requisição ao site com HMAC-SHA256 e timestamp de até cinco minutos. O segredo comercial é distinto do segredo de recebimento de briefings. Não há credenciais ou acesso direto ao Asaas/OpenAI no navegador.
- **Site / D1:** o novo endpoint `/api/integrations/lead-commercial` mantém versões, aprovação, histórico e vínculos de cobrança. Reutiliza `orders`, checkout Asaas e webhook existentes. Reutiliza SMTP Gmail e as rotinas de paginação/serialização do PDF, com documento específico para orçamento técnico; as condições fixas 50/50 do PDF antigo não são inseridas neste novo documento.
- **IA:** produz somente conteúdo estruturado para rascunho. Não dispõe de ferramentas para aprovar, enviar e-mail ou criar pagamento. A resposta é validada; falhas, recusa, resposta incompleta ou falta de chave não geram sucesso fictício. As chamadas usam `store: false`.
- **Concorrência:** a gravação de versão exige a revisão esperada. Duas telas não sobrescrevem silenciosamente a mesma versão. Cobranças usam reserva persistida antes da chamada ao Asaas; resultado incerto exige conferência. Renovação de link expirado é uma ação explícita e preserva o histórico. Os recebimentos já confirmados são descontados do saldo disponível; uma entrada e um saldo com o mesmo valor exigem identificação e conferência explícitas.

## Aplicação local do pacote

```powershell
node C:/Projetos_Python/firmant-site/integration/apply-commercial.cjs
```

O instalador copia os arquivos comerciais deste pacote para `C:/Projetos_Python/firmant-landing-v2`, inclui o componente na tela do lead e documenta os nomes das variáveis em `.env.example`. Não publica e não aplica migração. As cópias `.ts.txt`/`.tsx.txt`/`.css.txt` e os módulos compartilhados no site são a fonte do pacote; alterações futuras devem ser feitas nessas fontes antes de reaplicar. O instalador atualiza somente os arquivos comerciais que pertencem ao pacote.

## Configuração para homologação/publicação

| Servidor | Variável | Conteúdo |
| --- | --- | --- |
| Site | `DIAGNOSTICO_COMMERCIAL_SECRET` | Segredo aleatório com pelo menos 32 caracteres |
| Diagnóstico | `FIRMANT_COMMERCIAL_SECRET` | Exatamente o mesmo segredo comercial |
| Diagnóstico | `FIRMANT_COMMERCIAL_URL` | `https://firmant.com.br/api/integrations/lead-commercial` |
| Site | `OPENAI_API_KEY` | Chave privada com acesso ao `gpt-6-luna` e pesquisa web |
| Site | `GMAIL_SMTP_USER`, `GMAIL_SMTP_APP_PASSWORD` | Configuração de envio já existente |
| Site | `ASAAS_API_BASE_URL`, `ASAAS_API_KEY` e webhook | Configuração de pagamento já existente; usar sandbox na homologação |
| Site | `APP_BASE_URL` | Domínio do ambiente atual; usado no retorno do checkout para o status do pedido |

Não inserir segredos em Git, no formulário ou em variáveis `NEXT_PUBLIC_*`. O pacote não cria nem substitui credenciais.

Revisar e aplicar **somente após autorização** a migração `migrations/0011_lead_quotes.sql` no D1 correto, com backup prévio. Não há migração nova no PostgreSQL. Para o proxy do Diagnóstico, conferir se o tempo permitido é suficiente para a geração: o conector aguarda até 230 segundos, o navegador até 240; mudanças no proxy de produção exigem autorização.

Sequência de ativação: backup e migração D1 → configuração privada → publicação do endpoint do site → publicação do Diagnóstico → homologação integrada. A integração de captura de briefings de `integration/README.md` continua necessária para novos leads da página Desenvolvimento Web.

## Verificações e limites

- Validação de campos, preço, cronograma, datas e assinatura testada localmente.
- Chamadas OpenAI simuladas nos testes automatizados: modelo, pesquisa sem contatos, exclusão de campos vazios, estrutura e cálculo determinístico conferidos. Posteriormente, a chave fornecida pelo usuário foi validada e uma geração real foi concluída na prévia com briefing fictício.
- Migração e reservas de cobrança testadas em SQLite em memória, incluindo concorrência, falha de confirmação, link expirado e pagamento já confirmado. Asaas simulado, sem cobrança real.
- Interface conferida com fixture fictícia: geração de rascunho, edição de preço, salvamento, aprovação, download efetivo do PDF, parcelamento e bloqueio após nova edição. Conferência móvel em 390 px e foco de teclado. O harness temporário foi removido.
- PDF renderizado em A4 e conferido visualmente nas três páginas, incluindo acentos e URL longa. A cópia baixada no teste foi identificada como orçamento de teste local.
- Lint, TypeScript, testes e builds dos projetos precisam estar aprovados antes da publicação.

O acesso real à OpenAI, a conexão autenticada e o lead persistido já foram conferidos na prévia local. Ainda é obrigatório validar o recebimento do PDF no e-mail de teste, o checkout sandbox e seu retorno por webhook; ao configurar os servidores, repetir a conferência das conexões nesse ambiente. Sem essa etapa, não declarar a integração operacional em produção.

## Reversão

Reverter os dois aplicativos e desabilitar a URL/segredo comercial interrompe novas operações. Preservar as tabelas e os orçamentos gerados; não remover pedidos, eventos ou cobranças do Asaas. Se houve link compartilhado, conferir sua situação e decidir sua continuidade antes de qualquer cancelamento. Reverter código não cancela pagamentos.

## Revisão local de 2026-11-01: regra comercial atual

Esta atualização substitui as orientações anteriores de cobrança manual: a condição oficial é 50% de sinal na entrada e 50% na entrega. A tela calcula as duas etapas a partir do total aprovado; o saldo só pode ser cobrado após confirmação da entrega e recebimento da entrada. Para alterar o investimento, salve e aprove nova versão do orçamento.

O cabeçalho e os quadros financeiros do PDF destacam a condição e os valores. Fontes técnicas são preservadas para consulta interna recolhida e não compõem o PDF do cliente. O botão **Abrir Gmail** usa o Gmail no navegador; **Gerar PDF e enviar por e-mail** envia o anexo pelo servidor após configurar GMAIL_SMTP_USER e GMAIL_SMTP_APP_PASSWORD. No desenvolvimento há transporte TLS Node; em produção permanece cloudflare:sockets.

A interface informa a ausência de credenciais Gmail/Asaas; nenhuma chave é retornada ao navegador. A geração de checkout é bloqueada antes de persistir pedidos quando falta configuração. Para homologação local, configurar somente a chave Asaas sandbox correspondente ao endereço sandbox. O fluxo de confirmação de pagamento pelo webhook ainda requer homologação integrada.

Builds podem usar FIRMANT_VERIFY_DIST_DIR para uma pasta isolada dentro de cada projeto, sem interromper a prévia. Não define novo diretório de produção por padrão.

## Envio de PDF: diagnóstico e destinatário

O campo Destinatário deste envio permite corrigir o destino sem gerar outra versão do orçamento. Endereços fictícios são bloqueados no cliente e no servidor antes de criar uma reserva de envio. O histórico registra o endereço utilizado. Uma falha com safeToRetry=true indica que a mensagem comprovadamente não foi enviada; falhas incertas mantêm o identificador para evitar duplicidade.

O envio local foi validado pela rota administrativa com um PDF real para a conta FIRMANT, após autorização do usuário. A importação de node:stream trata módulo default no empacotamento Next. A ação autenticada check-email permite verificar o transporte real do servidor sem enviar mensagens. Detalhes de diagnóstico ficam restritos ao desenvolvimento; a conexão HMAC e o login continuam obrigatórios.

## Retomada da homologação Asaas — 2026-11-01

Acesso à conta Sandbox recuperado pelo usuário; chave ainda não salva na verificação desta etapa. URL Sandbox e segredo de webhook preparados somente no ambiente local privado. Nenhum checkout ou webhook remoto criado nesta retomada.

Validação de URL/chave ocorre antes de reservar uma cobrança, impedindo misturar ambientes. Reservas impedem duplicar entrada ao alternar Pix/cartão ou enviar solicitações concorrentes. CHECKOUT_PAID confirma o pedido; eventos já processados são ignorados e falhas transitórias permitem reprocessamento. Segredo ausente/incorreto rejeita o webhook. Cliente Asaas possui timeout de 30 segundos.

Conferidos 21 testes direcionados: 9 de cobrança, 9 do cliente Asaas e 3 do webhook, todos aprovados. Esses testes usam respostas simuladas e não substituem a homologação no Sandbox. Próximos passos: usuário salvar ASAAS_API_KEY no .env.local; validar autenticação sem criar cobrança; preparar o recebimento do webhook; homologar entrada, confirmação e saldo com dados fictícios. Produção permanece inalterada.

### Sandbox conectado e criação real de checkout conferida

Chave Sandbox salva pelo usuário e validada por GET de dados comerciais com HTTP 200, sem imprimir chave ou cadastro. `scripts/local-leads/check-asaas.mjs` preserva o prefixo literal `$` no dotenv do Next e recusa ambiente incompatível. O relay temporário `scripts/local-leads/asaas-relay.mjs` aceita somente POST autenticado no webhook, corpo limitado e retornos fixos de pagamento. Admin e demais rotas retornam 404. Túnel Cloudflare usa QUIC com verificação TLS; executável oficial com assinatura Cloudflare válida, somente na pasta privada da prévia.

Webhook exclusivo de homologação cadastrado na conta Sandbox. Estado privado e IDs em `.local-preview/asaas-homologation.json`; não copiar token para documentação. `ASAAS_CALLBACK_BASE_URL` opcional permite retornos do checkout pelo túnel sem alterar APP_BASE_URL ou a URL do Admin. Produção continua usando APP_BASE_URL na ausência dessa opção.

O teste real revelou limite de 30 caracteres em items.name. Nome limitado e título completo preservado na descrição. Recusas explícitas HTTP 400/401/403/404/422 agora encerram o pedido local como FAILED e exibem a causa; timeout e resultado desconhecido continuam bloqueando repetição automática. Interface e servidor bloqueiam compartilhamento de link de pedido FAILED. Tentativa legada anterior à configuração da chave foi encerrada com backup e auditoria; recusas de teste preservadas no histórico.

Checkout Sandbox criado pelo fluxo comercial do orçamento fictício V4: total R$ 9.600,00, sinal R$ 4.800,00, Pix e cartão à vista ou até seis parcelas. Página hospedada aberta e conferida no navegador. Evento CHECKOUT_CREATED enviado pelo Asaas, recebido com HTTP 200 e persistido como PROCESSED no D1 local. Pendentes: concluir pagamento fictício, receber CHECKOUT_PAID e testar cobrança do saldo após confirmação da entrega. Não declarar esses passos como concluídos.

Manter relay e túnel ativos durante o teste; o endereço temporário muda se o túnel for recriado. Antes de desligá-lo, desabilitar somente o webhook de homologação identificado no estado privado para evitar novas retentativas/alertas. Nenhum webhook ou cobrança de produção foi alterado.

## Preparação do pacote de produção

Depois do build completo OpenNext e de scripts/patch-opennext-worker-sockets.cjs, executar node scripts/prepare-production-worker.cjs antes de upload/deploy. O OpenNext gera next-env.mjs a partir dos arquivos dotenv: o preparador mantém somente NEXT_PUBLIC_* e verifica que valores privados não foram incorporados em outros arquivos. Segredos e URLs do servidor devem vir dos bindings da Cloudflare; nunca publicar chave Sandbox, callback temporário ou configuração de banco local.

O banco D1 exige backup e a migração aditiva 0011. A configuração Asaas/Gmail existente deve ser preservada. O Diagnóstico recebe seus segredos de conexão no arquivo privado da VPS e mantém o PostgreSQL existente; não copiar o banco nem credenciais da prévia. Publicar o receptor e o Admin antes de ativar a nova versão do site. Guardar referência da imagem e versão Worker anteriores para reversão, sem excluir tabelas ou leads.

## Publicação concluída — 2026-11-02

Site: https://firmant.com.br. Admin: https://diagnostico.firmant.com.br/admin/leads. Worker ativo em 100%: c7ae6c05-4fce-48aa-8020-0b78f1b00ef4. Diagnóstico: ghcr.io/gduart/firmant-landing:sha-3518623. Migração 0011 aplicada após backup D1; PostgreSQL preservado com backup na VPS. Segredos comerciais configurados nos dois serviços; Asaas e Gmail existentes preservados.

O workflow existente de e-mail recebeu somente o limite de 16.000 caracteres para briefings de desenvolvimento e o rótulo da jornada. Sua versão publicada foi exportada antes da alteração; ID, credenciais e demais fluxos preservados. O container n8n foi reiniciado para carregar a publicação e passou na verificação de prontidão.

Quatorze verificações de produção aprovadas: páginas, vídeo com hash idêntico ao aprovado, proteção do Admin, saúde do Diagnóstico, conexão comercial HMAC/D1, autenticação do receptor, proteção do webhook e autenticação SMTP Gmail. Navegação por card e briefing conferidos no navegador em 319 px, sem overflow e sem erros de console. Não foram criados leads, enviados e-mails ou geradas cobranças reais nesses testes.

Corrigida incompatibilidade do wrapper minificado com use strict no patch de cloudflare:sockets. Dois testes de regressão verificam a exportação de connect e a reaplicação sem duplicar imports. A correção altera o empacotamento, sem exigir nova configuração Gmail.

Reversão coordenada: restaurar a configuração /opt/backups/firmant-landing/release-20261101/env.before e a imagem anterior sha-fbb7a3d na VPS; na Cloudflare, ativar a versão anterior 3adfe467-9a12-4734-83b5-65a9f6897012. O backup do workflow fica no mesmo diretório de release na VPS. Preservar tabelas, leads e registros financeiros; uma reversão de código não exige restaurar o banco inteiro.

## Correção do cronograma gerado pela IA — 2026-11-02

Worker atualizado para 3b708428-9098-49a6-b561-56c814805689, ativo em 100%. Reversão específica desta correção: versão c7ae6c05-4fce-48aa-8020-0b78f1b00ef4, sem trocar a imagem do Diagnóstico ou restaurar bancos.

O schema exige de 1 a 12 etapas, cada uma com duração inteira entre 1 e 2000 dias, correspondendo à validação do servidor. Etapas não aplicáveis devem ser omitidas pela IA. Durações inválidas continuam sendo rejeitadas, com mensagem identificando a resposta da IA e a etapa; não há conversão automática de zero para um prazo inventado nem nova chamada automática ao modelo.

Pesquisa e instruções de cronograma usam perfis próprios para audiovisual/UGC, redes sociais, automações, agente Telegram, sistemas web e combo landing/IA/Mini CRM. Serviço indefinido usa orientação geral de serviços digitais. Somente serviço e briefing preenchidos seguem ao modelo; contatos permanecem excluídos da análise e o modelo continua gpt-6-luna.

Validações: 51 testes do site, incluindo 16 do agente; lint; build Next/OpenNext com TypeScript; uma geração real com briefing audiovisual exclusivamente fictício, com schema aceito e durações válidas; 14 verificações de produção. Nenhum novo lead, e-mail ou cobrança criado por esses testes. Na página do cliente, recarregar e selecionar Gerar orçamento com IA para uma nova tentativa.
