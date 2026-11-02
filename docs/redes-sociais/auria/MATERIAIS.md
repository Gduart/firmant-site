# Campanha demonstrativa AURIA

Marca fictícia de arquitetura e interiores premium. Conteúdo gerado por IA para demonstrar direção visual e adaptação entre formatos. Não representa projeto executado, cliente atendido ou resultado comercial.

## Peças

| Arquivo para o site | Uso | Texto previsto para aplicar na composição |
| --- | --- | --- |
| `publicacao.webp` | Publicação 4:5, visão principal do ambiente | Espaços para viver com calma. |
| `carrossel-01.webp` | Página 1/3, abertura e luz no ambiente | Um ambiente começa pela sensação. |
| `carrossel-02.webp` | Página 2/3, detalhe dos materiais | Texturas que aproximam. |
| `carrossel-03.webp` | Página 3/3, fechamento e acolhimento | Seu jeito de viver, em cada detalhe. |
| `video-referencia.webp` | Capa e referência vertical 9:16 | AURIA — Arquitetura e interiores. |

Os textos não estão gravados nas fotografias. A integração na página aplicará tipografia legível sobre as bases e identificação visível: “Marca fictícia · Demonstração com IA”.

## Organização

- PNGs originais: `design/redes-sociais/auria/originais/`. Para gerar o vídeo, anexar `video-referencia.png`.
- WebPs para o site: `public/images/redes-sociais/auria/`.
- MP4 aprovado e integrado: `public/videos/redes-sociais/auria/auria-apresentacao-v2.mp4`.
- Roteiro da nova versão: `docs/redes-sociais/auria/VIDEO-OMNI-GEMINI-V2.md`. A versão anterior foi excluída do projeto a pedido do usuário.
- Dimensões e pesos verificados: `design/redes-sociais/auria/assets.json`.

## Dimensões e integração

Exportações: publicação e carrossel com 1080 × 1350 px; capa vertical com 1080 × 1920 px. Originais conservados na resolução entregue pelo gerador. Conversão sem recortar a imagem.

Vitrine integrada em `/gestao-redes-sociais#conteudo-na-pratica`: imagem com até 640 × 800 px e vídeo com até 480 × 853 px no desktop, empilhados no celular. Publicação e carrossel são selecionados por botões, com navegação manual entre as três páginas. Os textos são sobrepostos na composição da página.

Vídeo novo recebido: `public/videos/redes-sociais/auria/auria-apresentacao-v2.mp4`, 1080 × 1920 px, H.264/AAC, 7,979 segundos, 6.659.690 bytes. Cópia conferida por hash e decodificação completa sem erros. Capa atual: `public/images/redes-sociais/auria/video-capa-v2.webp`, extraída do novo vídeo. Reprodução por clique com controles nativos e `preload="none"`; sem reprodução automática.

O bloco de preços foi retirado desta página; acesso a opções e valores mantido pelo montador. A lista “O que está incluído” foi transferida para “O que fazemos”. CTA de proposta abre WhatsApp com mensagem contextual, sem envio automático.

## Direção dos prompts

Fotografia editorial de interiores brasileiros contemporâneos: travertino, madeira de nogueira, bouclé marfim e vegetação tropical; luz natural de fim de tarde e proporções arquitetônicas plausíveis. Sem pessoas, letras, logotipos, colagens ou mockup de telefone.

- Publicação: sala com sofá curvo, mesa de centro de nogueira, travertino e janela para jardim tropical.
- Carrossel 1: vista da sala de jantar mostrando luz e continuidade com a sala de estar.
- Carrossel 2: detalhe de madeira, cerâmica e tecido, destacando texturas.
- Carrossel 3: canto de leitura acolhedor na mesma linguagem visual.
- Referência de vídeo: enquadramento vertical da sala, com continuidade de materiais e arquitetura.

Para reexportar na raiz do projeto: `node design/redes-sociais/auria/export-assets.cjs`.
