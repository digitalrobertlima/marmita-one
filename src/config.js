// Configurações whitelabel centralizadas
export const APP_CONFIG = {
  nome: "Restaurante da Célia",
  sub: "Seu prato, seu jeito. Monte agora!",
  whatsapp: "5531992034948",
  cutoff: "14:30",
  tema: { cor: "#1976d2", background: "#ffffff" },
  regras: {
    limiteAcompanhamentos: 0, // 0 = sem limite
    obrigatorios: ["tamanho", "proteina"],
    precoAdicional: 2.0,
    precoCarneExtra: 8.0,
  },
  tamanhos: [
    { id: "p", nome: "Pequena (P)", valor: 15 },
    { id: "g", nome: "Grande (G)", valor: 20 },
  ],
  proteinas: [
    { nome: "Bife de Frango" },
    { nome: "Carne Cozida" },
    { nome: "Lombo" },
    { nome: "Strogonoff" },
    { nome: "Linguiça" },
  ],
  acompanhamentos: [
    "Arroz", "Feijão", "Angu", "Farofa", "Batata Ensopada", "Quiabo", "Almeirão Refogado", "Saladas",
  ],
  adicionais2: ["Arroz separado", "Molho extra", "Batata palha", "Queijo ralado"],
  carnesExtras8: ["Strogonoff extra", "Porção extra de carne", "Filé extra"],
  bebidas: [
    { nome: "Coca-Cola Lata", valor: 6.0, aliases: ["coca", "coca lata"] },
    { nome: "Guaraná Lata", valor: 6.0, aliases: ["guarana", "guaraná lata"] },
    { nome: "Coca-Cola 2L", valor: 16.0, aliases: ["coca 2l", "coca 2 litros"] },
    { nome: "Sprite Lata", valor: 6.0, aliases: ["sprite", "sprite lata"] },
    { nome: "Kuat Lata", valor: 6.0, aliases: ["kuat", "kuat lata"] },
    { nome: "Suco Kapo", valor: 3.5, aliases: ["suco kapo", "kapo", "suco caixinha", "caixinha"] },
    { nome: "Suco Lata", valor: 6.0, aliases: ["suco", "suco lata"] },
  ],
  presetsIOS: {
    opcao1: {
      label: "Opção 1",
      tamanho: "G",
      proteina: "Bife de Frango",
      acc: "Arroz, Feijão, Angu, Quiabo, Almeirão Refogado, Saladas",
      add2: "",
      add8: "",
      bebidas: "",
      obs: "",
    },
    opcao2: {
      label: "Opção 2",
      tamanho: "G",
      proteina: "Carne Cozida",
      acc: "Arroz, Feijão, Farofa, Batata Ensopada, Saladas",
      add2: "",
      add8: "",
      bebidas: "",
      obs: "",
    },
  },
  msg: {
    titulo: "🍱 Pedido de Marmitas",
    agradecimento: "Obrigada! 🙌",
    notaPIX: "Produção inicia após envio do comprovante PIX.",
    taxaAviso: "Taxa de entrega será calculada no WhatsApp conforme a região.",
  },
};
