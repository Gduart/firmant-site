# Fluxo comercial e aprovação FIRMANT

## Escopo implementado

- Briefing por link exclusivo, salvamento em rascunho e envio final.
- Até 10 anexos JPG/PNG de 10 MB, privados no R2, com exclusão manual.
- Proposta comercial criada a partir do briefing, itens, etapas de pagamento, termos, versões imutáveis, PDF e envio por Gmail SMTP.
- Aceite/recusa com versão, hash, nome, e-mail, data, IP e navegador.
- Primeira etapa cobrada pelo fluxo já existente de pedidos e Asaas; o webhook sincroniza a etapa e o projeto sem interromper pedidos antigos.
- Pagamento de propostas fixado em duas etapas: entrada de 50% após o aceite e saldo de 50% após a aprovação, antes da entrega final. O projeto permanece bloqueado para produção até a confirmação da entrada.
- O Admin abre detalhes de proposta dentro da rota estática `/admin/propostas`, repetindo o hotfix já usado para briefings e evitando depender de uma nova navegação SSR dinâmica no Cloudflare.
- O link público `/proposta/:token` redireciona para a página estática `/proposta?token=...`; os dados são buscados pela API depois do carregamento, evitando Error 1102 ao reativar links no Cloudflare.
- Portal privado para aprovar imagem, carrossel e vídeo MP4, com comentários gerais, por slide ou timecode.
- Aprovação e rodadas de revisão registradas por versão.

As mídias ainda em revisão não são expostas pelo token da proposta. Depois do aceite e da confirmação da entrada fixa de 50%, a equipe envia as prévias e gera um token separado no portal de revisão. A separação evita que um link comercial conceda acesso antecipado a arquivos de produção.

Depois da aprovação formal, a versão aprovada também fica visível na proposta aceita. O arquivo continua privado no R2 e a transmissão exige que o token da proposta permaneça ativo e válido; comentários e decisões continuam restritos ao portal de revisão.

## Recursos Cloudflare necessários

Antes do deploy, criar os buckets privados (caso ainda não existam):

```powershell
npx wrangler r2 bucket create firmant-private-assets
npx wrangler r2 bucket create firmant-private-assets-staging
```

Aplicar a expiração automática de sete dias somente ao prefixo de anexos de briefing:

```powershell
npm run r2:lifecycle
npm run r2:lifecycle:staging
```

As prévias em `reviews/` não usam essa regra de sete dias; sua disponibilidade é controlada pelos links temporários e pelo Admin.

## Banco de dados

Aplicar, nesta ordem, `migrations/0006_commercial_workflow.sql` e
`migrations/0007_briefing_billing_address.sql`, primeiro em staging e somente
depois em produção. As migrations são aditivas e não alteram as tabelas
existentes de pedidos, pagamentos, contratos ou blog.

A `0007` acrescenta ao briefing os dados exigidos pelo checkout hospedado do
Asaas: número, complemento, bairro e CEP. Para briefings antigos ou propostas
sem briefing completo, o checkout não envia um cadastro parcial; o próprio
Asaas solicita os dados ao cliente, evitando rejeição da sessão.

## Variáveis e segredos

- `FIRMANT_ADMIN_SESSION_SECRET`: segredo independente para assinar a sessão do Admin. Há fallback temporário para a senha atual, mas produção deve ter um valor próprio.
- `BRIEFING_LINK_TTL_DAYS`: padrão 14.
- `REVIEW_LINK_TTL_DAYS`: padrão 14.
- `PRIVATE_ASSETS`: binding R2 definido nos dois arquivos Wrangler.
- As configurações Asaas e Gmail existentes continuam sendo reutilizadas.

## Limites operacionais do MVP

- Vídeos: MP4 pronto para navegador, até 95 MB por versão. Não há transcodificação/HLS automática nesta fase.
- Recomenda-se enviar vídeo de prévia já comprimido e com marca d'água. O portal adiciona também uma identificação visual, mas nenhum mecanismo web impede download por um usuário determinado.
- Os textos-base da proposta foram estruturados a partir do documento fornecido. Revisão jurídica profissional continua recomendada antes do uso em escala.

## Checklist de ativação

1. Criar buckets R2.
2. Aplicar a migration em staging.
3. Configurar segredos e variáveis.
4. Aplicar a regra de lifecycle de sete dias.
5. Fazer deploy em staging.
6. Testar briefing, publicação, PDF/e-mail, aceite, checkout Asaas sandbox, webhook, projeto, imagem, carrossel e vídeo.
7. Repetir migration/configuração/deploy em produção após aprovação.

## Validação de staging em 2026-08-30

- Briefing: rascunho, upload JPG privado, leitura, exclusão manual e envio final.
- Proposta: leitura pública, aceite, criação de projeto e checkout Pix no Asaas Sandbox.
- Idempotência: nova solicitação de pagamento reutilizou o mesmo pedido e checkout.
- Portal de conteúdo: streaming privado de imagem, feedback de revisão e aprovação formal.
- Limpeza: registros D1 e objetos R2 usados nos testes foram removidos.
