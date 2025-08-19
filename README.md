# 🍽️ Marmita.One

> **Delivery Digital** • Plataforma PWA para pedidos de marmitas

[![Version](https://img.shields.io/badge/version-0.1.0--beta-blue.svg)](https://github.com/digitalrobertlima/marmita-one)
[![PWA](https://img.shields.io/badge/PWA-Ready-green.svg)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🚀 Sobre o Projeto

**Marmita.One** é uma Progressive Web App (PWA) moderna e profissional para delivery de marmitas. Oferece uma experiência completa de pedidos com personalização total e integração direta via WhatsApp.

### ✨ Funcionalidades Principais

- 🔧 **Montar Meu Prato**: Personalização completa com ingredientes individuais
- ⚡ **Opções Prontas**: Combinações predefinidas para pedidos rápidos
- 📱 **PWA Completo**: Instalável, funciona offline, notificações push
- 🛒 **Carrinho Persistente**: Dados salvos entre sessões
- 📲 **WhatsApp Integration**: Finalização de pedidos direto no WhatsApp
- 🌙 **Modo Escuro**: Detecção automática de preferência do sistema
- 📊 **Analytics**: Tracking de eventos e comportamento do usuário

## 🏗️ Arquitetura

### 📁 Estrutura do Projeto

```
marmita-one/
├── 📄 index.html                 # Landing page principal
├── 📱 manifest.json              # Configuração PWA
├── ⚙️ config.json               # Configurações da aplicação
├── 📁 assets/
│   ├── 🎨 css/
│   │   ├── variables.css         # Design system (cores, tipografia)
│   │   ├── reset.css            # Reset CSS moderno
│   │   ├── components.css       # Componentes reutilizáveis
│   │   └── main.css             # Estilos principais
│   ├── ⚙️ js/
│   │   ├── app.js              # Lógica principal da aplicação
│   │   ├── pwa.js              # PWA Manager (instalação, offline)
│   │   └── sw.js               # Service Worker (cache, sync)
│   └── 🖼️ icons/               # Ícones PWA (placeholder)
└── 📄 pages/
    ├── custom.html              # Configurador de marmitas
    ├── presets.html            # Opções predefinidas
    └── checkout.html           # Finalização de pedidos
```

### 🎨 Design System

- **Cores**: Sistema de variáveis CSS consistente
- **Tipografia**: Inter font family com pesos específicos
- **Espaçamento**: Grid system baseado em múltiplos de 4px
- **Componentes**: Cards, botões, inputs padronizados
- **Responsivo**: Mobile-first com breakpoints profissionais

### ⚡ PWA Features

- **Service Worker**: Cache inteligente e funcionalidade offline
- **App Manifest**: Instalação nativa em dispositivos
- **Background Sync**: Sincronização de pedidos quando voltar online
- **Push Notifications**: Atualizações de status de pedidos
- **Responsive Design**: Otimizado para todas as telas

## 🛠️ Tecnologias

- **HTML5**: Semântico e acessível
- **CSS3**: Variáveis customizadas, Grid, Flexbox
- **JavaScript ES6+**: Módulos, async/await, PWA APIs
- **PWA**: Service Worker, Web App Manifest, Notifications
- **Performance**: Preload, lazy loading, otimizações

## 🚀 Como Usar

### Instalação Local

```bash
# Clone o repositório
git clone https://github.com/digitalrobertlima/marmita-one.git

# Entre no diretório
cd marmita-one

# Sirva os arquivos (exemplo com Python)
python -m http.server 8000

# Ou com Node.js
npx serve .

# Acesse http://localhost:8000
```

### Deploy

O projeto está pronto para deploy em qualquer servidor web estático:

- **Netlify**: Drag & drop da pasta
- **Vercel**: Deploy automático via Git
- **GitHub Pages**: Configuração simples
- **Firebase Hosting**: PWA-ready

## 📱 Como Funciona

### 1. **Landing Page**
- Escolha entre "Montar Meu Prato" ou "Opções Prontas"
- Design elegante com call-to-actions claros
- Informações sobre marmitas de 750mL

### 2. **Configuração de Pedidos**
- **Custom**: Seleção individual de proteínas, acompanhamentos, extras
- **Presets**: Combinações prontas com entrada via texto

### 3. **Carrinho & Checkout**
- Resumo detalhado do pedido
- Dados de entrega
- Geração automática de mensagem WhatsApp

### 4. **PWA Experience**
- Prompt de instalação inteligente
- Funciona offline
- Notificações de status
- Ícone na tela inicial

## 🔧 Configuração

### config.json

```json
{
  "app": {
    "name": "Marmita.One",
    "version": "0.1.0-beta",
    "environment": "beta"
  },
  "features": {
    "pwa": true,
    "offline": true,
    "notifications": true,
    "analytics": true
  },
  "branding": {
    "primary_color": "#0a7d4f",
    "accent_color": "#e10600"
  }
}
```

## 📊 Versioning

- **v0.1.0-beta**: Primeira versão beta completa
- **Branch**: `v0.1-beta`
- **Status**: Ready for testing

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'feat: nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 License

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Robert Lima** - [@digitalrobertlima](https://github.com/digitalrobertlima)

---

<div align="center">
  <strong>Marmita.One</strong> • Delivery Digital<br>
  <em>Seu prato, seu jeito</em> 🍽️
</div>
