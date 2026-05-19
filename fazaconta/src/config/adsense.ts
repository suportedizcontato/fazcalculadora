export const ADSENSE_CLIENT = "ca-pub-1829514870651624";

// Preencha com os IDs dos slots criados no painel do AdSense
// Painel: https://adsense.google.com → Anúncios → Por unidade de anúncio
export const ADSENSE_SLOTS = {
  horizontal: "",  // Unidade horizontal responsiva — entre título e formulário
  inContent: "",   // Unidade in-content — entre formulário e conteúdo editorial
  bottom: "",      // Unidade rodapé — fim da página
} as const;

export type AdSlot = keyof typeof ADSENSE_SLOTS;
