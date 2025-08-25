// Funções utilitárias para modularização
export function formatCurrency(value) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function normalizeString(str) {
  return (str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
