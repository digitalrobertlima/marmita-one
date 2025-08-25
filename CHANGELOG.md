# Changelog

## v0.1.2 — 2025-08-25

Principais mudanças:
- cutoff de recebimento alterado para 13:50 (exibição no header e na prévia do WhatsApp via `APP_CONFIG.cutoff`).
- Ajustes no catálogo/configuração:
  - preço de carnes extras atualizado (`precoCarneExtra: 9.0`).
  - unificação de `carnesExtras8` para `carnesExtras` e uso correspondente no app.
- UI/UX:
  - rótulos do builder iOS agora mostram preços dinâmicos para adicionais e carnes extras.
- Qualidade/Infra:
  - adição de Playwright e suíte E2E:
    - testes de PWA/manifesto e ícones.
    - cobertura dos builders (padrão e iOS), carrinho, checkout, cópia da mensagem e abertura do WhatsApp.
    - alternância de modos (topbar), remoção de itens e limpeza do carrinho.

Tags: `v0.1.2`