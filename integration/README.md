# Briefing de Desenvolvimento → Diagnóstico Leads

Estado: implementação local. Este pacote não publica serviços, não configura segredos e não altera o banco de produção.

## Fluxo implementado

1. O visitante escolhe um dos quatro serviços em `/desenvolvimento`.
2. A página específica apresenta descrição, recursos, exemplos por segmento e briefing próprio.
3. O formulário envia JSON ao endpoint do site `/api/service-briefings`.
4. O servidor valida os campos e assina o corpo com HMAC-SHA256. O segredo nunca vai para o navegador.
5. O Diagnóstico recebe em `/api/integrations/service-briefings`, verifica assinatura, prazo da assinatura e serviço/origem.
6. `createLead` grava o lead e o evento de e-mail na mesma transação existente. O painel `/admin/leads` passa a listar o contato na jornada `complete`, com o serviço e o briefing integral no detalhe.
7. A outbox existente aciona o workflow de Gmail. A equipe recebe em **ag.firmant@gmail.com**; o fluxo existente também confirma ao solicitante. Uma falha de notificação preserva o lead e deixa o evento pendente para nova tentativa.

A confirmação na tela só aparece depois da resposta de gravação do Diagnóstico. Ela distingue notificação entregue ao workflow de notificação em fila. A chave de idempotência permanece na tentativa repetida sem alteração dos campos; modificar o formulário gera uma nova solicitação.

## Arquivos no Diagnóstico

O repositório receptor local é `C:/Projetos_Python/firmant-landing-v2`. As cópias em `diagnostico/` usam `.ts.txt` para não entrarem no build TypeScript do site. O instalador copia com a extensão original:

- `lib/integrations/service-briefing.ts`
- `app/api/integrations/service-briefings/route.ts`
- `tests/service-briefing.test.ts`

`node integration/apply-diagnostico.cjs` aplica o pacote localmente. Recusa sobrescrever os três arquivos quando houver conteúdo divergente. Também:

- Acrescenta o nome do segredo à `.env.example`, sem valor.
- Ajusta o validador de `n8n/workflows/01-firmant-leads-gmail.json`: briefings desta origem preservam até 16.000 caracteres e recebem o rótulo `Briefing de desenvolvimento`; demais jornadas mantêm o limite anterior.
- Exclui caches antigos `.next-codex*/**` e `.sites-runtime/**` do lint e da checagem de tipos. Os tipos atuais de `.next` continuam ativos.

Não altera a validação pública de `/api/leads`, as jornadas existentes, autenticação administrativa, tabelas ou migrações.

## Configuração necessária para ativar

| Ambiente | Variável | Valor |
| --- | --- | --- |
| Servidor do site | `DIAGNOSTICO_BRIEFING_URL` | `https://diagnostico.firmant.com.br/api/integrations/service-briefings` |
| Servidor do site | `DIAGNOSTICO_BRIEFING_SECRET` | Segredo aleatório com pelo menos 32 caracteres |
| Servidor do Diagnóstico | `FIRMANT_SITE_BRIEFING_SECRET` | Exatamente o mesmo segredo do site |

Gerar/configurar o segredo por canal privado de configuração, sem adicioná-lo ao Git ou a variáveis `NEXT_PUBLIC_*`. Manter a configuração existente `N8N_LEADS_WEBHOOK_URL`, `N8N_LEADS_WEBHOOK_SECRET` e credenciais Gmail OAuth do n8n.

Para testes locais, o remetente aceita HTTP somente em `127.0.0.1` ou `localhost`. O banco e o n8n devem ser de homologação. Sem configuração, o formulário mostra indisponibilidade e mantém os dados; não simula registro ou envio de e-mail.

## Publicação, após autorização

1. Versionar as alterações locais dos dois projetos e guardar a versão anterior do workflow n8n.
2. Configurar os segredos nos servidores; publicar primeiro o receptor do Diagnóstico, mantendo seu fluxo atual.
3. Aplicar apenas a mudança do validador no workflow existente, preservando credenciais, webhook e configuração ativa. Não criar um segundo workflow de produção com o mesmo webhook.
4. Publicar o site com a URL e o segredo configurados.
5. Enviar um briefing de homologação autorizado e conferir o mesmo protocolo no painel, o serviço correto, a última resposta completa e o recebimento em `ag.firmant@gmail.com`.
6. Reenviar a mesma chave para confirmar que o lead não duplica; em homologação, simular falha do webhook para conferir persistência e reprocessamento pela outbox existente.

Não foi executado teste com banco, n8n ou Gmail de produção. A ativação e essa verificação integrada ainda são necessárias. Os checks automatizados locais não substituem a confirmação do recebimento real.

## Reversão

Reverter o site e retirar a configuração de envio interrompe novas solicitações deste formulário. Reverter o receptor e o validador n8n para as versões anteriores preserva os leads já gravados. Não excluir registros, eventos de outbox, credenciais nem tabelas para reverter esta entrega.

## Verificações locais

- Site: lint, testes de validação/conteúdo, build com TypeScript e conferência pelo navegador.
- Diagnóstico: lint, typecheck, suíte existente e novos testes de assinatura, origem e preservação do briefing no workflow; build incluindo o novo endpoint.
- Navegador: quatro páginas, retorno aos serviços, campos específicos, teclado, ausência de overflow em 320/390 px e mensagem de indisponibilidade com preservação e foco nos dados do formulário.

O limite de tentativas no site é uma proteção em memória por instância, sem garantia de contagem global entre Workers. O registro usa a idempotência persistida do Diagnóstico. A notificação reutiliza a política de entrega e retentativas já existente na outbox/n8n.
